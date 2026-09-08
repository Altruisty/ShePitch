import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

// GET /api/teams - List Teams with filters
export async function GET(req: Request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const college = searchParams.get('college');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = `
      SELECT t.*, 
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
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (college && college !== 'all') {
      query += ` AND (t.college_id = ? OR t.college_name = ?)`;
      queryParams.push(college, college);
    }

    if (category && category !== 'all') {
      query += ` AND t.category = ?`;
      queryParams.push(category);
    }

    if (status && status !== 'all') {
      query += ` AND t.payment_status = ?`;
      queryParams.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (t.team_name LIKE ? OR t.leader_name LIKE ? OR t.leader_email LIKE ? OR t.college_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term, term);
    }

    query += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const [rows]: any = await pool.query(query, queryParams);
    return NextResponse.json({ success: true, teams: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/teams - Manual Team Add (Admin)
export async function POST(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      amount_paid,
      payment_status,
      coupon_code,
      razorpay_payment_id,
      send_email,
      members,
    } = body;

    if (!team_name || !category || !college_name || !leader_name || !leader_email || !members || !Array.isArray(members) || members.length < 2) {
      return NextResponse.json({ error: 'Missing required team fields. A minimum of 2 members is required.' }, { status: 400 });
    }

    // Check if team name already exists (case-insensitive)
    const [existingTeams]: any = await pool.query(
      `SELECT id FROM she_pitch_teams WHERE LOWER(team_name) = LOWER(?) AND payment_status != 'failed' LIMIT 1`,
      [team_name.trim()]
    );
    if (existingTeams && existingTeams.length > 0) {
      return NextResponse.json({ error: 'Team name is already taken. Please choose a different team name.' }, { status: 400 });
    }

    const effectiveStatus = payment_status || 'success';
    const effectiveOrderId = `order_manual_${Date.now()}`;
    const effectivePaymentId =
      razorpay_payment_id && razorpay_payment_id.trim() !== ''
        ? razorpay_payment_id.trim()
        : effectiveStatus === 'success'
        ? `pay_manual_${Date.now()}`
        : null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [teamRes]: any = await connection.query(
        `INSERT INTO she_pitch_teams 
         (team_name, category, project_title, domain, project_description, college_id, college_name, leader_name, leader_email, leader_phone, member_count, coupon_code, amount_paid, payment_status, razorpay_order_id, razorpay_payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          team_name.trim(),
          category,
          project_title || '',
          domain || '',
          project_description || '',
          college_id || null,
          college_name.trim(),
          leader_name.trim(),
          leader_email.trim(),
          leader_phone.trim(),
          members.length,
          coupon_code || null,
          Number(amount_paid) || 0,
          effectiveStatus,
          effectiveOrderId,
          effectivePaymentId,
        ]
      );

      const teamId = teamRes.insertId;

      for (const m of members) {
        await connection.query(
          `INSERT INTO she_pitch_students (team_id, student_name, email, phone, department, year_of_study, is_leader)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            teamId,
            m.student_name?.trim() || '',
            m.email?.trim() || '',
            m.phone?.trim() || '',
            m.department?.trim() || '',
            m.year_of_study || '',
            m.is_leader ? 1 : 0,
          ]
        );
      }

      // Record in payments table if payment is marked success
      if (effectiveStatus === 'success') {
        await connection.query(
          `INSERT INTO she_pitch_payments (team_id, razorpay_order_id, razorpay_payment_id, amount, status)
           VALUES (?, ?, ?, ?, 'success')`,
          [teamId, effectiveOrderId, effectivePaymentId, Number(amount_paid) || 0]
        );
      }

      await connection.commit();

      // Dispatch confirmation email if requested and status is success
      if (send_email && effectiveStatus === 'success') {
        try {
          await sendTeamConfirmationEmail({
            leaderName: leader_name.trim(),
            leaderEmail: leader_email.trim(),
            teamName: team_name.trim(),
            category,
            collegeName: college_name.trim(),
            amountPaid: Number(amount_paid) || 0,
            paymentId: effectivePaymentId || 'N/A',
            projectTitle: project_title || '',
            domain: domain || '',
            projectDescription: project_description || '',
            members: members.map((m: any) => ({
              student_name: m.student_name,
              email: m.email,
              phone: m.phone,
              department: m.department,
            })),
          });
        } catch (mailErr: any) {
          console.error('Email dispatch error on manual team creation:', mailErr?.message || mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Team created successfully',
        team_id: teamId,
        payment_id: effectivePaymentId,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
