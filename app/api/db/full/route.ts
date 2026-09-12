export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

function safeSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'string') return obj;
  if (Buffer.isBuffer(obj)) return obj.toString('utf-8');
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(safeSerialize);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      res[key] = safeSerialize(obj[key]);
    }
    return res;
  }
  return obj;
}

export async function GET(req: Request) {
  try {
    // Ensure standard tables exist
    await initDatabase();

    const { searchParams } = new URL(req.url);
    const requestedTable = searchParams.get('table');

    // 1. Get all base tables in current active database
    const [tableRows]: any = await pool.query(`
      SELECT TABLE_NAME as tableName
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME ASC
    `);

    let tableNames: string[] = (tableRows || []).map((r: any) => r.tableName);

    if (requestedTable && tableNames.includes(requestedTable)) {
      tableNames = [requestedTable];
    }

    // 2. Query columns and all rows for each table
    const tablesData = await Promise.all(
      tableNames.map(async (tableName) => {
        try {
          const [columns]: any = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
          const [rows]: any = await pool.query(`SELECT * FROM \`${tableName}\``);

          return {
            name: tableName,
            columns: (columns || []).map((c: any) => ({
              field: c.Field,
              type: c.Type,
              nullable: c.Null === 'YES',
              key: c.Key,
              default: c.Default,
              extra: c.Extra,
            })),
            rowCount: Array.isArray(rows) ? rows.length : 0,
            rows: safeSerialize(rows || []),
          };
        } catch (err: any) {
          return {
            name: tableName,
            columns: [],
            rowCount: 0,
            rows: [],
            error: err.message || 'Failed to read table',
          };
        }
      })
    );

    const totalRows = tablesData.reduce((acc, t) => acc + t.rowCount, 0);

    return NextResponse.json({
      success: true,
      database: process.env.DB_NAME || 'MySQL Database',
      host: process.env.DB_HOST || 'localhost',
      totalTables: tablesData.length,
      totalRows,
      timestamp: new Date().toISOString(),
      tables: tablesData,
    });
  } catch (error: any) {
    console.error('Database full inspect error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error while fetching database tables',
      },
      { status: 500 }
    );
  }
}
