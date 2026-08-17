import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signAdminToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(req: Request) {
  try {
    // Ensure DB tables exist
    await initDatabase();

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const [rows]: any = await pool.query(`SELECT * FROM she_pitch_admins WHERE username = ?`, [username]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
    });

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email },
    });

    response.cookies.set('she_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
