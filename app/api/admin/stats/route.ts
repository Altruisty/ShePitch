import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    // 1. Total Successful Teams
    const [teamCountRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM she_pitch_teams WHERE payment_status = 'success'`
    );
    const totalTeams = teamCountRows[0].count || 0;

    // 2. Successful Revenue
    const [revenueRows]: any = await pool.query(
      `SELECT SUM(amount_paid) as total FROM she_pitch_teams WHERE payment_status = 'success'`
    );
    const totalRevenue = revenueRows[0].total || 0;

    // 3. Total Colleges (with at least 1 confirmed team, or total colleges in database)
    const [collegeCountRows]: any = await pool.query(`SELECT COUNT(*) as count FROM she_pitch_colleges`);
    const totalColleges = collegeCountRows[0].count || 0;

    // 4. Total Students (belonging ONLY to teams with payment_status = 'success')
    const [studentCountRows]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM she_pitch_students s 
       JOIN she_pitch_teams t ON s.team_id = t.id 
       WHERE t.payment_status = 'success'`
    );
    const totalStudents = studentCountRows[0].count || 0;

    // 5. Payment Status breakdown (all statuses for log breakdown)
    const [statusRows]: any = await pool.query(
      `SELECT payment_status, COUNT(*) as count FROM she_pitch_teams GROUP BY payment_status`
    );

    // 6. Category breakdown (ONLY for confirmed success teams)
    const [categoryRows]: any = await pool.query(
      `SELECT category, COUNT(*) as count FROM she_pitch_teams WHERE payment_status = 'success' GROUP BY category`
    );

    // 7. Recent registrations (last 5)
    const [recentTeams]: any = await pool.query(
      `SELECT id, team_name, category, college_name, leader_name, amount_paid, payment_status, created_at FROM she_pitch_teams ORDER BY created_at DESC LIMIT 5`
    );

    // 8. College Participation Breakdown (Sorted in Ascending order by College Name)
    const [collegeStats]: any = await pool.query(
      `SELECT 
         t.college_name,
         COUNT(DISTINCT t.id) AS total_teams,
         COUNT(s.id) AS total_students
       FROM she_pitch_teams t
       LEFT JOIN she_pitch_students s ON s.team_id = t.id
       WHERE t.college_name IS NOT NULL AND t.college_name != ''
       GROUP BY t.college_name
       ORDER BY t.college_name ASC`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalTeams,
        totalRevenue,
        totalColleges,
        totalStudents,
        statusBreakdown: statusRows,
        categoryBreakdown: categoryRows,
        recentTeams,
        collegeStats: collegeStats || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
