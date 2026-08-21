import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/auth';
import { sendCollegeCredentialsEmail } from '@/lib/mailer';
import { initDatabase } from '@/lib/init-db';

// GET /api/colleges - Public & Admin
export async function GET() {
  try {
    await initDatabase();
    const [rows]: any = await pool.query(
      `SELECT id, college_name, rep_name, username, email, status, created_at FROM she_pitch_colleges ORDER BY college_name ASC`
    );
    return NextResponse.json({ success: true, colleges: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/colleges - Add College (Admin protected)
export async function POST(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { college_name, rep_name, username, email, password } = await req.json();

    if (!college_name || !rep_name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields (college_name, rep_name, username, email, password) are required' }, { status: 400 });
    }

    // Check if college_name or username already exists
    const [existing]: any = await pool.query(
      `SELECT id FROM she_pitch_colleges WHERE college_name = ? OR username = ?`,
      [college_name, username]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'College name or username already exists' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      `INSERT INTO she_pitch_colleges (college_name, rep_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [college_name, rep_name, username, email, password_hash]
    );

    // Automatically send Nodemailer email to the college representative with their login details!
    sendCollegeCredentialsEmail({
      repName: rep_name,
      collegeName: college_name,
      email,
      username,
      password,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'College registered successfully. Welcome email sent.',
      college: { id: result.insertId, college_name, rep_name, username, email },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
