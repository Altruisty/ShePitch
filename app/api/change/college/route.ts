import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export async function GET(req: Request) {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      message,
    });
  };

  try {
    addLog('info', 'Connecting to database and initializing tables...');
    await initDatabase();

    const { searchParams } = new URL(req.url);
    const targetColleges = ['siva', 'mathiyas', 'mathias'];
    const customQuery = searchParams.get('query')?.trim().toLowerCase();

    const searchTerms = customQuery ? [customQuery] : targetColleges;

    addLog('info', `Searching for registered teams matching college keywords: ${searchTerms.join(', ')}...`);

    // Build SQL condition
    const whereConditions = searchTerms.map(() => `LOWER(college_name) LIKE ?`).join(' OR ');
    const queryParams = searchTerms.map((term) => `%${term}%`);

    const [teams]: any = await pool.query(
      `SELECT id, team_name, college_name, leader_name, leader_email, payment_status, created_at 
       FROM she_pitch_teams 
       WHERE ${whereConditions}`,
      queryParams
    );

    if (!teams || teams.length === 0) {
      addLog('warn', `No teams found for college keywords: ${searchTerms.join(', ')}.`);
      return NextResponse.json({
        success: true,
        message: 'No matching teams found to remove.',
        teamsRemoved: 0,
        studentsRemoved: 0,
        logs,
        teams: [],
      });
    }

    addLog('info', `Found ${teams.length} matching team(s):`);
    teams.forEach((t: any) => {
      addLog(
        'info',
        ` -> Team ID #${t.id}: "${t.team_name}" | College: "${t.college_name}" | Leader: ${t.leader_name} (${t.leader_email})`
      );
    });

    const teamIds = teams.map((t: any) => t.id);

    // Count students before deletion
    const [studentRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM she_pitch_students WHERE team_id IN (?)`,
      [teamIds]
    );
    const studentCount = studentRows[0]?.count || 0;

    // 1. Delete students
    addLog('info', `Deleting ${studentCount} student member record(s) associated with Team IDs [${teamIds.join(', ')}]...`);
    const [studentDelResult]: any = await pool.query(
      `DELETE FROM she_pitch_students WHERE team_id IN (?)`,
      [teamIds]
    );
    addLog('success', `Deleted ${studentDelResult.affectedRows || 0} student record(s) from she_pitch_students.`);

    // 2. Delete payment records
    addLog('info', `Deleting associated payment log records for Team IDs [${teamIds.join(', ')}]...`);
    const [payDelResult]: any = await pool.query(
      `DELETE FROM she_pitch_payments WHERE team_id IN (?)`,
      [teamIds]
    );
    addLog('success', `Deleted ${payDelResult.affectedRows || 0} payment log record(s) from she_pitch_payments.`);

    // 3. Delete teams
    addLog('info', `Deleting team records for Team IDs [${teamIds.join(', ')}] from she_pitch_teams...`);
    const [teamDelResult]: any = await pool.query(
      `DELETE FROM she_pitch_teams WHERE id IN (?)`,
      [teamIds]
    );
    addLog('success', `Successfully removed ${teamDelResult.affectedRows || 0} team(s) from database.`);

    addLog('success', 'College teams removal operation completed successfully.');

    return NextResponse.json({
      success: true,
      teamsRemoved: teamDelResult.affectedRows || 0,
      studentsRemoved: studentDelResult.affectedRows || 0,
      removedTeamsList: teams,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Critical Error during college teams removal: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        logs,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
