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

    // 1. Total Teams
    const [teamCountRows]: any = await pool.query(`SELECT COUNT(*) as count FROM she_pitch_teams`);
    const totalTeams = teamCountRows[0].count;

    // 2. Successful Revenue
    const [revenueRows]: any = await pool.query(
      `SELECT SUM(amount_paid) as total FROM she_pitch_teams WHERE payment_status = 'success'`
    );
    const totalRevenue = revenueRows[0].total || 0;

    // 3. Total Colleges
    const [collegeCountRows]: any = await pool.query(`SELECT COUNT(*) as count FROM she_pitch_colleges`);
    const totalColleges = collegeCountRows[0].count;

    // 4. Total Students
    const [studentCountRows]: any = await pool.query(`SELECT COUNT(*) as count FROM she_pitch_students`);
    const totalStudents = studentCountRows[0].count;

    // 5. Payment Status breakdown
    const [statusRows]: any = await pool.query(
      `SELECT payment_status, COUNT(*) as count FROM she_pitch_teams GROUP BY payment_status`
    );

    // 6. Category breakdown
    const [categoryRows]: any = await pool.query(
      `SELECT category, COUNT(*) as count FROM she_pitch_teams GROUP BY category`
    );

    // 7. Recent registrations (last 5)
    const [recentTeams]: any = await pool.query(
      `SELECT id, team_name, category, college_name, leader_name, amount_paid, payment_status, created_at FROM she_pitch_teams ORDER BY created_at DESC LIMIT 5`
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
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
