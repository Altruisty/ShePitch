import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

const TARGET_TEAMS = [
  {
    email: 'kavyashree0521@gmail.com',
    teamName: 'Techtonic',
    paymentId: 'pay_TWHhyYyzsBmOIc',
    amount: 398.0,
    paidDate: '2026-08-31 12:22:39',
  },
  {
    email: 'vaishnavishanumgam@gmail.com',
    teamName: 'Infinite loop',
    paymentId: 'pay_TWHTZ4VVCPB0Hn',
    amount: 398.0,
    paidDate: '2026-08-31 12:09:00',
  },
];

export async function GET() {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      message,
    });
  };

  try {
    addLog('info', 'Initializing database connection and schema check...');
    await initDatabase();
    addLog('success', 'Database connection established successfully.');

    const teamResults = [];

    for (const target of TARGET_TEAMS) {
      addLog('info', `Searching database for team with email: ${target.email} or name: "${target.teamName}"...`);

      // Search by email or team name
      const [rows]: any = await pool.query(
        `SELECT * FROM she_pitch_teams WHERE LOWER(leader_email) = ? OR LOWER(team_name) = ? LIMIT 1`,
        [target.email.toLowerCase(), target.teamName.toLowerCase()]
      );

      if (!rows || rows.length === 0) {
        addLog('warn', `Team not found for email: ${target.email} / name: "${target.teamName}".`);
        teamResults.push({
          target,
          found: false,
          status: 'NOT_FOUND',
        });
        continue;
      }

      const team = rows[0];
      addLog(
        'info',
        `Team found! Team ID: #${team.id} | Name: "${team.team_name}" | Current Payment Status: ${team.payment_status}`
      );

      // Fetch team students/members
      const [memberRows]: any = await pool.query(`SELECT * FROM she_pitch_students WHERE team_id = ?`, [team.id]);
      addLog('info', `Retrieved ${memberRows ? memberRows.length : 0} student members for Team ID #${team.id}.`);

      let updated = false;
      let emailSent = false;

      if (team.payment_status === 'success' && team.razorpay_payment_id === target.paymentId) {
        addLog('success', `Team ID #${team.id} is ALREADY marked as SUCCESS with Payment ID ${target.paymentId}.`);
      } else {
        // Execute update to SUCCESS
        addLog('info', `Updating Team ID #${team.id} payment status from '${team.payment_status}' to 'success'...`);
        await pool.query(
          `UPDATE she_pitch_teams 
           SET payment_status = 'success', razorpay_payment_id = ?, amount_paid = ? 
           WHERE id = ?`,
          [target.paymentId, target.amount, team.id]
        );
        updated = true;
        addLog('success', `Database updated! Team ID #${team.id} payment_status = 'success', razorpay_payment_id = '${target.paymentId}'.`);

        // Check if payments table record exists or needs insert/update
        const [payRows]: any = await pool.query(
          `SELECT id FROM she_pitch_payments WHERE team_id = ? OR razorpay_payment_id = ? LIMIT 1`,
          [team.id, target.paymentId]
        );

        if (payRows && payRows.length > 0) {
          await pool.query(
            `UPDATE she_pitch_payments 
             SET status = 'success', razorpay_payment_id = ?, amount = ? 
             WHERE id = ?`,
            [target.paymentId, target.amount, payRows[0].id]
          );
          addLog('info', `Updated she_pitch_payments log record ID #${payRows[0].id}.`);
        } else {
          await pool.query(
            `INSERT INTO she_pitch_payments (team_id, razorpay_order_id, razorpay_payment_id, amount, status) 
             VALUES (?, ?, ?, ?, 'success')`,
            [team.id, `manual_fix_${target.paymentId}`, target.paymentId, target.amount]
          );
          addLog('info', `Inserted new she_pitch_payments record for Payment ID ${target.paymentId}.`);
        }

        // Trigger Confirmation Email
        addLog('info', `Dispatching official Nodemailer confirmation email to ${team.leader_email}...`);
        try {
          const emailRes = await sendTeamConfirmationEmail({
            leaderName: team.leader_name,
            leaderEmail: team.leader_email,
            teamName: team.team_name,
            category: team.category,
            collegeName: team.college_name,
            amountPaid: target.amount,
            paymentId: target.paymentId,
            projectTitle: team.project_title,
            domain: team.domain,
            projectDescription: team.project_description,
            members: memberRows || [],
          });

          if (emailRes && emailRes.success) {
            emailSent = true;
            addLog('success', `Confirmation email successfully sent to ${team.leader_email}.`);
          } else {
            addLog('warn', `Email dispatch result: ${JSON.stringify(emailRes)}`);
          }
        } catch (mailErr: any) {
          addLog('error', `Failed to send confirmation email: ${mailErr.message}`);
        }
      }

      teamResults.push({
        target,
        found: true,
        teamId: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        collegeName: team.college_name,
        category: team.category,
        paymentId: target.paymentId,
        amount: target.amount,
        updated,
        emailSent,
        status: 'SUCCESS',
      });
    }

    addLog('success', 'Pending payment check and fix process completed cleanly.');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      logs,
      results: teamResults,
    });
  } catch (error: any) {
    addLog('error', `Critical Error during payment check: ${error.message}`);
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
  // Allow manual payload verification if passed from UI
  return GET();
}
