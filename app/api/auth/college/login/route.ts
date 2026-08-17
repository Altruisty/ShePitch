import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signCollegeToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(req: Request) {
  try {
    await initDatabase();

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const [rows]: any = await pool.query(`SELECT * FROM she_pitch_colleges WHERE username = ?`, [username]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid college credentials' }, { status: 401 });
    }

    const college = rows[0];
    if (college.status !== 'active') {
      return NextResponse.json({ error: 'College account is inactive' }, { status: 403 });
    }

    const match = await bcrypt.compare(password, college.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid college credentials' }, { status: 401 });
    }

    const token = signCollegeToken({
      id: college.id,
      username: college.username,
      college_name: college.college_name,
      rep_name: college.rep_name,
      email: college.email,
    });

    const response = NextResponse.json({
      success: true,
      college: {
        id: college.id,
        username: college.username,
        college_name: college.college_name,
        rep_name: college.rep_name,
        email: college.email,
      },
    });

    response.cookies.set('she_college_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('College login error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
