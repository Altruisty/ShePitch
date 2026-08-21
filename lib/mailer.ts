import nodemailer from 'nodemailer';
import pool from './db';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
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
  const subject = `ShePitch Chennai - Registration Confirmed for Team ${data.teamName}`;

  const membersText = data.members
    .map((m, idx) => `${idx + 1}. ${m.student_name} (${m.email}) - Dept: ${m.department || 'N/A'}`)
    .join('\n');

  const textContent = `
Dear ${data.leaderName},

Congratulations! Your payment has been received and team "${data.teamName}" is officially registered for ShePitch Chennai organized by UGHAM at Jeppiaar University on 19 September 2026.

OFFICIAL RECEIPT & BOOKING SUMMARY:
- Payment ID: ${data.paymentId}
- Amount Paid: Rs. ${data.amountPaid}
- Category: ${data.category}
- College: ${data.collegeName}

${data.projectTitle ? `PITCH PROPOSAL:
- Title: ${data.projectTitle}
- Domain: ${data.domain || 'General'}
` : ''}

REGISTERED TEAM MEMBERS:
${membersText}

EVENT DETAILS:
- Grand Finale Date: 19 September 2026
- Venue: Jeppiaar University, Chennai
- Website: https://shepitch.com

Regards,
ShePitch Chennai Team | UGHAM | Powered by icebrkr
  `.trim();

  const membersListHtml = data.members
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
          <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #6C3B8F;">Submitted Pitch Proposal:</h3>
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
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background: #6C3B8F; padding: 25px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: bold;">ShePitch Chennai</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px;">National Women's Innovation Pitch Competition</p>
      </div>

      <div style="padding: 25px 20px; color: #333333; line-height: 1.5;">
        <h2 style="color: #6C3B8F; margin-top: 0; font-size: 20px;">Registration & Payment Confirmed!</h2>
        <p>Dear <strong>${data.leaderName}</strong>,</p>
        <p>Congratulations! Your payment has been received and team <strong>${data.teamName}</strong> is officially registered for <strong>ShePitch Chennai</strong> organized by <strong>UGHAM</strong> at Jeppiaar University on <strong>19 September 2026</strong>.</p>
        
        <div style="background: #fdf5f9; border-left: 4px solid #E83E8C; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6C3B8F;"><strong>Official Receipt & Booking Summary:</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Payment ID: <strong style="font-family: monospace; color: #111;">${data.paymentId}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Amount Paid: <strong style="color: #2e7d32;">Rs. ${data.amountPaid}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">Category: <strong>${data.category}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">College: <strong>${data.collegeName}</strong></p>
        </div>

        ${pitchProposalSection}

        <h3 style="color: #333; margin-top: 20px; font-size: 16px;">Registered Team Members (${data.members.length} Students)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444;">
          <thead>
            <tr style="background: #f5f0f8; text-align: left; color: #6C3B8F;">
              <th style="padding: 10px 8px;">Name</th>
              <th style="padding: 10px 8px;">Email</th>
              <th style="padding: 10px 8px;">Department</th>
            </tr>
          </thead>
          <tbody>
            ${membersListHtml}
          </tbody>
        </table>

        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 13px; color: #666;">
          <p style="margin-bottom: 4px;">Grand Finale Date: <strong>19 September 2026</strong></p>
          <p style="margin-top: 0;">Venue: <strong>Jeppiaar University, Chennai</strong></p>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        ShePitch Chennai &bull; UGHAM &bull; Powered by icebrkr
      </div>
    </div>
  `;

  const senderEmail = process.env.SMTP_USER || 'info@ugham.com';

  try {
    await transporter.sendMail({
      from: `"ShePitch Team" <${senderEmail}>`,
      to: data.leaderEmail,
      subject: subject,
      text: textContent,
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
  const subject = `ShePitch Chennai - Official Institutional Collaboration & Representative Portal Access for ${data.collegeName}`;

  const appUrl = 'https://shepitch.com';
  const poster1Path = path.join(process.cwd(), 'public/assets/posters/poster-collaboration.jpg');
  const poster2Path = path.join(process.cwd(), 'public/assets/posters/poster-event.jpg');

  const attachments: any[] = [];

  if (fs.existsSync(poster1Path)) {
    attachments.push({
      filename: 'ShePitch-College-Collaboration-Invitation.jpg',
      path: poster1Path,
    });
  }

  if (fs.existsSync(poster2Path)) {
    attachments.push({
      filename: 'ShePitch-Event-Poster.jpg',
      path: poster2Path,
    });
  }

  // Pure Plain Text Email
  const textContent = `
