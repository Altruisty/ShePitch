import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const category = searchParams.get('category')?.trim() || 'all';
    const college = searchParams.get('college')?.trim() || 'all';
    const dedup = searchParams.get('dedup') !== 'false'; // default true

    // Query all pending teams where neither the leader, team name, leader phone,
    // nor any team member has completed payment in any successful team registration.
    const query = `
      SELECT t.*,
             (
               SELECT COUNT(*) 
               FROM she_pitch_teams dup 
               WHERE dup.payment_status = 'pending'
                 AND (
                   (dup.leader_email IS NOT NULL AND dup.leader_email != '' AND LOWER(TRIM(dup.leader_email)) = LOWER(TRIM(t.leader_email)))
                   OR (dup.team_name IS NOT NULL AND dup.team_name != '' AND LOWER(TRIM(dup.team_name)) = LOWER(TRIM(t.team_name)))
                 )
             ) AS attempt_count,
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', s.id,
                 'student_name', s.student_name,
                 'email', s.email,
                 'phone', s.phone,
                 'department', s.department,
                 'year_of_study', s.year_of_study,
                 'is_leader', s.is_leader
               )
             ) AS members
      FROM she_pitch_teams t
      LEFT JOIN she_pitch_students s ON t.id = s.team_id
      WHERE t.payment_status = 'pending'
        -- 1. Exclude if any successful team exists with same leader email, team name, or phone
        AND NOT EXISTS (
          SELECT 1 FROM she_pitch_teams st
          WHERE st.payment_status = 'success'
            AND (
              (st.leader_email IS NOT NULL AND st.leader_email != '' AND LOWER(TRIM(st.leader_email)) = LOWER(TRIM(t.leader_email)))
              OR (st.team_name IS NOT NULL AND st.team_name != '' AND LOWER(TRIM(st.team_name)) = LOWER(TRIM(t.team_name)))
              OR (st.leader_phone IS NOT NULL AND st.leader_phone != '' AND TRIM(st.leader_phone) = TRIM(t.leader_phone))
            )
        )
        -- 2. Exclude if any member in this team is already registered in a SUCCESSFUL team
        AND NOT EXISTS (
          SELECT 1 FROM she_pitch_students sm
          JOIN she_pitch_teams st ON sm.team_id = st.id
          WHERE st.payment_status = 'success'
            AND sm.email IS NOT NULL 
            AND sm.email != ''
            AND LOWER(TRIM(sm.email)) IN (
              SELECT LOWER(TRIM(inner_s.email)) 
              FROM she_pitch_students inner_s 
              WHERE inner_s.team_id = t.id AND inner_s.email IS NOT NULL AND inner_s.email != ''
            )
        )
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const [rows]: any = await pool.query(query);
    let allPendingTeams = Array.isArray(rows) ? rows : [];

    // Parse members JSON if MySQL returned it as a string
    allPendingTeams = allPendingTeams.map((team: any) => {
      let parsedMembers = [];
      if (typeof team.members === 'string') {
        try {
          parsedMembers = JSON.parse(team.members);
        } catch {
          parsedMembers = [];
        }
      } else if (Array.isArray(team.members)) {
        parsedMembers = team.members;
      }
      // Filter out null member objects created by LEFT JOIN if team had no student rows
      parsedMembers = parsedMembers.filter((m: any) => m && m.student_name);
      return {
        ...team,
        members: parsedMembers,
      };
    });

    // Handle deduplication (collapsing multiple pending attempts by the same team/leader)
    let processedTeams = allPendingTeams;
    if (dedup) {
      const seenMap = new Map<string, any>();
      for (const team of allPendingTeams) {
        // Unique key by email or team name
        const key = (team.leader_email?.toLowerCase().trim()) || (team.team_name?.toLowerCase().trim()) || `id_${team.id}`;
        if (!seenMap.has(key)) {
          seenMap.set(key, team);
        }
      }
      processedTeams = Array.from(seenMap.values());
    }

    // Apply in-memory filters for search, category, college
    let filteredTeams = processedTeams;

    if (category !== 'all') {
      filteredTeams = filteredTeams.filter((t: any) => t.category === category);
    }

    if (college !== 'all') {
      filteredTeams = filteredTeams.filter((t: any) => t.college_name === college || String(t.college_id) === college);
    }

    if (search) {
      filteredTeams = filteredTeams.filter((t: any) => {
        const matchBasic =
          t.team_name?.toLowerCase().includes(search) ||
          t.leader_name?.toLowerCase().includes(search) ||
          t.leader_email?.toLowerCase().includes(search) ||
          t.leader_phone?.toLowerCase().includes(search) ||
          t.college_name?.toLowerCase().includes(search) ||
          t.project_title?.toLowerCase().includes(search) ||
          t.domain?.toLowerCase().includes(search);

        const matchMembers = t.members?.some(
          (m: any) =>
            m.student_name?.toLowerCase().includes(search) ||
            m.email?.toLowerCase().includes(search) ||
            m.phone?.toLowerCase().includes(search) ||
            m.department?.toLowerCase().includes(search)
        );

        return matchBasic || matchMembers;
      });
    }

    // Compute stats
    const totalPendingAttempts = allPendingTeams.length;
    const uniqueUnpaidCount = new Set(
      allPendingTeams.map((t: any) => (t.leader_email?.toLowerCase().trim()) || (t.team_name?.toLowerCase().trim()))
    ).size;
    const ideaPitchCount = filteredTeams.filter((t: any) => t.category === 'Idea Pitch').length;
    const projectPitchCount = filteredTeams.filter((t: any) => t.category === 'Project Pitch').length;
    
    // Unique colleges represented
    const uniqueColleges = Array.from(
      new Set(allPendingTeams.map((t: any) => t.college_name).filter(Boolean))
    ).sort();

    return NextResponse.json({
      success: true,
      stats: {
        totalRecords: filteredTeams.length,
        totalAttempts: totalPendingAttempts,
        uniqueUnpaidTeams: uniqueUnpaidCount,
        ideaPitchCount,
        projectPitchCount,
        totalColleges: uniqueColleges.length,
      },
      colleges: uniqueColleges,
      teams: filteredTeams,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
