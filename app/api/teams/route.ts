import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

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
      query += ` AND (t.team_name LIKE ? OR t.leader_name LIKE ? OR t.leader_email LIKE ?)`;
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term);
    }

    query += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const [rows]: any = await pool.query(query, queryParams);
    return NextResponse.json({ success: true, teams: rows });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
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
    const { team_name, category, college_name, college_id, leader_name, leader_email, leader_phone, amount_paid, payment_status, members } = body;

    if (!team_name || !category || !college_name || !leader_name || !leader_email || !members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Missing required team fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [teamRes]: any = await connection.query(
        `INSERT INTO she_pitch_teams (team_name, category, college_id, college_name, leader_name, leader_email, leader_phone, member_count, amount_paid, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          team_name,
          category,
          college_id || null,
          college_name,
          leader_name,
          leader_email,
          leader_phone,
          members.length,
          amount_paid || 0,
          payment_status || 'success',
        ]
      );

      const teamId = teamRes.insertId;

      for (const m of members) {
        await connection.query(
          `INSERT INTO she_pitch_students (team_id, student_name, email, phone, department, year_of_study, is_leader)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [teamId, m.student_name, m.email, m.phone, m.department || '', m.year_of_study || '', m.is_leader ? 1 : 0]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: 'Team created successfully', team_id: teamId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
