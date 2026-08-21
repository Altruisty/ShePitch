import nodemailer from 'nodemailer';
import pool from './db';
import path from 'path';
import fs from 'fs';

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

  const plainText = `
SHEPITCH CHENNAI - REGISTRATION & PAYMENT CONFIRMED

Dear ${data.leaderName},

Congratulations! Your payment has been received and team ${data.teamName} is officially registered for ShePitch Chennai organized by UGHAM at Jeppiaar University on 19 September 2026.

OFFICIAL RECEIPT & BOOKING SUMMARY:
- Payment ID: ${data.paymentId}
- Amount Paid: ₹${data.amountPaid}
- Category: ${data.category}
- College: ${data.collegeName}
${data.projectTitle ? `- Submitted Proposal: ${data.projectTitle}` : ''}

GRAND FINALE DETAILS:
- Date: 19 September 2026
- Venue: Jeppiaar University, Chennai

© ShePitch Chennai • UGHAM • Powered by icebrkr
`;

  try {
    await transporter.sendMail({
      from: `"ShePitch Team" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.leaderEmail,
      subject: subject,
      text: plainText,
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

  const poster1Url = 'https://www.shepitch.com/assets/posters/poster-collaboration.jpg';
  const poster2Url = 'https://www.shepitch.com/assets/posters/poster-event.jpg';
  const loginUrl = 'https://www.shepitch.com/college/login';

  const textContent = `
SHEPITCH CHENNAI - OFFICIAL INSTITUTIONAL COLLABORATION INVITATION

Respected ${data.repName},

We are honored to invite ${data.collegeName} as an official Collaborating Institution for ShePitch Chennai — a premier national competition empowering women student innovators.

🔐 COLLEGE REPRESENTATIVE PORTAL CREDENTIALS:
- Portal Login URL: ${loginUrl}
- Username: ${data.username}
- Password: ${data.password}

🎟️ EXCLUSIVE PARTNER DISCOUNT CODE FOR STUDENTS:
Share coupon code SHEPITCH100 with your female students during registration to give them an instant ₹100 DISCOUNT PER PARTICIPANT (Fee reduced from ₹299 to ₹199 per member)!

✨ INSTITUTIONAL COLLABORATION HIGHLIGHTS & GUIDELINES:
- Grand Prize Pool: ₹1,00,000 Cash Awards + Trophies
- Shield of Recognition: Custom Shield presented on stage to ${data.collegeName}
- Team Nomination: Nominate between 10 to 20 Student Teams (2–4 female members per team)
- Institutional Representation: Minimum 1 representative (HOD, Placement Director, Dean, Principal, or Chairman) to join us during the Grand Finale
- Career Benefits: Internship Opportunities for top teams + 50+ Industry Mentors
- icebrkr Sponsor Benefit: 1 Year of Free Access to icebrkr testing platform for all registered students
- Grand Finale Date & Venue: 19 September 2026 at Jeppiaar University, Chennai

📜 OFFICIAL EVENT POSTERS:
- College Collaboration Poster: ${poster1Url}
- ShePitch Event Poster: ${poster2Url}

For Queries & Support Contact Us:
Phone: 8667839838 | Email: info@ugham.com | Website: https://www.shepitch.com

ShePitch Chennai • UGHAM • Powered by icebrkr • Venue: Jeppiaar University
`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; color: #333333;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 680px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e2e8; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: #6C3B8F; padding: 30px 20px; text-align: center; color: #ffffff;">
                  <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 12px; margin-bottom: 8px;">OFFICIAL COLLABORATION INVITATION</div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">ShePitch Chennai</h1>
                  <p style="margin: 6px 0 0 0; font-size: 14px; color: #f3e8fa;">UGHAM &bull; Powered by icebrkr &bull; Venue: Jeppiaar University</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 30px 25px; line-height: 1.6;">
                  <h2 style="color: #6C3B8F; margin-top: 0; font-size: 20px;">Respected ${data.repName},</h2>
                  <p style="font-size: 15px; color: #444444; margin-bottom: 20px;">
                    We are honored to invite <strong>${data.collegeName}</strong> as an official Collaborating Institution for <strong>ShePitch Chennai</strong> — a premier national competition empowering women student innovators to pitch ideas, demonstrate prototypes, and launch tech careers.
                  </p>
                  
                  <!-- Credentials Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f4fb; border-left: 4px solid #6C3B8F; margin: 20px 0; border-radius: 6px;">
                    <tr>
                      <td style="padding: 18px 20px;">
                        <h3 style="margin: 0 0 10px 0; color: #6C3B8F; font-size: 16px;">🔐 College Representative Portal Credentials:</h3>
                        <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Portal Login URL:</strong> <a href="${loginUrl}" style="color: #6C3B8F; font-weight: bold; text-decoration: underline;">${loginUrl}</a></p>
                        <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Username:</strong> <strong style="color: #E83E8C;">${data.username}</strong></p>
                        <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Password:</strong> <strong style="color: #E83E8C;">${data.password}</strong></p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666666; font-style: italic;">* Use your portal dashboard to monitor student team registrations from ${data.collegeName} in real-time.</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Coupon Code Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff5f9; border: 2px dashed #E83E8C; margin: 20px 0; border-radius: 10px; text-align: center;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <div style="font-size: 11px; font-weight: bold; color: #ffffff; background: #E83E8C; display: inline-block; padding: 3px 10px; border-radius: 10px; text-transform: uppercase; margin-bottom: 8px;">EXCLUSIVE PARTNER DISCOUNT CODE</div>
                        <h3 style="margin: 4px 0; color: #6C3B8F; font-size: 16px;">Discount Coupon for ${data.collegeName} Students</h3>
                        <div style="margin: 10px 0;">
                          <span style="font-size: 22px; font-weight: bold; color: #E83E8C; letter-spacing: 2px; font-family: monospace; background: #ffffff; padding: 6px 16px; border: 1px solid #f3c2dc; border-radius: 6px; display: inline-block;">SHEPITCH100</span>
                        </div>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #444444;">
                          Share coupon code <strong style="color: #E83E8C;">SHEPITCH100</strong> with your female students to give them an instant <strong>₹100 DISCOUNT PER PARTICIPANT</strong> (Fee reduced from ₹299 to ₹199 per member)!
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Highlights Table -->
                  <h3 style="color: #333333; margin-top: 25px; font-size: 16px; border-bottom: 2px solid #6C3B8F; padding-bottom: 5px;">
                    ✨ Institutional Collaboration Highlights & Guidelines:
                  </h3>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 10px; font-size: 13px; color: #444444;">
                    <tr><td style="padding: 8px 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">🏆 <strong>Grand Prize Pool:</strong> ₹1,00,000 Cash Awards + Trophies</td></tr>
                    <tr><td style="padding: 8px 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">🏅 <strong>Shield of Recognition:</strong> Custom Shield presented on stage to ${data.collegeName}</td></tr>
                    <tr><td style="padding: 8px 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">👥 <strong>Team Nomination:</strong> Nominate between 10 to 20 Student Teams (2–4 female members per team)</td></tr>
                    <tr><td style="padding: 8px 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">👔 <strong>Institutional Representation:</strong> Minimum 1 representative (HOD, Placement Director, Dean, Principal, or Chairman) to join us during the Grand Finale</td></tr>
                    <tr><td style="padding: 8px 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">💼 <strong>Career Benefits:</strong> Internship Opportunities for top teams + 50+ Industry Mentors</td></tr>
                    <tr><td style="padding: 8px 10px; background: #ffffff; border-bottom: 1px solid #f0e6f5;">🚀 <strong>icebrkr Sponsor Benefit:</strong> 1 Year of Free Access to icebrkr testing platform for all registered students</td></tr>
                    <tr><td style="padding: 8px 10px; background: #fdfafc; border-bottom: 1px solid #f0e6f5;">📅 <strong>Grand Finale Date & Venue:</strong> 19 September 2026 at Jeppiaar University, Chennai</td></tr>
                  </table>

                  <!-- Posters Section -->
                  <div style="margin-top: 25px; text-align: center;">
                    <h3 style="color: #6C3B8F; font-size: 16px; margin-bottom: 12px;">📜 Official Collaboration & Event Posters:</h3>
                    <div style="margin-bottom: 15px;">
                      <img src="${poster1Url}" alt="College Collaboration Invitation" width="600" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; border: 1px solid #e5e5e5;" />
                    </div>
                    <div style="margin-bottom: 15px;">
                      <img src="${poster2Url}" alt="ShePitch Event Poster" width="600" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; border: 1px solid #e5e5e5;" />
                    </div>
                  </div>

                  <!-- Footer Info -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 25px; background: #f5f5f7; border-radius: 8px;">
                    <tr>
                      <td style="padding: 15px; text-align: center; font-size: 13px; color: #555555;">
                        <p style="margin: 0 0 4px 0; font-weight: bold; color: #333333;">For Queries & Support Contact Us:</p>
                        <p style="margin: 2px 0;">📞 Phone: <strong>8667839838</strong> | ✉️ Email: <strong>info@ugham.com</strong></p>
                        <p style="margin: 2px 0;">🌐 Website: <a href="https://www.shepitch.com" style="color: #6C3B8F; font-weight: bold;">shepitch.com</a></p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f0e6f5; padding: 15px; text-align: center; font-size: 12px; color: #6C3B8F; font-weight: bold;">
                  &copy; ShePitch Chennai &bull; UGHAM &bull; Powered by icebrkr &bull; Venue: Jeppiaar University
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ShePitch Admin" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.email,
      subject: subject,
      text: textContent,
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
    const plainText = data.htmlContent.replace(/<[^>]+>/g, '').trim();
    await transporter.sendMail({
      from: `"ShePitch Support" <${process.env.SMTP_USER || 'founder@ztoitech.com'}>`,
      to: data.to,
      subject: data.subject,
      text: plainText,
      html: data.htmlContent,
    });
    await logEmail(data.to, data.subject, 'custom_broadcast', 'sent');
    return { success: true };
  } catch (error: any) {
    await logEmail(data.to, data.subject, 'custom_broadcast', 'failed', error.message);
    return { success: false, error: error.message };
  }
}
