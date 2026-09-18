export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

// Target Team Information for Bytestrom (Leader: Vaishali I)
const TARGET_TEAM = {
  team_name: 'Bytestrom',
  category: 'Project Pitch',
  college_name: 'Sri Venkateshwaraa College of Engineering and Technology',
  leader_name: 'Vaishali I',
  leader_email: 'vaishali24td0852@svcet.ac.in',
  leader_phone: '9600805734',
  amount_paid: 796.0,
  payment_id: 'pay_TXaiDvC9m9PsEa',
  project_title: 'VOICE4HEALTH : AI-Powered Voice Healthcare for Every Phone — Enable From the First Call',
  domain: 'Health care',
  project_description:
    'AI-Powered Voice Healthcare for Every Phone — Enable From the First Call Voice4Health is an AI-powered, voice-first healthcare system designed to provide accessible preliminary healthcare screening through a basic phone by calling 103, without requiring a smartphone, continuous internet access, or advanced digital literacy. The system supports multilingual voice interaction, including English and 11 Indian languages, and uses IVR, speech recognition, language processing, Voice AI, patient information collection, symptom screening, and adaptive questioning to understand the patient\'s health concerns. After confirmation, a preliminary risk engine classifies cases as low, medium, or high risk, with low- and medium-risk cases referred to the PHC and high-risk cases urgently referred to ASHA and PHC, while **all cases undergo doctor review and the doctor makes the final clinical decision. The system also supports prescription information, medication reminders, appointment reminders, and patient follow-up, with privacy, consent, security, and role-based access as key principles. The current prototype demonstrates this end-to-end workflow through a web-based interface, while future deployment would require clinical validation, regulatory compliance, secure infrastructure, and integration with authorized healthcare systems.',
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
    addLog('info', `Starting college name update for team "${TARGET_TEAM.team_name}"...`);
    addLog('info', `Target Leader: ${TARGET_TEAM.leader_email} | Payment ID: ${TARGET_TEAM.payment_id}`);
    addLog('info', `New College Name: "${TARGET_TEAM.college_name}"`);

    // Ensure database tables exist
    await initDatabase();
    addLog('info', 'Database initialized and connection verified.');

    // Step 1: Query she_pitch_teams matching leader email, payment ID, or team name
    const [teamRows]: any = await pool.query(
      `SELECT * FROM she_pitch_teams 
       WHERE LOWER(TRIM(leader_email)) = LOWER(?) 
          OR razorpay_payment_id = ?
          OR LOWER(TRIM(team_name)) = LOWER(?)
       ORDER BY id DESC LIMIT 1`,
      [TARGET_TEAM.leader_email.trim(), TARGET_TEAM.payment_id, TARGET_TEAM.team_name.trim()]
    );

    let teamId: number;

    if (teamRows && teamRows.length > 0) {
      const existing = teamRows[0];
      teamId = existing.id;

      addLog('info', `Found existing team record ID: #${teamId} ("${existing.team_name}")`);
      addLog('info', `Previous College Name: "${existing.college_name || 'N/A'}"`);

      // Update ONLY college_name as requested
      await pool.query(
        `UPDATE she_pitch_teams 
         SET college_name = ?
         WHERE id = ?`,
        [TARGET_TEAM.college_name, teamId]
      );
      addLog('success', `Updated she_pitch_teams [ID #${teamId}]: College Name successfully set to "${TARGET_TEAM.college_name}".`);
      addLog('info', `Preserved all existing pitch proposal, members, and payment details.`);
    } else {
      addLog('warn', `Team was not found in she_pitch_teams. Creating entry with college "${TARGET_TEAM.college_name}"...`);

      const orderId = `order_she_${TARGET_TEAM.payment_id.slice(-10)}`;
      const [insertRes]: any = await pool.query(
        `INSERT INTO she_pitch_teams 
         (team_name, category, project_title, domain, project_description, college_name, leader_name, leader_email, leader_phone, member_count, amount_paid, payment_status, razorpay_order_id, razorpay_payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 4, ?, 'success', ?, ?)`,
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
          TARGET_TEAM.amount_paid,
          orderId,
          TARGET_TEAM.payment_id,
        ]
      );

      teamId = insertRes.insertId;
      addLog('success', `Created team record in she_pitch_teams with ID #${teamId}.`);
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

    addLog('success', `College update completed successfully! Team "${TARGET_TEAM.team_name}" is now associated with "${TARGET_TEAM.college_name}".`);

    return NextResponse.json({
      success: true,
      message: `Team "${TARGET_TEAM.team_name}" college name has been updated to "${TARGET_TEAM.college_name}" successfully.`,
      team: finalTeam,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Execution failed with error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during college name update',
        logs,
      },
      { status: 500 }
    );
  }
}
