import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    // 1. Auto-Calculated Team Registration Revenue (Only confirmed paid teams)
    const [teamRevRows]: any = await pool.query(
      `SELECT COUNT(*) as team_count, COALESCE(SUM(amount_paid), 0) as total_revenue
       FROM she_pitch_teams
       WHERE payment_status = 'success'`
    );

    const paidTeamCount = Number(teamRevRows[0]?.team_count || 0);
    const teamRevenue = Number(teamRevRows[0]?.total_revenue || 0);

    // 2. Sponsorships & Extra Cash-In Income
    const [sponsorshipRows]: any = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM she_pitch_financial_transactions
       WHERE type IN ('sponsorship', 'cash_in')`
    );
    const sponsorshipIncome = Number(sponsorshipRows[0]?.total || 0);

    // 3. Total Cash Out Expenses
    const [expenseRows]: any = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM she_pitch_financial_transactions
       WHERE type = 'cash_out'`
    );
    const totalExpenses = Number(expenseRows[0]?.total || 0);

    // 4. Combined Financial Summary
    const totalGrossIncome = teamRevenue + sponsorshipIncome;
    const netBalance = totalGrossIncome - totalExpenses;

    // 5. Category Breakdown for Expenses (Cash Out)
    const [catBreakdown]: any = await pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM she_pitch_financial_transactions
       WHERE type = 'cash_out'
       GROUP BY category
       ORDER BY total DESC`
    );

    // 6. Custom Financial Transactions List
    const [transactions]: any = await pool.query(
      `SELECT id, title, type, category, amount, transaction_date, notes, created_at
       FROM she_pitch_financial_transactions
       ORDER BY transaction_date DESC, created_at DESC`
    );

    return NextResponse.json({
      success: true,
      summary: {
        teamRevenue,
        paidTeamCount,
        sponsorshipIncome,
        totalGrossIncome,
        totalExpenses,
        netBalance,
      },
      categoryBreakdown: (catBreakdown || []).map((c: any) => ({
        category: c.category,
        total: Number(c.total),
        count: Number(c.count),
      })),
      transactions: transactions || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch financial data.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();

    const body = await req.json();
    const { title, type, category, amount, transaction_date, notes } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Transaction description/title is required.' }, { status: 400 });
    }

    if (!type || !['sponsorship', 'cash_in', 'cash_out'].includes(type)) {
      return NextResponse.json({ error: 'Valid transaction type (Sponsorship, Cash In, or Cash Out) is required.' }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Transaction category is required.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid positive transaction amount is required.' }, { status: 400 });
    }

    if (!transaction_date) {
      return NextResponse.json({ error: 'Transaction date is required.' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO she_pitch_financial_transactions 
        (title, type, category, amount, transaction_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), type, category.trim(), numAmount, transaction_date, notes ? notes.trim() : null]
    );

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully.',
      id: result.insertId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record financial transaction.' },
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
      return NextResponse.json({ error: 'Transaction ID is required.' }, { status: 400 });
    }

    await pool.query(`DELETE FROM she_pitch_financial_transactions WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Transaction removed successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction.' },
      { status: 500 }
    );
  }
}
