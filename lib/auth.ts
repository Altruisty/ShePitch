import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'shepitch_secret_key_2026_super_secure';

export interface AdminPayload {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface CollegePayload {
  id: number;
  username: string;
  college_name: string;
  rep_name: string;
  email: string;
  role: 'college';
}

export function signAdminToken(payload: Omit<AdminPayload, 'role'>): string {
  return jwt.sign({ ...payload, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function signCollegeToken(payload: Omit<CollegePayload, 'role'>): string {
  return jwt.sign({ ...payload, role: 'college' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminPayload | CollegePayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export function getAdminSession(): AdminPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('she_admin_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (decoded && decoded.role === 'admin') {
    return decoded as AdminPayload;
  }
  return null;
}

export function getCollegeSession(): CollegePayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('she_college_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (decoded && decoded.role === 'college') {
    return decoded as CollegePayload;
  }
  return null;
}
