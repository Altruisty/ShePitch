import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, team_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !team_id) {
      return NextResponse.json({ error: 'Incomplete payment verification payload' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'Tu6sXYc2kLSGWcwJIzEr2ISi';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      // Record failed payment
      await pool.query(
        `UPDATE she_pitch_payments SET status = 'failed', error_description = 'Invalid HMAC signature' WHERE razorpay_order_id = ?`,
        [razorpay_order_id]
      );
      await pool.query(`UPDATE she_pitch_teams SET payment_status = 'failed' WHERE id = ?`, [team_id]);
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Update team payment status to success
    await pool.query(
      `UPDATE she_pitch_teams 
       SET payment_status = 'success', razorpay_payment_id = ?, razorpay_signature = ?
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, team_id]
    );

    // Update payment log
    await pool.query(
      `UPDATE she_pitch_payments 
       SET status = 'success', razorpay_payment_id = ?
       WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_order_id]
    );

    // Fetch team & member details to send confirmation email
    const [teamRows]: any = await pool.query(`SELECT * FROM she_pitch_teams WHERE id = ?`, [team_id]);
    const [memberRows]: any = await pool.query(`SELECT * FROM she_pitch_students WHERE team_id = ?`, [team_id]);

    if (teamRows && teamRows.length > 0) {
      const team = teamRows[0];
      // Send confirmation email asynchronously via Nodemailer!
      sendTeamConfirmationEmail({
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        teamName: team.team_name,
        category: team.category,
        collegeName: team.college_name,
        amountPaid: Number(team.amount_paid),
        paymentId: razorpay_payment_id,
        projectTitle: team.project_title,
        domain: team.domain,
        projectDescription: team.project_description,
        members: memberRows || [],
      }).catch((err) => console.error('Error sending confirmation email:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Confirmation email sent.',
      payment_id: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Payment verification server error' }, { status: 500 });
  }
}
