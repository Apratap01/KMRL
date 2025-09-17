import express from 'express'
import { pool } from '../config/db.js'
import crypto from 'crypto'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail';

dotenv.config()

if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is missing in environment variables!");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email via SendGrid only
const sendResetPassword = async (to,passwordLink) => {
    const emailData = {
        from: `"LegalDocs" <${process.env.FROM_EMAIL || process.env.SENDGRID_VERIFIED_EMAIL}>`,
        to,
        subject: "Change your password",
        text: `Hello ! Click here to change your password: ${passwordLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${passwordLink}" 
                       style="background-color: #007cba; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Change Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${passwordLink}</p>
                <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
            </div>
        `,
    };

    try {
        const info = await sgMail.send(emailData);
        console.log("✅ Email sent via SendGrid");
        return { success: true, provider: 'SendGrid' };
    } catch (sendGridError) {
        console.error("❌ SendGrid failed:", sendGridError.message);
        if (sendGridError.response) {
            console.error("SendGrid error details:", sendGridError.response.body);
        }
        throw new Error("SendGrid email failed");
    }
};

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const userRes = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await pool.query(
      `UPDATE users 
       SET reset_password_token = $1, reset_password_expires = $2
       WHERE email = $3`,
      [resetToken, new Date(Date.now() + 15 * 60 * 1000), email] // 15 min expiry
    );

    // send reset link
    const resetUrl = `http://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPassword(email,resetUrl)
    res.json({ message: "Password reset link sent to email"  , resetToken: resetToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
