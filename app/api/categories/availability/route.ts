import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

const MAX_IDEA_PITCH = 70;
const MAX_PROJECT_PITCH = 50;

export async function GET() {
  try {
    await initDatabase();

    const [rows]: any = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM she_pitch_teams 
       WHERE payment_status = 'success' 
       GROUP BY category`
    );

    let ideaCount = 0;
    let projectCount = 0;

    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row.category === 'Idea Pitch') {
          ideaCount = Number(row.count) || 0;
        } else if (row.category === 'Project Pitch') {
          projectCount = Number(row.count) || 0;
        }
      }
    }

    // Default to 16 if no records yet or calculate remaining slots based on limits
    const ideaTeamsLeft = ideaCount > 0 ? Math.max(0, MAX_IDEA_PITCH - ideaCount) : 16;
    const projectTeamsLeft = projectCount > 0 ? Math.max(0, MAX_PROJECT_PITCH - projectCount) : 16;

    return NextResponse.json({
      success: true,
      ideaTeamsLeft,
      projectTeamsLeft,
      ideaOpen: ideaTeamsLeft > 0,
      projectOpen: projectTeamsLeft > 0,
    });
  } catch (error: any) {
    // Fallback gracefully on any database or network issue
    return NextResponse.json({
      success: true,
      ideaTeamsLeft: 16,
      projectTeamsLeft: 16,
      ideaOpen: true,
      projectOpen: true,
    });
  }
}
