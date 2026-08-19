import nodemailer from 'nodemailer';
import pool from './db';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function logEmail(
  recipient: string,
  subject: string,
  emailType: string,
  status: 'sent' | 'failed',
  errorMessage: string | null = null
) {
  try {
    await pool.query(
      `INSERT INTO she_pitch_email_logs (recipient_email, subject, email_type, status, error_message) VALUES (?, ?, ?, ?, ?)`,
      [recipient, subject, emailType, status, errorMessage]
    );
  } catch (err) {
  }
}

export async function sendTeamConfirmationEmail(data: {
  leaderName: string;
  leaderEmail: string;
  teamName: string;
  category: string;
  collegeName: string;
  amountPaid: number;
  paymentId: string;
  projectTitle?: string;
  domain?: string;
  projectDescription?: string;
  members: Array<{ student_name: string; email: string; phone: string; department?: string }>;
}) {
  const subject = `🎉 ShePitch Registration Confirmed - Team ${data.teamName}`;

  const membersList = data.members
    .map(
      (m, idx) =>
        `<tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 8px;">${idx + 1}. ${m.student_name} ${idx === 0 ? '<span style="font-size: 11px; background: #6C3B8F; color: #fff; padding: 2px 6px; border-radius: 10px; margin-left: 4px;">Leader</span>' : ''}</td>
          <td style="padding: 10px 8px;">${m.email}</td>
          <td style="padding: 10px 8px;">${m.department || 'N/A'}</td>
        </tr>`
    )
    .join('');

  const pitchProposalSection = data.projectTitle
    ? `
        <div style="background: #f8f4fb; border: 1px solid #e2d4eb; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #6C3B8F;">💡 Submitted Pitch Proposal:</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #333;"><strong>Title:</strong> ${data.projectTitle}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #333;"><strong>Domain:</strong> ${data.domain || 'General'}</p>
          ${
            data.projectDescription
              ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #555; line-height: 1.5; font-style: italic;">"${data.projectDescription}"</p>`
              : ''
          }
        </div>
      `
    : '';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
      <div style="background: linear-gradient(135deg, #6C3B8F, #E83E8C); padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800;">ShePitch Chennai</h1>
        <p style="margin: 5px 0 0 0; font-size: 15px; opacity: 0.9;">National Women's Innovation Pitch Competition</p>
      </div>

      <div style="padding: 30px 25px;">
        <h2 style="color: #6C3B8F; margin-top: 0;">Registration & Payment Confirmed!</h2>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">Dear <strong>${data.leaderName}</strong>,</p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">Congratulations! Your payment has been received and team <strong>${data.teamName}</strong> is officially registered for <strong>ShePitch Chennai</strong> organized by <strong>UGHAM</strong> at Jeppiaar University on <strong>19 September 2026</strong>.</p>
        
        <div style="background: #fdf5f9; border-left: 4px solid #E83E8C; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6C3B8F;"><strong>Official Receipt & Booking Summary:</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Payment ID: <strong style="font-family: monospace; color: #111;">${data.paymentId}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Amount Paid: <strong style="color: #2e7d32;">₹${data.amountPaid}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Category: <strong>${data.category}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">College: <strong>${data.collegeName}</strong></p>
        </div>

        ${pitchProposalSection}

        <h3 style="color: #333; margin-top: 25px;">Registered Team Members (${data.members.length} Students)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444;">
          <thead>
            <tr style="background: #f5f0f8; text-align: left; color: #6C3B8F;">
              <th style="padding: 10px 8px;">Name</th>
              <th style="padding: 10px 8px;">Email</th>
              <th style="padding: 10px 8px;">Department</th>
            </tr>
          </thead>
          <tbody>
            ${membersList}
          </tbody>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 13px; color: #777;">
          <p style="margin-bottom: 5px;">Grand Finale Date: <strong>19 September 2026</strong></p>
          <p style="margin-top: 0;">Venue: <strong>Jeppiaar University, Chennai</strong></p>
        </div>
      </div>

      <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        &copy; ShePitch Chennai &bull; UGHAM &bull; Powered by icebrkr
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ShePitch Team" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.leaderEmail,
      subject: subject,
      html: htmlContent,
    });
    await logEmail(data.leaderEmail, subject, 'team_confirmation', 'sent');
    return { success: true };
  } catch (error: any) {
    await logEmail(data.leaderEmail, subject, 'team_confirmation', 'failed', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendCollegeCredentialsEmail(data: {
  repName: string;
  collegeName: string;
  email: string;
  username: string;
  password: string;
}) {
  const subject = `🏛️ ShePitch College Portal Access - ${data.collegeName}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
      <div style="background: linear-gradient(135deg, #6C3B8F, #E83E8C); padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800;">ShePitch Chennai</h1>
        <p style="margin: 5px 0 0 0; font-size: 15px; opacity: 0.9;">College Representative Portal Access</p>
      </div>

      <div style="padding: 30px 25px;">
        <h2 style="color: #6C3B8F; margin-top: 0;">Welcome, ${data.repName}!</h2>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">Your institution <strong>${data.collegeName}</strong> has been registered as an official partner for <strong>ShePitch Chennai</strong>.</p>
        
        <div style="background: #f5f0f8; border: 1px solid #6C3B8F/20; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #6C3B8F;">Your Login Credentials:</h3>
          <p style="margin: 6px 0; font-size: 14px; color: #333;">Login URL: <strong>${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/college/login</strong></p>
          <p style="margin: 6px 0; font-size: 14px; color: #333;">Username: <strong style="color: #E83E8C;">${data.username}</strong></p>
          <p style="margin: 6px 0; font-size: 14px; color: #333;">Password: <strong style="color: #E83E8C;">${data.password}</strong></p>
        </div>

        <p style="font-size: 14px; color: #555;">Log in to view all teams and students registered from ${data.collegeName} and update your password.</p>
      </div>

      <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        &copy; ShePitch Chennai &bull; UGHAM &bull; Powered by icebrkr
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ShePitch Admin" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.email,
      subject: subject,
      html: htmlContent,
    });
    await logEmail(data.email, subject, 'college_credentials', 'sent');
    return { success: true };
  } catch (error: any) {
    await logEmail(data.email, subject, 'college_credentials', 'failed', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendCustomEmail(data: { to: string; subject: string; htmlContent: string }) {
  try {
    await transporter.sendMail({
      from: `"ShePitch Support" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.to,
      subject: data.subject,
      html: data.htmlContent,
    });
    await logEmail(data.to, data.subject, 'custom_broadcast', 'sent');
    return { success: true };
  } catch (error: any) {
    await logEmail(data.to, data.subject, 'custom_broadcast', 'failed', error.message);
    return { success: false, error: error.message };
  }
}
