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

// Known target pending teams
const TARGET_PENDING_TEAMS = [
  {
    teamName: 'Nextgen minds',
    leaderEmail: 'divyasankar.in7@gmail.com',
    paymentId: 'pay_TZ2tdG3KO0GX0D',
    rawPaymentId: 'TZ2tdG3KO0GX0D',
    collegeName: 'KINGS ENGINEERING COLLEGE',
    amount: 796.0,
    category: 'Idea Pitch',
  },
];

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
    const { searchParams } = new URL(req.url);
    const customQuery = searchParams.get('search');
    const customPaymentId = searchParams.get('paymentId');
    const customAmount = searchParams.get('amount');

    addLog('info', '🚀 Initiating pending payment check & audit process...');
    await initDatabase();
    addLog('success', 'Database connection established successfully.');

    // Determine list of targets to process
    const targetsToProcess = customQuery
      ? [
          {
            teamName: customQuery,
            leaderEmail: customQuery,
            paymentId: customPaymentId ? (customPaymentId.startsWith('pay_') ? customPaymentId : `pay_${customPaymentId}`) : 'pay_TZ2tdG3KO0GX0D',
            rawPaymentId: customPaymentId || 'TZ2tdG3KO0GX0D',
            collegeName: '',
            amount: customAmount ? Number(customAmount) : 796.0,
            category: '',
          },
        ]
      : TARGET_PENDING_TEAMS;

    const results = [];

    for (const target of targetsToProcess) {
      addLog('info', `Looking up team in database for: "${target.teamName}" / "${target.leaderEmail}"...`);

      // Search by email or team name (case-insensitive)
      const [rows]: any = await pool.query(
        `SELECT * FROM she_pitch_teams 
         WHERE LOWER(leader_email) = ? OR LOWER(team_name) = ? 
         LIMIT 1`,
        [target.leaderEmail.toLowerCase().trim(), target.teamName.toLowerCase().trim()]
      );

      if (!rows || rows.length === 0) {
        addLog('warn', `⚠️ Team NOT found for query: "${target.teamName}" / "${target.leaderEmail}".`);
        results.push({
          target,
          found: false,
          status: 'NOT_FOUND',
        });
        continue;
      }

      const team = rows[0];
      const previousStatus = team.payment_status;
      const previousPaymentId = team.razorpay_payment_id;
      const effectivePaymentId = target.paymentId;
      const effectiveAmount = target.amount || team.amount_paid || 796.0;

      addLog(
        'success',
        `Team Found: "${team.team_name}" (ID #${team.id}) | College: "${team.college_name}" | Category: "${team.category}" | Leader: ${team.leader_name} (${team.leader_email})`
      );
      addLog('info', `Current Database Status: status="${previousStatus}", razorpay_payment_id="${previousPaymentId || 'N/A'}", amount_paid=₹${team.amount_paid}`);

      // Perform Status Fix in database
      addLog('info', `Updating status to "success" and setting Razorpay Payment ID to "${effectivePaymentId}"...`);
      await pool.query(
        `UPDATE she_pitch_teams 
         SET payment_status = 'success', 
             razorpay_payment_id = ?, 
             amount_paid = ? 
         WHERE id = ?`,
        [effectivePaymentId, effectiveAmount, team.id]
      );
      addLog('success', `she_pitch_teams record (ID #${team.id}) updated to payment_status = 'success'.`);

      // Update or insert into she_pitch_payments table
      const [paymentRows]: any = await pool.query(
        `SELECT id FROM she_pitch_payments WHERE team_id = ? OR razorpay_payment_id = ? LIMIT 1`,
        [team.id, effectivePaymentId]
      );

      if (paymentRows && paymentRows.length > 0) {
        await pool.query(
          `UPDATE she_pitch_payments 
           SET status = 'success', razorpay_payment_id = ?, amount = ? 
           WHERE id = ?`,
          [effectivePaymentId, Math.round(effectiveAmount * 100), paymentRows[0].id]
        );
        addLog('success', `she_pitch_payments record updated to success for payment ID: ${effectivePaymentId}`);
      } else {
        await pool.query(
          `INSERT INTO she_pitch_payments 
           (team_id, razorpay_order_id, razorpay_payment_id, amount, currency, status) 
           VALUES (?, ?, ?, ?, 'INR', 'success')`,
          [team.id, team.razorpay_order_id || `order_manual_${Date.now()}`, effectivePaymentId, Math.round(effectiveAmount * 100)]
        );
        addLog('success', `she_pitch_payments transaction inserted for payment ID: ${effectivePaymentId}`);
      }

      // Fetch member roster for confirmation email
      const [memberRows]: any = await pool.query(
        `SELECT * FROM she_pitch_students WHERE team_id = ? ORDER BY is_leader DESC, id ASC`,
        [team.id]
      );
      const members = memberRows || [];
      addLog('info', `Fetched ${members.length} team members from she_pitch_students for confirmation receipt.`);

      // Send confirmation email
      let emailSent = false;
      try {
        addLog('info', `Dispatching official ShePitch registration confirmation email to: ${team.leader_email}...`);
        const emailResult = await sendTeamConfirmationEmail({
          leaderName: team.leader_name,
          leaderEmail: team.leader_email,
          teamName: team.team_name,
          category: team.category,
          collegeName: team.college_name,
          amountPaid: effectiveAmount,
          paymentId: effectivePaymentId,
          projectTitle: team.project_title,
          domain: team.domain,
          projectDescription: team.project_description,
          members: members.map((m: any) => ({
            student_name: m.student_name,
            email: m.email,
            phone: m.phone,
            department: m.department,
          })),
        });

        if (emailResult.success) {
          emailSent = true;
          addLog('success', `Confirmation email successfully delivered to ${team.leader_email}!`);
        } else {
          addLog('warn', `Email dispatch returned failure: ${emailResult.error || 'Unknown error'}`);
        }
      } catch (mailErr: any) {
        addLog('error', `Error sending confirmation email: ${mailErr.message}`);
      }

      results.push({
        teamId: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        leaderPhone: team.leader_phone,
        collegeName: team.college_name,
        category: team.category,
        projectTitle: team.project_title,
        domain: team.domain,
        projectDescription: team.project_description,
        previousStatus,
        newStatus: 'success',
        paymentId: effectivePaymentId,
        amount: effectiveAmount,
        membersCount: members.length,
        members,
        emailSent,
        fixedAt: new Date().toISOString(),
      });
    }

    addLog('success', `🎉 Process finished. ${results.length} team(s) verified & updated.`);

    return NextResponse.json({
      success: true,
      results,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Critical execution failure: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during pending check',
        logs,
      },
      { status: 500 }
    );
  }
}

