import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';
import { sendTeamConfirmationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

// Configured Category Change Targets
const TARGET_CATEGORY_CHANGES = [
  {
    teamName: 'HerKnee IQ',
    leaderEmail: 'akshayaakiruba96@gmail.com',
    collegeName: 'SRM Institute of Science and Technology',
    fromCategory: 'Idea Pitch',
    toCategory: 'Project Pitch',
  },
  {
    teamName: 'She Builds',
    leaderEmail: 'swathy25tp0444@svcet.ac.in',
    collegeName: 'SRI VENKATESHWARA COLLEGE OF ENGINEERING',
    fromCategory: 'Project Pitch',
    toCategory: 'Idea Pitch',
  },
];

export async function GET(req: Request) {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      message,
    });
  };

  try {
    const { searchParams } = new URL(req.url);
    const customQuery = searchParams.get('search');
    const customCategory = searchParams.get('category');
    const dispatchEmailParam = searchParams.get('dispatchEmail');
    const shouldDispatchEmail = dispatchEmailParam !== 'false';

    addLog('info', '🚀 Initiating team category change verification process...');
    await initDatabase();
    addLog('success', 'Database connection verified.');

    // Determine targets
    let targetsToProcess = TARGET_CATEGORY_CHANGES;

    if (customQuery && customCategory) {
      addLog('info', `Custom target requested: "${customQuery}" ➔ "${customCategory}"`);
      targetsToProcess = [
        {
          teamName: customQuery,
          leaderEmail: customQuery,
          collegeName: '',
          fromCategory: 'Auto',
          toCategory: customCategory as 'Idea Pitch' | 'Project Pitch',
        },
      ];
    }

    const results = [];

    for (const target of targetsToProcess) {
      addLog('info', `🔍 Searching database for team: "${target.teamName}" / "${target.leaderEmail}"...`);

      const [rows]: any = await pool.query(
        `SELECT * FROM she_pitch_teams 
         WHERE LOWER(leader_email) = ? OR LOWER(team_name) = ? 
         LIMIT 1`,
        [target.leaderEmail.toLowerCase().trim(), target.teamName.toLowerCase().trim()]
      );

      if (!rows || rows.length === 0) {
        addLog('warn', `⚠️ Team NOT found for: "${target.teamName}" / "${target.leaderEmail}".`);
        results.push({
          target,
          found: false,
          status: 'NOT_FOUND',
        });
        continue;
      }

      const team = rows[0];
      const previousCategory = team.category;
      const targetCategory = target.toCategory;

      addLog(
        'success',
        `Team Found: "${team.team_name}" (ID #${team.id}) | College: "${team.college_name}" | Current Category: "${previousCategory}" | Payment Status: "${team.payment_status}"`
      );

      if (previousCategory === targetCategory) {
        addLog('info', `Category for team "${team.team_name}" is ALREADY set to "${targetCategory}". No database update needed.`);
      } else {
        addLog('info', `Updating category for team "${team.team_name}" (ID #${team.id}) from "${previousCategory}" ➔ "${targetCategory}"...`);

        await pool.query(
          `UPDATE she_pitch_teams 
           SET category = ? 
           WHERE id = ?`,
          [targetCategory, team.id]
        );

        addLog('success', `✅ Category successfully updated to "${targetCategory}" for team "${team.team_name}" in she_pitch_teams.`);
      }

      // Fetch member roster
      const [memberRows]: any = await pool.query(
        `SELECT * FROM she_pitch_students WHERE team_id = ? ORDER BY is_leader DESC, id ASC`,
        [team.id]
      );
      const members = memberRows || [];
      addLog('info', `Fetched ${members.length} team members for "${team.team_name}".`);

      // Dispatch confirmation email with new category if requested
      let emailSent = false;
      if (shouldDispatchEmail && team.payment_status === 'success') {
        try {
          addLog('info', `Dispatching updated confirmation email with new category "${targetCategory}" to ${team.leader_email}...`);
          const emailResult = await sendTeamConfirmationEmail({
            leaderName: team.leader_name,
            leaderEmail: team.leader_email,
            teamName: team.team_name,
            category: targetCategory,
            collegeName: team.college_name,
            amountPaid: team.amount_paid || 0,
            paymentId: team.razorpay_payment_id || 'N/A',
            projectTitle: team.project_title,
            domain: team.domain,
            projectDescription: team.project_description,
            members: members.map((m: any) => ({
              student_name: m.student_name,
              email: m.email,
              phone: m.phone,
              department: m.department,
            })),
          });

          if (emailResult.success) {
            emailSent = true;
            addLog('success', `Confirmation email delivered to ${team.leader_email} with updated category "${targetCategory}".`);
          } else {
            addLog('warn', `Email dispatch returned failure: ${emailResult.error || 'Unknown error'}`);
          }
        } catch (mailErr: any) {
          addLog('error', `Error dispatching confirmation email: ${mailErr.message}`);
        }
      }

      results.push({
        teamId: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        leaderPhone: team.leader_phone,
        collegeName: team.college_name,
        previousCategory,
        newCategory: targetCategory,
        isChanged: previousCategory !== targetCategory,
        paymentStatus: team.payment_status || 'success',
        paymentId: team.razorpay_payment_id || 'N/A',
        amountPaid: Number(team.amount_paid || 0),
        projectTitle: team.project_title,
        domain: team.domain,
        projectDescription: team.project_description,
        membersCount: members.length,
        members,
        emailSent,
        updatedAt: new Date().toISOString(),
      });
    }

    addLog('success', `🎉 Category verification and update complete. ${results.length} team(s) processed.`);

    return NextResponse.json({
      success: true,
      results,
      logs,
    });
  } catch (error: any) {
    addLog('error', `Critical server failure during category check: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error during category check',
        logs,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const logs: LogEntry[] = [];
  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    logs.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      message,
    });
  };

  try {
    await initDatabase();
    const body = await req.json();
    const { action, team_id, target_category } = body;

    if (action === 'resend_email') {
      addLog('info', `Resending confirmation email for Team ID #${team_id}...`);

      const [teamRows]: any = await pool.query(`SELECT * FROM she_pitch_teams WHERE id = ?`, [team_id]);
      if (!teamRows || teamRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Team not found.' }, { status: 404 });
      }

      const team = teamRows[0];
      const [memberRows]: any = await pool.query(
        `SELECT * FROM she_pitch_students WHERE team_id = ? ORDER BY is_leader DESC, id ASC`,
        [team.id]
      );

      const emailResult = await sendTeamConfirmationEmail({
        leaderName: team.leader_name,
        leaderEmail: team.leader_email,
        teamName: team.team_name,
        category: team.category,
        collegeName: team.college_name,
        amountPaid: Number(team.amount_paid || 0),
        paymentId: team.razorpay_payment_id || 'N/A',
        projectTitle: team.project_title,
        domain: team.domain,
        projectDescription: team.project_description,
        members: (memberRows || []).map((m: any) => ({
          student_name: m.student_name,
          email: m.email,
          phone: m.phone,
          department: m.department,
        })),
      });

      if (emailResult.success) {
        addLog('success', `Confirmation email delivered to ${team.leader_email} for category "${team.category}".`);
        return NextResponse.json({
          success: true,
          message: `Confirmation email delivered to ${team.leader_email}.`,
          logs,
        });
      } else {
        return NextResponse.json({ success: false, error: emailResult.error || 'Failed to dispatch email' }, { status: 500 });
      }
    }

    if (action === 'update_category') {
      if (!team_id || !target_category) {
        return NextResponse.json({ success: false, error: 'team_id and target_category required' }, { status: 400 });
      }

      addLog('info', `Updating Team ID #${team_id} category to "${target_category}"...`);
      await pool.query(`UPDATE she_pitch_teams SET category = ? WHERE id = ?`, [target_category, team_id]);
      addLog('success', `Team ID #${team_id} category updated to "${target_category}".`);

      return NextResponse.json({
        success: true,
        message: `Category updated to ${target_category}`,
        logs,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    addLog('error', `Error in POST handler: ${err.message}`);
    return NextResponse.json({ success: false, error: err.message, logs }, { status: 500 });
  }
}
