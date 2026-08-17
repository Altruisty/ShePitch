import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/auth';

// PUT /api/colleges/[id] - Update College
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collegeId = params.id;
    const { college_name, rep_name, username, email, password, status } = await req.json();

    if (!college_name || !rep_name || !username || !email) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE she_pitch_colleges SET college_name = ?, rep_name = ?, username = ?, email = ?, password_hash = ?, status = ? WHERE id = ?`,
        [college_name, rep_name, username, email, password_hash, status || 'active', collegeId]
      );
    } else {
      await pool.query(
        `UPDATE she_pitch_colleges SET college_name = ?, rep_name = ?, username = ?, email = ?, status = ? WHERE id = ?`,
        [college_name, rep_name, username, email, status || 'active', collegeId]
      );
    }

    return NextResponse.json({ success: true, message: 'College updated successfully' });
  } catch (error: any) {
    console.error('Error updating college:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/colleges/[id] - Delete College
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collegeId = params.id;
    await pool.query(`DELETE FROM she_pitch_colleges WHERE id = ?`, [collegeId]);

    return NextResponse.json({ success: true, message: 'College deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting college:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
