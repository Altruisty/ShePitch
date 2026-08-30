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
    const search = searchParams.get('search')?.trim() || '';
    const collegeFilter = searchParams.get('college')?.trim() || '';
    const yearFilter = searchParams.get('year')?.trim() || '';

    // Summary Statistics
    const [totalRegsRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM she_pitch_conference_registrations`
    );
    const totalRegistrations = totalRegsRows[0]?.count || 0;

    const [uniqueCollegesRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT college_name) as count FROM she_pitch_conference_registrations`
    );
    const totalColleges = uniqueCollegesRows[0]?.count || 0;

    const [todayRegsRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM she_pitch_conference_registrations WHERE DATE(created_at) = CURDATE()`
    );
    const todayRegistrations = todayRegsRows[0]?.count || 0;

    // Build List Query with Filters
    let query = `SELECT id, full_name, email, phone, college_id, college_name, department, year_of_study, created_at FROM she_pitch_conference_registrations WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(college_name) LIKE ? OR LOWER(department) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term, term, term);
    }

    if (collegeFilter) {
      query += ` AND college_name = ?`;
      params.push(collegeFilter);
    }

    if (yearFilter) {
      query += ` AND year_of_study = ?`;
      params.push(yearFilter);
    }

    query += ` ORDER BY created_at DESC`;

    const [registrations]: any = await pool.query(query, params);

    // Get list of distinct colleges for filter dropdown
    const [collegeList]: any = await pool.query(
      `SELECT DISTINCT college_name FROM she_pitch_conference_registrations ORDER BY college_name ASC`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations,
        totalColleges,
        todayRegistrations,
      },
      registrations: registrations || [],
      distinctColleges: (collegeList || []).map((c: any) => c.college_name),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conference registrations.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    await pool.query(`DELETE FROM she_pitch_conference_registrations WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Conference registration removed successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete conference registration.' },
      { status: 500 }
    );
  }
}
