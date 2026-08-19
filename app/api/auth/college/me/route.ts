import { NextResponse } from 'next/server';
import { getCollegeSession } from '@/lib/auth';

export async function GET() {
  const session = getCollegeSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, college: session });
}
