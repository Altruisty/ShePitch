import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';
import { sendConferenceConfirmationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    await initDatabase();

    const body = await req.json();
    const { full_name, email, phone, college_id, college_name, department, year_of_study } = body;

    // Validation
    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return NextResponse.json({ error: 'Valid contact phone number is required.' }, { status: 400 });
    }

    if (!college_name || !college_name.trim()) {
      return NextResponse.json({ error: 'College / Institution name is required.' }, { status: 400 });
    }

    if (!department || !department.trim()) {
      return NextResponse.json({ error: 'Department is required.' }, { status: 400 });
    }

    if (!year_of_study || !year_of_study.trim()) {
      return NextResponse.json({ error: 'Year of study is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = full_name.trim();
    const cleanPhone = phone.trim();
    const cleanCollege = college_name.trim();
    const cleanDept = department.trim();
    const cleanYear = year_of_study.trim();

    // Check if email already registered for conference
    const [existingRows]: any = await pool.query(
      `SELECT id FROM she_pitch_conference_registrations WHERE LOWER(email) = ? LIMIT 1`,
      [cleanEmail]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return NextResponse.json(
        { error: 'This email is already registered for the ShePitch Conference Chennai Edition.' },
        { status: 400 }
      );
    }

    // Insert into DB
    const [result]: any = await pool.query(
      `INSERT INTO she_pitch_conference_registrations 
        (full_name, email, phone, college_id, college_name, department, year_of_study) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanPhone, college_id || null, cleanCollege, cleanDept, cleanYear]
    );

    const registrationId = result.insertId;

    // Trigger Confirmation Email asynchronously
    sendConferenceConfirmationEmail({
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      collegeName: cleanCollege,
      department: cleanDept,
      yearOfStudy: cleanYear,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Confirmation email has been sent.',
      registration: {
        id: registrationId,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        college_name: cleanCollege,
        department: cleanDept,
        year_of_study: cleanYear,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during conference registration.' },
      { status: 500 }
    );
  }
}
