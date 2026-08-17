import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// PUT /api/teams/[id] - Update Team
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    const body = await req.json();
    const { team_name, category, college_name, leader_name, leader_email, leader_phone, payment_status, amount_paid, members } = body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE she_pitch_teams 
         SET team_name = ?, category = ?, college_name = ?, leader_name = ?, leader_email = ?, leader_phone = ?, payment_status = ?, amount_paid = ?, member_count = ?
         WHERE id = ?`,
        [team_name, category, college_name, leader_name, leader_email, leader_phone, payment_status, amount_paid, members?.length || 2, teamId]
      );

      if (members && Array.isArray(members)) {
        await connection.query(`DELETE FROM she_pitch_students WHERE team_id = ?`, [teamId]);
        for (const m of members) {
          await connection.query(
            `INSERT INTO she_pitch_students (team_id, student_name, email, phone, department, year_of_study, is_leader)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [teamId, m.student_name, m.email, m.phone, m.department || '', m.year_of_study || '', m.is_leader ? 1 : 0]
          );
        }
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: 'Team updated successfully' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete Team
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    await pool.query(`DELETE FROM she_pitch_teams WHERE id = ?`, [teamId]);

    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
