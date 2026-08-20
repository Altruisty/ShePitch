import nodemailer from 'nodemailer';
import pool from './db';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for 587
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
  const subject = `🏛️ ShePitch Chennai — Official Institutional Collaboration & Credentials for ${data.collegeName}`;

  const poster1Path = path.join(process.cwd(), 'public/assets/posters/poster-collaboration.jpg');
  const poster2Path = path.join(process.cwd(), 'public/assets/posters/poster-event.jpg');

  const attachments: any[] = [];
  let hasPoster1 = false;
  let hasPoster2 = false;

  if (fs.existsSync(poster1Path)) {
    attachments.push({
      filename: 'ShePitch-College-Collaboration-Invitation.jpg',
      path: poster1Path,
      cid: 'poster_collaboration',
    });
    hasPoster1 = true;
  }

  if (fs.existsSync(poster2Path)) {
    attachments.push({
      filename: 'ShePitch-Event-Poster.jpg',
      path: poster2Path,
      cid: 'poster_event',
    });
    hasPoster2 = true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(108,59,143,0.12); border: 1px solid #eaeaea;">
      
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #6C3B8F 0%, #a823f5 50%, #E83E8C 100%); padding: 35px 25px; text-align: center; color: #ffffff;">
        <span style="background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; uppercase; display: inline-block; margin-bottom: 8px;">OFFICIAL COLLABORATION INVITATION</span>
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">ShePitch Chennai</h1>
        <p style="margin: 6px 0 0 0; font-size: 15px; opacity: 0.95; font-weight: 500;">UGHAM &bull; Powered by icebrkr &bull; Venue: Jeppiaar University</p>
      </div>

      <div style="padding: 30px 25px; color: #333333; line-height: 1.6;">
        <h2 style="color: #6C3B8F; margin-top: 0; font-size: 22px; font-weight: 800;">Respected ${data.repName},</h2>
        <p style="font-size: 15px; color: #444444; margin-bottom: 20px;">
          We are honored to invite <strong>${data.collegeName}</strong> as an official Collaborating Institution for <strong>ShePitch Chennai</strong> — a premier national competition empowering women student innovators to pitch ideas, demonstrate prototypes, and launch tech careers.
        </p>
        
        <!-- 1. Login Credentials Card -->
        <div style="background: #f8f4fb; border-left: 5px solid #6C3B8F; padding: 22px; margin: 24px 0; border-radius: 10px; border-top: 1px solid #efe5f5; border-right: 1px solid #efe5f5; border-bottom: 1px solid #efe5f5;">
          <h3 style="margin-top: 0; color: #6C3B8F; font-size: 17px;">🔐 College Representative Portal Credentials:</h3>
          <p style="margin: 8px 0; font-size: 14px; color: #333333;"><strong>Portal Login URL:</strong> <a href="https://www.shepitch.com/college/login" style="color: #6C3B8F; font-weight: 700; text-decoration: underline;">${appUrl}/college/login</a></p>
          <p style="margin: 8px 0; font-size: 14px; color: #333333;"><strong>Username:</strong> <span style="background: #ffffff; padding: 3px 10px; border-radius: 6px; font-weight: 800; color: #E83E8C; border: 1px solid #e0cbe9;">${data.username}</span></p>
          <p style="margin: 8px 0; font-size: 14px; color: #333333;"><strong>Password:</strong> <span style="background: #ffffff; padding: 3px 10px; border-radius: 6px; font-weight: 800; color: #E83E8C; border: 1px solid #e0cbe9;">${data.password}</span></p>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #666666; font-style: italic;">* Use your portal dashboard to monitor student team registrations from ${data.collegeName} in real-time.</p>
        </div>

        <!-- 2. Exclusive Coupon Code Card -->
        <div style="background: linear-gradient(135deg, #fff5f9 0%, #fdf0f7 100%); border: 2px dashed #E83E8C; padding: 22px; margin: 24px 0; border-radius: 12px; text-align: center;">
          <span style="background: #E83E8C; color: #ffffff; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">EXCLUSIVE PARTNER DISCOUNT CODE</span>
          <h3 style="margin: 10px 0 4px 0; color: #6C3B8F; font-size: 18px;">Discount Coupon for ${data.collegeName} Students</h3>
          
          <div style="background: #ffffff; display: inline-block; padding: 10px 25px; margin: 12px 0; border-radius: 8px; border: 1px solid #f3c2dc; box-shadow: 0 4px 10px rgba(232,62,140,0.15);">
            <span style="font-size: 24px; font-weight: 900; color: #E83E8C; letter-spacing: 2px; font-family: monospace;">SHEPITCH100</span>
          </div>

          <p style="margin: 6px 0 0 0; font-size: 14px; color: #444444; font-weight: 600;">
            Share coupon code <span style="color: #E83E8C; font-weight: 800;">SHEPITCH100</span> with your female students during registration to give them an instant <strong>₹100 DISCOUNT PER PARTICIPANT</strong> (Fee reduced from ₹299 to ₹199 per member)!
          </p>
        </div>

        <!-- 3. Event Highlights & Institutional Benefits -->
        <h3 style="color: #333333; margin-top: 28px; font-size: 18px; border-bottom: 2px solid #6C3B8F; padding-bottom: 6px; display: inline-block;">
          ✨ Institutional Collaboration Highlights & Guidelines:
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; color: #444444;">
          <tr>
            <td style="padding: 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">🏆 <strong>Grand Prize Pool:</strong> ₹1,00,000 Cash Awards + Trophies</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">🏅 <strong>Shield of Recognition:</strong> Custom Shield presented on stage to ${data.collegeName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">👥 <strong>Team Nomination:</strong> Nominate between 10 to 20 Student Teams (2–4 female members per team)</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">👔 <strong>Institutional Representation:</strong> Minimum 1 representative (HOD, Placement Director, Dean, Principal, or Chairman) to join us during the Grand Finale</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">💼 <strong>Career Benefits:</strong> Internship Opportunities for top teams + 50+ Industry Mentors</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">🚀 <strong>icebrkr Sponsor Benefit:</strong> 1 Year of Free Access to icebrkr testing platform for all registered students</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">📅 <strong>Grand Finale Date & Venue:</strong> 19 September 2026 at Jeppiaar University, Chennai</td>
          </tr>
        </table>

        <!-- 4. Embedded Posters -->
        ${
          hasPoster1 || hasPoster2
            ? `
          <div style="margin-top: 30px; text-align: center;">
            <h3 style="color: #6C3B8F; font-size: 18px; margin-bottom: 15px;">📜 Official Collaboration & Event Posters:</h3>
            ${
              hasPoster1
                ? `<div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e5e5;">
                    <img src="cid:poster_collaboration" alt="College Collaboration Invitation" style="width: 100%; max-width: 630px; height: auto; display: block; margin: 0 auto;" />
                  </div>`
                : ''
            }
            ${
              hasPoster2
                ? `<div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e5e5;">
                    <img src="cid:poster_event" alt="ShePitch Event Poster" style="width: 100%; max-width: 630px; height: auto; display: block; margin: 0 auto;" />
                  </div>`
                : ''
            }
          </div>
        `
            : ''
        }

        <!-- 5. Contact & Links -->
        <div style="margin-top: 30px; padding: 20px; background: #f5f5f7; border-radius: 12px; text-align: center; font-size: 13px; color: #555555;">
          <p style="margin: 0 0 6px 0; font-weight: 700; color: #333333;">For Queries & Support Contact Us:</p>
          <p style="margin: 4px 0;">📞 Phone: <strong>8667839838</strong> | ✉️ Email: <strong>info@ugham.com</strong></p>
          <p style="margin: 4px 0;">🌐 Website: <a href="https://shepitch.com" style="color: #6C3B8F; font-weight: 700;">shepitch.com</a></p>
        </div>

      </div>

      <div style="background: #f0e6f5; padding: 18px; text-align: center; font-size: 12px; color: #6C3B8F; font-weight: 600;">
        &copy; ShePitch Chennai &bull; UGHAM &bull; Powered by icebrkr &bull; Venue: Jeppiaar University
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ShePitch Admin" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.email,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
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
