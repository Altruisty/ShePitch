import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleCheck();
}

export async function POST() {
  return handleCheck();
}

async function handleCheck() {
  const logs: string[] = [];
  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    const line = `[${timestamp} IST] ${msg}`;
    logs.push(line);
    console.log(line);
  };

  const TARGET_PAYMENT_ID = 'pay_TZnrkBJ9atUlYc';
  const TARGET_LEADER_EMAIL = 'b.sanjeetha2378@gmail.com';
  const TARGET_LEADER_PHONE = '8610978948';
  const TARGET_LEADER_PHONE_ALT = '86109 78948';
  const TARGET_TEAM_NAME = 'Ignite3.0';
  const TARGET_COLLEGE = 'KINGS ENGINEERING COLLEGE';
  const TARGET_CATEGORY = 'Idea Pitch';
  const TARGET_AMOUNT = 597.0;
  const TARGET_TITLE = 'NIRA';
  const TARGET_DOMAIN = 'Public safety';
  const TARGET_DESCRIPTION =
    'NIRA is an intelligent risk prediction system that analyzes real-time and historical data to identify potential risks before they become emergencies. It provides early warnings and preventive recommendations, helping people and authorities take timely action and improve public safety.';

  const DEFAULT_MEMBERS = [
    {
      student_name: 'Sanjeetha b',
      email: 'b.sanjeetha2378@gmail.com',
      phone: '8610978948',
      department: 'B.E (cse)',
      year_of_study: '2nd Year',
      is_leader: true,
    },
    {
      student_name: 'Vanmathi N',
      email: 'nvanmathi2346@gmail.com',
      phone: '6369745655',
      department: 'B.E (cse)',
      year_of_study: '2nd Year',
      is_leader: false,
    },
    {
      student_name: 'Swetha.K',
      email: 'swethask61@gmail.com',
      phone: '6374986041',
      department: 'B.E (cse)',
      year_of_study: '2nd Year',
      is_leader: false,
    },
  ];

  try {
    log('======================================================');
    log('🚀 Initializing payment check & fix for team "Ignite3.0"');
    log(`🎯 Target Payment ID: ${TARGET_PAYMENT_ID}`);
    log(`🎯 Target Leader Email: ${TARGET_LEADER_EMAIL}`);
    log(`🎯 Target Leader Phone: ${TARGET_LEADER_PHONE}`);
    log('======================================================');

    // 1. Ensure DB schema is initialized
    log('📦 Checking database schema and connection...');
    await initDatabase();
    log('✅ Database connected.');

    // 2. Search for existing team record
    log(`🔍 Querying she_pitch_teams for team matching email, phone, or name...`);
    const [teamRows]: any = await pool.query(
      `SELECT * FROM she_pitch_teams 
       WHERE leader_email = ? 
          OR leader_phone = ? 
          OR leader_phone = ?
          OR LOWER(TRIM(team_name)) = LOWER(TRIM(?))
       ORDER BY id DESC LIMIT 1`,
      [TARGET_LEADER_EMAIL, TARGET_LEADER_PHONE, TARGET_LEADER_PHONE_ALT, TARGET_TEAM_NAME]
    );

    let teamId: number;
    let finalTeam: any = null;

    if (teamRows && teamRows.length > 0) {
      const existingTeam = teamRows[0];
      teamId = existingTeam.id;
      log(`🎯 Team found in database!`);
      log(`   - Team ID: ${existingTeam.id}`);
      log(`   - Team Name: "${existingTeam.team_name}"`);
      log(`   - College: "${existingTeam.college_name}"`);
      log(`   - Current Payment Status: "${existingTeam.payment_status}"`);
      log(`   - Previous Razorpay Payment ID: "${existingTeam.razorpay_payment_id || 'N/A'}"`);
      log(`   - Amount Paid: ₹${existingTeam.amount_paid}`);

      // Update she_pitch_teams
      log(`📝 Updating she_pitch_teams record for team #${teamId}...`);
      await pool.query(
        `UPDATE she_pitch_teams 
         SET payment_status = 'success',
             razorpay_payment_id = ?,
             amount_paid = ?,
             category = COALESCE(NULLIF(category, ''), ?),
             project_title = COALESCE(NULLIF(project_title, ''), ?),
             domain = COALESCE(NULLIF(domain, ''), ?),
             project_description = COALESCE(NULLIF(project_description, ''), ?)
         WHERE id = ?`,
        [
          TARGET_PAYMENT_ID,
          TARGET_AMOUNT,
          TARGET_CATEGORY,
          TARGET_TITLE,
          TARGET_DOMAIN,
          TARGET_DESCRIPTION,
          teamId,
        ]
      );
      log(`✅ she_pitch_teams updated: payment_status='success', razorpay_payment_id='${TARGET_PAYMENT_ID}', amount_paid=₹${TARGET_AMOUNT}`);
    } else {
      // Team not found, create new record
      log(`⚠️ Team record not found in she_pitch_teams. Creating new record...`);
      const [insertResult]: any = await pool.query(
        `INSERT INTO she_pitch_teams (
          team_name, category, project_title, domain, project_description,
          college_name, leader_name, leader_email, leader_phone,
          member_count, amount_paid, payment_status, razorpay_payment_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'success', ?)`,
        [
          TARGET_TEAM_NAME,
          TARGET_CATEGORY,
          TARGET_TITLE,
          TARGET_DOMAIN,
          TARGET_DESCRIPTION,
          TARGET_COLLEGE,
          DEFAULT_MEMBERS[0].student_name,
          DEFAULT_MEMBERS[0].email,
          DEFAULT_MEMBERS[0].phone,
          DEFAULT_MEMBERS.length,
          TARGET_AMOUNT,
          TARGET_PAYMENT_ID,
        ]
      );
      teamId = insertResult.insertId;
      log(`✅ Created new team record with ID #${teamId}.`);
    }

    // 3. Handle she_pitch_payments table
    log(`💳 Checking she_pitch_payments table for team #${teamId}...`);
    const [paymentRows]: any = await pool.query(
      `SELECT * FROM she_pitch_payments WHERE team_id = ? OR razorpay_payment_id = ?`,
      [teamId, TARGET_PAYMENT_ID]
    );

    if (paymentRows && paymentRows.length > 0) {
      log(`   - Found existing payment log entry (ID: ${paymentRows[0].id}, current status: ${paymentRows[0].status}). Updating...`);
      await pool.query(
        `UPDATE she_pitch_payments 
         SET status = 'success', 
             razorpay_payment_id = ?, 
             amount = ? 
         WHERE id = ?`,
        [TARGET_PAYMENT_ID, TARGET_AMOUNT, paymentRows[0].id]
      );
      log(`✅ Updated existing she_pitch_payments record #${paymentRows[0].id} to 'success'.`);
    } else {
      log(`   - No payment record found. Inserting new record in she_pitch_payments...`);
      await pool.query(
        `INSERT INTO she_pitch_payments (team_id, razorpay_order_id, razorpay_payment_id, amount, status) 
         VALUES (?, ?, ?, ?, 'success')`,
        [teamId, `order_manual_${TARGET_PAYMENT_ID}`, TARGET_PAYMENT_ID, TARGET_AMOUNT]
      );
      log(`✅ Inserted new she_pitch_payments record for team #${teamId}.`);
    }

    // 4. Handle she_pitch_students table
    log(`👥 Checking student members in she_pitch_students for team #${teamId}...`);
    const [studentRows]: any = await pool.query(
      `SELECT * FROM she_pitch_students WHERE team_id = ?`,
      [teamId]
    );

    let finalMembers = studentRows || [];
    if (!studentRows || studentRows.length === 0) {
      log(`   - No student records found. Inserting default members...`);
      for (const m of DEFAULT_MEMBERS) {
        await pool.query(
          `INSERT INTO she_pitch_students (team_id, student_name, email, phone, department, year_of_study, is_leader) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [teamId, m.student_name, m.email, m.phone, m.department, m.year_of_study, m.is_leader ? 1 : 0]
        );
        log(`   + Added member: ${m.student_name} (${m.email})`);
      }
      finalMembers = DEFAULT_MEMBERS;
      log(`✅ Inserted ${DEFAULT_MEMBERS.length} members into she_pitch_students.`);
    } else {
      log(`✅ Found ${studentRows.length} member(s) already in database.`);
      studentRows.forEach((s: any, idx: number) => {
        log(`   ${idx + 1}. ${s.student_name} (${s.email}, ${s.phone}) - Leader: ${s.is_leader ? 'Yes' : 'No'}`);
      });
    }

    // 5. Fetch updated team data for confirmation
    const [updatedRows]: any = await pool.query(`SELECT * FROM she_pitch_teams WHERE id = ?`, [teamId]);
    finalTeam = updatedRows && updatedRows[0] ? updatedRows[0] : null;

    // 6. Send confirmation email
    log(`📧 Preparing to send confirmation email...`);
    try {
      await sendTeamConfirmationEmail({
        leaderName: finalTeam?.leader_name || DEFAULT_MEMBERS[0].student_name,
        leaderEmail: finalTeam?.leader_email || DEFAULT_MEMBERS[0].email,
        teamName: finalTeam?.team_name || TARGET_TEAM_NAME,
        category: finalTeam?.category || TARGET_CATEGORY,
        collegeName: finalTeam?.college_name || TARGET_COLLEGE,
        amountPaid: Number(finalTeam?.amount_paid || TARGET_AMOUNT),
        paymentId: TARGET_PAYMENT_ID,
        projectTitle: finalTeam?.project_title || TARGET_TITLE,
        domain: finalTeam?.domain || TARGET_DOMAIN,
        projectDescription: finalTeam?.project_description || TARGET_DESCRIPTION,
        members: finalMembers.map((m: any) => ({
          student_name: m.student_name,
          email: m.email,
          phone: m.phone,
          department: m.department || 'B.E (cse)',
        })),
      });
      log(`🎉 Confirmation email dispatched successfully to: ${finalTeam?.leader_email || DEFAULT_MEMBERS[0].email}`);
    } catch (emailErr: any) {
      log(`⚠️ Email dispatch notice: ${emailErr?.message || 'Email service error'}. (Database update remains SUCCESS).`);
    }

    // 7. Final status verification
    log('======================================================');
    log('🏁 FINAL VERIFICATION SUMMARY:');
    log(`   - Team ID: ${finalTeam?.id}`);
    log(`   - Team Name: ${finalTeam?.team_name}`);
    log(`   - Payment Status: ${finalTeam?.payment_status?.toUpperCase()}`);
    log(`   - Razorpay Payment ID: ${finalTeam?.razorpay_payment_id}`);
    log(`   - Amount Paid: ₹${finalTeam?.amount_paid}`);
    log('✨ ALL OPERATIONS COMPLETED SUCCESSFULLY! ✨');
    log('======================================================');

    return NextResponse.json({
      success: true,
      message: `Team "${TARGET_TEAM_NAME}" payment status successfully verified and updated to PAID.`,
      team: finalTeam,
      logs,
    });
  } catch (error: any) {
    log(`❌ ERROR: ${error.message || error}`);
    console.error('Pending payment check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error occurred during payment check',
        logs,
      },
      { status: 500 }
    );
  }
}
