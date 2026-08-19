import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { sendCustomEmail, sendTeamConfirmationEmail } from '@/lib/mailer';
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
      `SELECT * FROM she_pitch_email_logs ORDER BY sent_at DESC LIMIT 100`
    );
    return NextResponse.json({ success: true, logs: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/mail - Send custom or batch email
export async function POST(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_type, target_email, subject, message_body, team_id } = await req.json();

    if (!subject || !message_body) {
      return NextResponse.json({ error: 'Subject and message body required' }, { status: 400 });
    }

    if (target_type === 'single' && target_email) {
      const result = await sendCustomEmail({
        to: target_email,
        subject,
        htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px;">${message_body.replace(/\n/g, '<br/>')}</div>`,
      });
      return NextResponse.json({ success: true, result });
    } else if (target_type === 'resend_confirmation' && team_id) {
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
          members: memberRows || [],
        });
        return NextResponse.json({ success: true, res });
      }
    } else if (target_type === 'all_leaders') {
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
