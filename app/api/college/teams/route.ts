import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCollegeSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getCollegeSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    // Query ONLY confirmed/success teams for this college
    const [rows]: any = await pool.query(
      `SELECT t.*, 
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
              ) as members
       FROM she_pitch_teams t
       LEFT JOIN she_pitch_students s ON t.id = s.team_id
       WHERE (t.college_name = ? OR t.college_id = ?) AND t.payment_status = 'success'
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [session.college_name, session.id]
    );

    return NextResponse.json({
      success: true,
      college_name: session.college_name,
      rep_name: session.rep_name,
      teams: rows || [],
    });
  } catch (error: any) {
    console.error('Error fetching college teams:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
