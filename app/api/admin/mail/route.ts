import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import {
  sendCustomEmail,
  sendTeamConfirmationEmail,
  sendConferenceConfirmationEmail,
  sendCollegeCredentialsEmail,
} from '@/lib/mailer';
import { initDatabase } from '@/lib/init-db';

// GET /api/admin/mail - Get email dispatch logs
export async function GET() {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    const [rows]: any = await pool.query(
      `SELECT * FROM she_pitch_email_logs ORDER BY sent_at DESC LIMIT 150`
    );
    return NextResponse.json({ success: true, logs: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/mail - Send custom, batch email, or resend email log
export async function POST(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_type, target_email, subject, message_body, team_id, log_id } = await req.json();

    // HANDLER 1: RESEND EMAIL FROM LOG TABLE
    if (target_type === 'resend_log' && target_email) {
      const emailToResend = target_email.trim();

      // 1. Try team_confirmation
      const [teamRows]: any = await pool.query(
        `SELECT * FROM she_pitch_teams WHERE LOWER(leader_email) = ? LIMIT 1`,
        [emailToResend.toLowerCase()]
      );

      if (teamRows && teamRows.length > 0) {
        const team = teamRows[0];
        const [memberRows]: any = await pool.query(
          `SELECT * FROM she_pitch_students WHERE team_id = ?`,
          [team.id]
        );
        const res = await sendTeamConfirmationEmail({
          leaderName: team.leader_name,
          leaderEmail: team.leader_email,
          teamName: team.team_name,
          category: team.category,
          collegeName: team.college_name,
          amountPaid: Number(team.amount_paid || 0),
          paymentId: team.razorpay_payment_id || 'CONFIRMED',
          projectTitle: team.project_title,
          domain: team.domain,
          projectDescription: team.project_description,
          members: memberRows || [],
        });

        if (res.success) {
          if (log_id) {
            await pool.query(
              `UPDATE she_pitch_email_logs SET status = 'sent', error_message = NULL WHERE id = ?`,
              [log_id]
            );
          }
          return NextResponse.json({
            success: true,
            message: `Team confirmation email successfully resent to ${emailToResend}`,
          });
        } else {
          return NextResponse.json({ error: res.error || 'Failed to send team email' }, { status: 500 });
        }
      }

      // 2. Try conference_confirmation
      const [confRows]: any = await pool.query(
        `SELECT * FROM she_pitch_conference_registrations WHERE LOWER(email) = ? LIMIT 1`,
        [emailToResend.toLowerCase()]
      );

      if (confRows && confRows.length > 0) {
        const delegate = confRows[0];
        const res = await sendConferenceConfirmationEmail({
          fullName: delegate.full_name,
          email: delegate.email,
          phone: delegate.phone,
          collegeName: delegate.college_name,
          department: delegate.department,
          yearOfStudy: delegate.year_of_study,
        });

        if (res.success) {
          if (log_id) {
            await pool.query(
              `UPDATE she_pitch_email_logs SET status = 'sent', error_message = NULL WHERE id = ?`,
              [log_id]
            );
          }
          return NextResponse.json({
            success: true,
            message: `Conference registration email successfully resent to ${emailToResend}`,
          });
        } else {
          return NextResponse.json({ error: res.error || 'Failed to send conference email' }, { status: 500 });
        }
      }

      // 3. Fallback: send custom email
      const res = await sendCustomEmail({
        to: emailToResend,
        subject: subject || 'ShePitch Chennai — Official Notification',
        htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${(
          message_body || 'This is a resent message regarding your ShePitch registration.'
        ).replace(/\n/g, '<br/>')}</div>`,
      });

      if (res.success) {
        if (log_id) {
          await pool.query(
            `UPDATE she_pitch_email_logs SET status = 'sent', error_message = NULL WHERE id = ?`,
            [log_id]
          );
        }
        return NextResponse.json({
          success: true,
          message: `Email successfully resent to ${emailToResend}`,
        });
      } else {
        return NextResponse.json({ error: res.error || 'Failed to resend email' }, { status: 500 });
      }
    }

    // HANDLER 2: SINGLE CUSTOM EMAIL
    if (target_type === 'single' && target_email) {
      if (!subject || !message_body) {
        return NextResponse.json({ error: 'Subject and message body required' }, { status: 400 });
      }

      const result = await sendCustomEmail({
        to: target_email,
        subject,
        htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px;">${message_body.replace(/\n/g, '<br/>')}</div>`,
      });
      return NextResponse.json({ success: true, result });
    }

    // HANDLER 3: RESEND CONFIRMATION BY TEAM ID
    if (target_type === 'resend_confirmation' && team_id) {
      const [teamRows]: any = await pool.query(`SELECT * FROM she_pitch_teams WHERE id = ?`, [team_id]);
      const [memberRows]: any = await pool.query(`SELECT * FROM she_pitch_students WHERE team_id = ?`, [team_id]);

      if (teamRows && teamRows.length > 0) {
        const team = teamRows[0];
        const res = await sendTeamConfirmationEmail({
          leaderName: team.leader_name,
          leaderEmail: team.leader_email,
          teamName: team.team_name,
          category: team.category,
          collegeName: team.college_name,
          amountPaid: Number(team.amount_paid),
          paymentId: team.razorpay_payment_id || 'MANUAL_CONFIRMED',
          projectTitle: team.project_title,
          domain: team.domain,
          projectDescription: team.project_description,
          members: memberRows || [],
        });
        return NextResponse.json({ success: true, res });
      }
    }

    // HANDLER 4: BROADCAST TO ALL TEAM LEADERS
    if (target_type === 'all_leaders') {
      if (!subject || !message_body) {
        return NextResponse.json({ error: 'Subject and message body required' }, { status: 400 });
      }

      const [leaders]: any = await pool.query(
        `SELECT DISTINCT leader_email FROM she_pitch_teams WHERE payment_status = 'success'`
      );
      let count = 0;
      for (const l of leaders) {
        await sendCustomEmail({
          to: l.leader_email,
          subject,
          htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px;">${message_body.replace(/\n/g, '<br/>')}</div>`,
        });
        count++;
      }
      return NextResponse.json({ success: true, message: `Emails dispatched to ${count} team leaders.` });
    }

    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
