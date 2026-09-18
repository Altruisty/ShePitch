export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

// Target Team Information for pay_TZbb16CGD7BsRD
const TARGET_TEAM = {
  team_name: 'ImpactX',
  category: 'Idea Pitch',
  college_name: 'Ramco Institute of Technology',
  leader_name: 'VASANTH VAISNAVI T',
  leader_email: '953625148058@ritrjpm.ac.in',
  leader_phone: '9500865477',
  amount_paid: 398.0,
  payment_id: 'pay_TZbb16CGD7BsRD',
  project_title: 'NeedNear – Smart Community Help Platform',
  domain: 'SocialTech',
  project_description:
    'NeedNear is an AI-powered web platform that connects people who need local assistance with suitable, verified volunteers nearby. Users can post requests such as elderly assistance, medicine pickup, emergency support, transportation help, or other community needs. The platform uses AI-based urgency detection and smart matching to identify the most suitable available volunteer based on location, skills, availability, urgency, and trust score. The platform also provides real-time request tracking, volunteer trust scores, multilingual/voice-based requests, and automatic escalation when no suitable volunteer is available. This helps communities respond to genuine needs faster, more safely, and more efficiently.',
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
    addLog('info', `Starting payment verification and status sync...`);
    addLog('info', `Target Team: "${TARGET_TEAM.team_name}" | Leader: ${TARGET_TEAM.leader_email}`);
    addLog('info', `Target Payment ID: "${TARGET_TEAM.payment_id}" | Expected Amount: ₹${TARGET_TEAM.amount_paid}`);

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
    let orderId: string = `order_she_${TARGET_TEAM.payment_id.slice(-10)}`;

    if (teamRows && teamRows.length > 0) {
      const existing = teamRows[0];
      teamId = existing.id;
      orderId = existing.razorpay_order_id || orderId;

      addLog('info', `Found existing team record ID: #${teamId}`);
      addLog('info', `Current State: payment_status = "${existing.payment_status}", razorpay_payment_id = "${existing.razorpay_payment_id || 'N/A'}", amount_paid = ₹${existing.amount_paid}`);

      // Update team record to success with payment details
      await pool.query(
        `UPDATE she_pitch_teams 
         SET payment_status = 'success',
             razorpay_payment_id = ?,
             amount_paid = ?,
             category = ?,
             project_title = ?,
             domain = ?,
             project_description = ?,
             college_name = ?,
             leader_name = ?,
             leader_email = ?,
             leader_phone = ?,
             member_count = ?
         WHERE id = ?`,
        [
          TARGET_TEAM.payment_id,
          TARGET_TEAM.amount_paid,
          TARGET_TEAM.category,
          TARGET_TEAM.project_title,
          TARGET_TEAM.domain,
          TARGET_TEAM.project_description,
          TARGET_TEAM.college_name,
          TARGET_TEAM.leader_name,
          TARGET_TEAM.leader_email,
          TARGET_TEAM.leader_phone,
          TARGET_TEAM.members.length,
          teamId,
        ]
      );
      addLog('success', `Updated she_pitch_teams [ID #${teamId}]: payment_status set to 'success', payment_id set to "${TARGET_TEAM.payment_id}", amount_paid set to ₹${TARGET_TEAM.amount_paid}.`);
    } else {
      addLog('warn', `Team "${TARGET_TEAM.team_name}" was not found in she_pitch_teams. Creating new verified team entry...`);

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
      addLog('success', `Created new team record in she_pitch_teams with ID #${teamId} and payment_status = 'success'.`);
    }

    // Step 2: Manage she_pitch_payments entry
    const [paymentRows]: any = await pool.query(
      `SELECT * FROM she_pitch_payments 
       WHERE team_id = ? OR razorpay_payment_id = ? OR razorpay_order_id = ?
       LIMIT 1`,
      [teamId, TARGET_TEAM.payment_id, orderId]
    );

    if (paymentRows && paymentRows.length > 0) {
      await pool.query(
        `UPDATE she_pitch_payments 
         SET status = 'success', 
             razorpay_payment_id = ?, 
             amount = ?,
             team_id = ?
         WHERE id = ?`,
        [TARGET_TEAM.payment_id, TARGET_TEAM.amount_paid, teamId, paymentRows[0].id]
      );
      addLog('success', `Updated payment log in she_pitch_payments [ID #${paymentRows[0].id}] to status = 'success'.`);
    } else {
      await pool.query(
        `INSERT INTO she_pitch_payments 
         (team_id, razorpay_order_id, razorpay_payment_id, amount, status)
         VALUES (?, ?, ?, ?, 'success')`,
        [teamId, orderId, TARGET_TEAM.payment_id, TARGET_TEAM.amount_paid]
      );
      addLog('success', `Inserted new payment record in she_pitch_payments with status = 'success'.`);
    }

    // Step 3: Verify and sync all members in she_pitch_students
    const [existingStudents]: any = await pool.query(
      `SELECT * FROM she_pitch_students WHERE team_id = ?`,
      [teamId]
    );

    if (!existingStudents || existingStudents.length === 0) {
      addLog('info', `Inserting ${TARGET_TEAM.members.length} members into she_pitch_students for team ID #${teamId}...`);
      for (const m of TARGET_TEAM.members) {
        await pool.query(
          `INSERT INTO she_pitch_students 
           (team_id, student_name, email, phone, department, year_of_study, is_leader)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [teamId, m.student_name, m.email, m.phone, m.department, m.year_of_study, m.is_leader ? 1 : 0]
        );
      }
      addLog('success', `Successfully added all ${TARGET_TEAM.members.length} members (Leader: ${TARGET_TEAM.leader_name}) into she_pitch_students.`);
    } else {
      addLog('info', `Found ${existingStudents.length} student records for team #${teamId}. Verifying member list...`);
      for (const m of TARGET_TEAM.members) {
        const found = existingStudents.find(
          (s: any) => s.email?.toLowerCase().trim() === m.email.toLowerCase().trim()
        );
        if (found) {
          await pool.query(
            `UPDATE she_pitch_students 
             SET student_name = ?, phone = ?, department = ?, year_of_study = ?, is_leader = ?
             WHERE id = ?`,
            [m.student_name, m.phone, m.department, m.year_of_study, m.is_leader ? 1 : 0, found.id]
          );
        } else {
          await pool.query(
            `INSERT INTO she_pitch_students 
             (team_id, student_name, email, phone, department, year_of_study, is_leader)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [teamId, m.student_name, m.email, m.phone, m.department, m.year_of_study, m.is_leader ? 1 : 0]
          );
        }
      }
      addLog('success', `Verified and synced all ${TARGET_TEAM.members.length} student members in she_pitch_students.`);
    }

    // Step 4: Send registration confirmation email
    let emailStatus = 'pending';
    try {
      addLog('info', `Sending confirmation email to leader: ${TARGET_TEAM.leader_email}...`);
      await sendTeamConfirmationEmail({
        leaderName: TARGET_TEAM.leader_name,
        leaderEmail: TARGET_TEAM.leader_email,
        teamName: TARGET_TEAM.team_name,
        category: TARGET_TEAM.category,
        collegeName: TARGET_TEAM.college_name,
        amountPaid: TARGET_TEAM.amount_paid,
        paymentId: TARGET_TEAM.payment_id,
        projectTitle: TARGET_TEAM.project_title,
        domain: TARGET_TEAM.domain,
        projectDescription: TARGET_TEAM.project_description,
        members: TARGET_TEAM.members,
      });
      emailStatus = 'sent';
      addLog('success', `Confirmation email successfully sent to ${TARGET_TEAM.leader_email}.`);
    } catch (mailErr: any) {
      emailStatus = 'failed';
      addLog('warn', `Email dispatch skipped or encountered an error: ${mailErr.message}. (Database record is still successfully updated!)`);
    }

    // Step 5: Final query to return verified state
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

    addLog('success', `Status verification finished: Team "${TARGET_TEAM.team_name}" is now CONFIRMED & SUCCESS!`);

    return NextResponse.json({
      success: true,
      message: `Team "${TARGET_TEAM.team_name}" status has been successfully updated to Success with payment ID ${TARGET_TEAM.payment_id}`,
      team: finalTeam,
      emailStatus,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Execution failed with error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during team verification',
        logs,
      },
      { status: 500 }
    );
  }
}
