import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await initDatabase();

    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get('category');
    const collegeFilter = searchParams.get('college');
    const searchQuery = searchParams.get('search');
    const deduplicate = searchParams.get('deduplicate') !== 'false'; // default true

    // Query for teams that have NOT successfully paid, strictly excluding:
    // 1. Any team where leader_email has ANY successful registration
    // 2. Any team where team_name has ANY successful registration
    // 3. Any team where leader_phone has ANY successful registration
    // 4. Any team where ANY member has successfully registered in ANY paid team
    let teamsQuery = `
      SELECT 
        t.id,
        t.team_name,
        t.category,
        t.project_title,
        t.domain,
        t.project_description,
        t.college_id,
        t.college_name,
        t.leader_name,
        t.leader_email,
        t.leader_phone,
        t.member_count,
        t.coupon_code,
        t.amount_paid,
        t.payment_status,
        t.razorpay_order_id,
        t.created_at
      FROM she_pitch_teams t
      WHERE t.payment_status != 'success'
        AND LOWER(TRIM(t.leader_email)) NOT IN (
          SELECT DISTINCT LOWER(TRIM(leader_email)) 
          FROM she_pitch_teams 
          WHERE payment_status = 'success' 
            AND leader_email IS NOT NULL 
            AND TRIM(leader_email) != ''
        )
        AND LOWER(TRIM(t.team_name)) NOT IN (
          SELECT DISTINCT LOWER(TRIM(team_name)) 
          FROM she_pitch_teams 
          WHERE payment_status = 'success' 
            AND team_name IS NOT NULL 
            AND TRIM(team_name) != ''
        )
        AND (
          t.leader_phone IS NULL 
          OR TRIM(t.leader_phone) = '' 
          OR TRIM(t.leader_phone) NOT IN (
            SELECT DISTINCT TRIM(leader_phone) 
            FROM she_pitch_teams 
            WHERE payment_status = 'success' 
              AND leader_phone IS NOT NULL 
              AND TRIM(leader_phone) != ''
          )
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM she_pitch_students s_unpaid
          JOIN she_pitch_students s_paid ON LOWER(TRIM(s_unpaid.email)) = LOWER(TRIM(s_paid.email))
          JOIN she_pitch_teams t_paid ON s_paid.team_id = t_paid.id
          WHERE s_unpaid.team_id = t.id 
            AND t_paid.payment_status = 'success'
            AND s_unpaid.email IS NOT NULL 
            AND TRIM(s_unpaid.email) != ''
        )
    `;

    const queryParams: any[] = [];

    if (categoryFilter && categoryFilter !== 'all') {
      teamsQuery += ` AND t.category = ?`;
      queryParams.push(categoryFilter);
    }

    if (collegeFilter && collegeFilter !== 'all') {
      teamsQuery += ` AND (t.college_id = ? OR t.college_name = ?)`;
      queryParams.push(collegeFilter, collegeFilter);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const term = `%${searchQuery.trim()}%`;
      teamsQuery += ` AND (t.team_name LIKE ? OR t.leader_name LIKE ? OR t.leader_email LIKE ? OR t.college_name LIKE ? OR t.leader_phone LIKE ?)`;
      queryParams.push(term, term, term, term, term);
    }

    teamsQuery += ` ORDER BY t.created_at DESC, t.id DESC`;

    const [teamRows]: any = await pool.query(teamsQuery, queryParams);
    const rawTeams = Array.isArray(teamRows) ? teamRows : [];

    if (rawTeams.length === 0) {
      return NextResponse.json({
        success: true,
        totalCount: 0,
        uniqueCount: 0,
        teams: [],
      });
    }

    // Fetch members for all identified unpaid teams
    const teamIds = rawTeams.map((t: any) => t.id);
    let memberRows: any[] = [];
    if (teamIds.length > 0) {
      const [members]: any = await pool.query(
        `SELECT id, team_id, student_name, email, phone, department, year_of_study, is_leader 
         FROM she_pitch_students 
         WHERE team_id IN (?) 
         ORDER BY is_leader DESC, id ASC`,
        [teamIds]
      );
      memberRows = Array.isArray(members) ? members : [];
    }

    // Map members to their teams
    const membersByTeamId = new Map<number, any[]>();
    for (const m of memberRows) {
      if (!membersByTeamId.has(m.team_id)) {
        membersByTeamId.set(m.team_id, []);
      }
      membersByTeamId.get(m.team_id)!.push(m);
    }

    const populatedTeams = rawTeams.map((t: any) => ({
      ...t,
      members: membersByTeamId.get(t.id) || [],
    }));

    // Deduplicate if requested: group by leader email / team name, keeping the latest attempt
    let finalTeams = populatedTeams;
    if (deduplicate) {
      const seenLeads = new Map<string, { team: any; attemptCount: number }>();
      for (const t of populatedTeams) {
        const key = `${(t.leader_email || '').toLowerCase().trim()}||${(t.team_name || '').toLowerCase().trim()}`;
        if (!seenLeads.has(key)) {
          seenLeads.set(key, { team: t, attemptCount: 1 });
        } else {
          seenLeads.get(key)!.attemptCount += 1;
        }
      }

      finalTeams = Array.from(seenLeads.values()).map(({ team, attemptCount }) => ({
        ...team,
        attemptCount,
      }));
    }

    // Calculate summary statistics
    const stats = {
      totalUnpaidTeams: finalTeams.length,
      totalRawAttempts: rawTeams.length,
      totalPendingRevenue: finalTeams.reduce((sum, t) => sum + (Number(t.amount_paid) || 0), 0),
      ideaCount: finalTeams.filter((t) => t.category === 'Idea Pitch').length,
      projectCount: finalTeams.filter((t) => t.category === 'Project Pitch').length,
      totalMembers: finalTeams.reduce((sum, t) => sum + (t.members?.length || t.member_count || 2), 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      teams: finalTeams,
    });
  } catch (error: any) {
    console.error('Error fetching strictly unpaid pending teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error while fetching pending teams',
      },
      { status: 500 }
    );
  }
}
