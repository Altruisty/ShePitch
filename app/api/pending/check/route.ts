export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

// Target Team Information for Edvora (previously HelpNova / ImpactX)
const TARGET_TEAM = {
  team_name: 'Edvora',
  category: 'Idea Pitch',
  college_name: 'Ramco Institute of Technology',
  leader_name: 'VASANTH VAISNAVI T',
  leader_email: '953625148058@ritrjpm.ac.in',
  leader_phone: '9500865477',
  amount_paid: 398.0,
  payment_id: 'pay_TZbb16CGD7BsRD',
  project_title: 'LearnLoop AI',
  domain: 'Education & Smart Library',
  project_description:
    'LearnLoop AI is an AI-powered active learning platform that transforms syllabi, exam topics, books, and knowledge content into short, visual, interactive, and personalized learning experiences. Students and exam aspirants can learn through 3–5 minute AI-generated lessons, interactive quizzes, voice-based answers, teach-back activities, adaptive recommendations, and gamified progress with XP and levels. The Smart Library module converts books and knowledge topics into simple visual stories, short episodes, audio explanations, timelines, and multilingual content. Voice-first and age-adaptive features make knowledge more accessible to children, adults, and senior users. Instead of simply watching or reading content, LearnLoop AI helps users learn, recall, explain, practice, and improve.',
  members: [
    {
      student_name: 'VASANTH VAISNAVI T',
      email: '953625148058@ritrjpm.ac.in',
      phone: '9500865477',
      department: 'CSE(AIML)',
      year_of_study: '2nd Year',
      is_leader: true,
    },
    {
      student_name: 'Ramalakshmi S',
      email: '953625148042@ritrjpm.ac.in',
      phone: '8754966378',
      department: 'CSE(AIML)',
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
    addLog('info', `Starting update for team (Leader: ${TARGET_TEAM.leader_email})...`);
    addLog('info', `Updating Team Name -> "${TARGET_TEAM.team_name}"`);
    addLog('info', `Updating Pitch Title -> "${TARGET_TEAM.project_title}"`);
    addLog('info', `Updating Domain -> "${TARGET_TEAM.domain}"`);

    // Ensure database tables exist
    await initDatabase();
    addLog('info', 'Database initialized and connection verified.');

    // Step 1: Query she_pitch_teams matching leader email, payment ID, or previous names
    const [teamRows]: any = await pool.query(
      `SELECT * FROM she_pitch_teams 
       WHERE LOWER(TRIM(leader_email)) = LOWER(?) 
          OR razorpay_payment_id = ?
          OR LOWER(TRIM(team_name)) IN ('helpnova', 'impactx', 'edvora')
       ORDER BY id DESC LIMIT 1`,
      [TARGET_TEAM.leader_email.trim(), TARGET_TEAM.payment_id]
    );

    let teamId: number;

    if (teamRows && teamRows.length > 0) {
      const existing = teamRows[0];
      teamId = existing.id;

      addLog('info', `Found existing team record ID: #${teamId} (Previous Name: "${existing.team_name}")`);
      addLog('info', `Previous Pitch Title: "${existing.project_title || 'N/A'}"`);
      addLog('info', `Previous Domain: "${existing.domain || 'N/A'}"`);

      // Update team_name, project_title, domain, and project_description as requested
      await pool.query(
        `UPDATE she_pitch_teams 
         SET team_name = ?,
             project_title = ?,
             domain = ?,
             project_description = ?
         WHERE id = ?`,
        [
          TARGET_TEAM.team_name,
          TARGET_TEAM.project_title,
          TARGET_TEAM.domain,
          TARGET_TEAM.project_description,
          teamId,
        ]
      );
      addLog('success', `Updated she_pitch_teams [ID #${teamId}]: Team Name set to "${TARGET_TEAM.team_name}".`);
      addLog('success', `Updated Pitch Title set to "${TARGET_TEAM.project_title}".`);
      addLog('success', `Updated Domain set to "${TARGET_TEAM.domain}".`);
      addLog('success', `Updated Description set to "${TARGET_TEAM.project_description.slice(0, 80)}..."`);
    } else {
      addLog('warn', `Team was not found. Creating new entry with name "${TARGET_TEAM.team_name}"...`);

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

    addLog('success', `Update completed successfully! Team is now "${TARGET_TEAM.team_name}" with title "${TARGET_TEAM.project_title}".`);

    return NextResponse.json({
      success: true,
      message: `Team name changed to "${TARGET_TEAM.team_name}" and pitch details updated successfully.`,
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
