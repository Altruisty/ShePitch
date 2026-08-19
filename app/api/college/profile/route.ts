import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getCollegeSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = getCollegeSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_password, new_password, rep_name } = await req.json();

    if (!new_password || new_password.trim() === '') {
      return NextResponse.json({ error: 'New password required' }, { status: 400 });
    }

    const [rows]: any = await pool.query(`SELECT * FROM she_pitch_colleges WHERE id = ?`, [session.id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    const college = rows[0];
    if (current_password) {
      const match = await bcrypt.compare(current_password, college.password_hash);
      if (!match) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }
    }

    const new_hash = await bcrypt.hash(new_password, 10);
    await pool.query(
      `UPDATE she_pitch_colleges SET password_hash = ?, rep_name = ? WHERE id = ?`,
      [new_hash, rep_name || college.rep_name, session.id]
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
