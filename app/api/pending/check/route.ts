export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

// Target Team Information for She Builds (Leader: S.SWATHY)
const TARGET_TEAM = {
  team_name: 'She Builds',
  category: 'Project Pitch',
  college_name: 'SRI VENKATESHWARA COLLEGE OF ENGINEERING',
  leader_name: 'S.SWATHY',
  leader_email: 'swathy25tp0444@svcet.ac.in',
  leader_phone: '8438321499',
  amount_paid: 398.0,
  payment_id: 'pay_TXc8rBRAUUeV6z',
  project_title: 'Smart Nacro AI field drug detection & blockchain system',
  domain: 'Artificial Intelligence, Computer Vision & Blockchain',
  project_description:
    'This project integrates AI and Computer Vision to detect narcotic substances in real-time at field locations, while a blockchain network ensures tamper-proof, secure storage of detection records and chain-of-custody. A Digital Twin of each seized sample preserves its chemical and visual signature as legally valid digital evidence, and Predictive Analytics on historical blockchain data helps identify likely trafficking hotspots and trails. Together, this creates an intelligent, transparent, and proactive system for narcotics detection and enforcement.',
  members: [
    {
      student_name: 'S.SWATHY',
      email: 'swathy25tp0444@svcet.ac.in',
      phone: '8438321499',
      department: 'B.Tech-AI&DS',
      year_of_study: '2nd Year',
      is_leader: true,
    },
    {
      student_name: 'J.Oviya',
      email: 'oviya25tp0426@svcet.ac.in',
      phone: '8072706014',
      department: 'B.Tech-AI&DS',
      year_of_study: '2nd Year',
      is_leader: false,
    },
  ],
};

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export async function GET(req: Request) {
  return handleVerification(req);
}

export async function POST(req: Request) {
  return handleVerification(req);
}

async function handleVerification(req: Request) {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      level,
      message,
    });
  };

  try {
    addLog('info', `Starting pitch details update for team "${TARGET_TEAM.team_name}"...`);
    addLog('info', `Leader: ${TARGET_TEAM.leader_email} | Payment ID: ${TARGET_TEAM.payment_id}`);

    // Ensure database tables exist
    await initDatabase();
    addLog('info', 'Database initialized and connection verified.');

    // Step 1: Query she_pitch_teams for the specific team
    const [teamRows]: any = await pool.query(
      `SELECT * FROM she_pitch_teams 
       WHERE LOWER(TRIM(team_name)) = LOWER(?) 
          OR LOWER(TRIM(leader_email)) = LOWER(?)
       ORDER BY id DESC LIMIT 1`,
      [TARGET_TEAM.team_name.trim(), TARGET_TEAM.leader_email.trim()]
    );

    let teamId: number;

    if (teamRows && teamRows.length > 0) {
      const existing = teamRows[0];
      teamId = existing.id;

      addLog('info', `Found existing team record ID: #${teamId}`);
      addLog('info', `Previous Pitch Title: "${existing.project_title || 'N/A'}"`);
      addLog('info', `Previous Domain: "${existing.domain || 'N/A'}"`);

      // Update ONLY project_title, domain, and project_description as requested
      await pool.query(
        `UPDATE she_pitch_teams 
         SET project_title = ?,
             domain = ?,
             project_description = ?
         WHERE id = ?`,
        [
          TARGET_TEAM.project_title,
          TARGET_TEAM.domain,
          TARGET_TEAM.project_description,
          teamId,
        ]
      );
      addLog('success', `Updated she_pitch_teams [ID #${teamId}]: New Title -> "${TARGET_TEAM.project_title}".`);
      addLog('success', `Updated Domain -> "${TARGET_TEAM.domain}".`);
      addLog('success', `Updated Description -> "${TARGET_TEAM.project_description.slice(0, 80)}..."`);
    } else {
      addLog('warn', `Team "${TARGET_TEAM.team_name}" was not found in she_pitch_teams. Creating team entry with new pitch proposal...`);

      const orderId = `order_she_${TARGET_TEAM.payment_id.slice(-10)}`;
      const [insertRes]: any = await pool.query(
        `INSERT INTO she_pitch_teams 
         (team_name, category, project_title, domain, project_description, college_name, leader_name, leader_email, leader_phone, member_count, amount_paid, payment_status, razorpay_order_id, razorpay_payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'success', ?, ?)`,
        [
          TARGET_TEAM.team_name,
          TARGET_TEAM.category,
          TARGET_TEAM.project_title,
          TARGET_TEAM.domain,
          TARGET_TEAM.project_description,
          TARGET_TEAM.college_name,
          TARGET_TEAM.leader_name,
          TARGET_TEAM.leader_email,
          TARGET_TEAM.leader_phone,
          TARGET_TEAM.members.length,
          TARGET_TEAM.amount_paid,
          orderId,
          TARGET_TEAM.payment_id,
        ]
      );

      teamId = insertRes.insertId;
      addLog('success', `Created team record in she_pitch_teams with ID #${teamId} with new pitch proposal.`);
    }

    // Step 2: Final query to return verified state
    const [finalTeamRows]: any = await pool.query(
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
       WHERE t.id = ?
       GROUP BY t.id`,
      [teamId]
    );

    const finalTeam = finalTeamRows[0];
    if (finalTeam && typeof finalTeam.members === 'string') {
      try {
        finalTeam.members = JSON.parse(finalTeam.members);
      } catch {}
    }

    addLog('success', `Pitch proposal update completed successfully for Team "${TARGET_TEAM.team_name}"!`);

    return NextResponse.json({
      success: true,
      message: `Team "${TARGET_TEAM.team_name}" pitch title, domain, and description have been updated successfully.`,
      team: finalTeam,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Execution failed with error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during pitch update',
        logs,
      },
      { status: 500 }
    );
  }
}
