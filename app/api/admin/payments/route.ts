import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = `
      SELECT p.*, t.team_name, t.category, t.college_name, t.leader_name, t.leader_email, t.leader_phone
      FROM she_pitch_payments p
      LEFT JOIN she_pitch_teams t ON p.team_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (p.razorpay_order_id LIKE ? OR p.razorpay_payment_id LIKE ? OR t.team_name LIKE ? OR t.leader_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [rows]: any = await pool.query(query, params);
    return NextResponse.json({ success: true, payments: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