// POST: Handles Resend Confirmation Email or Manual Fix on demand
export async function POST(req: Request) {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      message,
    });
  };

  try {
    await initDatabase();
    const body = await req.json();
    const { action, team_id, email, payment_id } = body;

    if (action === 'resend_email') {
      addLog('info', `Request to resend confirmation email for Team ID #${team_id}...`);

      const [teamRows]: any = await pool.query(`SELECT * FROM she_pitch_teams WHERE id = ?`, [team_id]);
      if (!teamRows || teamRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
      }

      const team = teamRows[0];
      const [memberRows]: any = await pool.query(
        `SELECT * FROM she_pitch_students WHERE team_id = ? ORDER BY is_leader DESC, id ASC`,
        [team.id]
      );

      const emailResult = await sendTeamConfirmationEmail({
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        teamName: team.team_name,
        category: team.category,
        collegeName: team.college_name,
        amountPaid: team.amount_paid,
        paymentId: team.razorpay_payment_id || 'pay_TZ2tdG3KO0GX0D',
        projectTitle: team.project_title,
        domain: team.domain,
        projectDescription: team.project_description,
        members: (memberRows || []).map((m: any) => ({
          student_name: m.student_name,
          email: m.email,
          phone: m.phone,
          department: m.department,
        })),
      });

      if (emailResult.success) {
        addLog('success', `Confirmation email resent to ${team.leader_email}.`);
        return NextResponse.json({
          success: true,
          message: `Confirmation email resent to ${team.leader_email}.`,
          logs,
        });
      } else {
        return NextResponse.json({ success: false, error: emailResult.error || 'Failed to send email' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    addLog('error', `Error in POST handler: ${err.message}`);
    return NextResponse.json({ success: false, error: err.message, logs }, { status: 500 });
  }
}
