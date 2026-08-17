import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SqTKTI1LnaHwA8',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Tu6sXYc2kLSGWcwJIzEr2ISi',
});

export async function POST(req: Request) {
  try {
    await initDatabase();

    const body = await req.json();
    const {
      team_name,
      category,
      project_title,
      domain,
      project_description,
      college_name,
      college_id,
      leader_name,
      leader_email,
      leader_phone,
      members,
      coupon_code,
      amount_in_rupees,
    } = body;

    if (!team_name || !category || !college_name || !leader_name || !leader_email || !members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Missing required team registration details' }, { status: 400 });
    }

    const amountInPaisa = Math.round(Number(amount_in_rupees || 299 * members.length) * 100);

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `receipt_she_${Date.now()}`,
      notes: {
        team_name,
        category,
        project_title: project_title || '',
        domain: domain || '',
        college_name,
        leader_name,
        leader_email,
      },
    });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert pending team record
      const [teamRes]: any = await connection.query(
        `INSERT INTO she_pitch_teams 
         (team_name, category, project_title, domain, project_description, college_id, college_name, leader_name, leader_email, leader_phone, member_count, coupon_code, amount_paid, payment_status, razorpay_order_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          team_name,
          category,
          project_title || '',
          domain || '',
          project_description || '',
          college_id || null,
          college_name,
          leader_name,
          leader_email,
          leader_phone,
          members.length,
          coupon_code || null,
          amount_in_rupees,
          order.id,
        ]
      );

      const teamId = teamRes.insertId;

      // Insert students
      for (const m of members) {
        await connection.query(
          `INSERT INTO she_pitch_students (team_id, student_name, email, phone, department, year_of_study, is_leader)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [teamId, m.student_name, m.email, m.phone, m.department || '', m.year_of_study || '', m.is_leader ? 1 : 0]
        );
      }

      // Insert payment log
      await connection.query(
        `INSERT INTO she_pitch_payments (team_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, 'pending')`,
        [teamId, order.id, amount_in_rupees]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_SqTKTI1LnaHwA8',
        team_id: teamId,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