Respected ${data.repName},

We are honored to invite ${data.collegeName} as an official Collaborating Institution for ShePitch Chennai — a premier national competition empowering women student innovators to pitch ideas, demonstrate prototypes, and launch tech careers.

1. YOUR COLLEGE REPRESENTATIVE PORTAL CREDENTIALS:
- Portal Login URL: ${appUrl}/college/login
- Username: ${data.username}
- Password: ${data.password}

* Log in to your representative portal dashboard to view and monitor student team registrations from ${data.collegeName} in real-time.

2. EXCLUSIVE STUDENT DISCOUNT COUPON CODE:
- Coupon Code: SHEPITCH100
Share coupon code SHEPITCH100 with your female students during registration at ${appUrl}/register to give them an instant Rs. 100 DISCOUNT PER PARTICIPANT (Registration fee reduced from Rs. 299 to Rs. 199 per member).

3. INSTITUTIONAL COLLABORATION HIGHLIGHTS & GUIDELINES:
- Grand Prize Pool: Rs. 1,00,000 Cash Awards + Trophies
- Shield of Recognition: Custom Shield presented on stage to ${data.collegeName}
- Team Nomination: Nominate between 10 to 20 Student Teams (2 to 4 female members per team)
- Institutional Representation: Minimum 1 representative (HOD, Placement Director, Dean, Principal, or Chairman) to join us during the Grand Finale
- Career Benefits: Internship Opportunities for top teams + 50+ Industry Mentors
- icebrkr Sponsor Benefit: 1 Year of Free Access to icebrkr product testing platform for all registered students
- Grand Finale Date & Venue: 19 September 2026 at Jeppiaar University, Chennai

4. ATTACHMENTS:
Please find attached the 2 official posters:
- ShePitch-College-Collaboration-Invitation.jpg
- ShePitch-Event-Poster.jpg

FOR QUERIES & SUPPORT CONTACT US:
Phone: 8667839838
Email: info@ugham.com
Website: https://shepitch.com

Regards,
ShePitch Chennai Organizing Committee
UGHAM | Powered by icebrkr | Venue: Jeppiaar University
  `.trim();

  const senderEmail = process.env.SMTP_USER || 'info@ugham.com';

  try {
    const info = await transporter.sendMail({
      from: `"ShePitch Admin" <${senderEmail}>`,
      to: data.email,
      subject: subject,
      text: textContent,
      attachments: attachments,
    });
    await logEmail(data.email, subject, 'college_credentials', 'sent');
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    await logEmail(data.email, subject, 'college_credentials', 'failed', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendCustomEmail(data: { to: string; subject: string; htmlContent: string; textContent?: string }) {
  const senderEmail = process.env.SMTP_USER || 'info@ugham.com';
  const textFallback = data.textContent || data.htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    const info = await transporter.sendMail({
      from: `"ShePitch Support" <${senderEmail}>`,
      to: data.to,
      subject: data.subject,
      text: textFallback,
      html: data.htmlContent,
    });
    await logEmail(data.to, data.subject, 'custom_broadcast', 'sent');
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    await logEmail(data.to, data.subject, 'custom_broadcast', 'failed', error.message);
    return { success: false, error: error.message };
  }
}
