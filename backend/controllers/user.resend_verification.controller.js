import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail';

dotenv.config()

if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is missing in environment variables!");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email via SendGrid only
const sendVerificationEmail = async (to, name, verificationLink) => {
    const emailData = {
        from: `"LegalDocs" <${process.env.FROM_EMAIL || process.env.SENDGRID_VERIFIED_EMAIL}>`,
        to,
        subject: "Verify your email",
        text: `Hello ${name}! Click here to verify your email: ${verificationLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Welcome ${name}!</h2>
                <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #007cba; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationLink}</p>
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
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // find user
    const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.is_valid) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // delete any existing tokens for this user
    await pool.query("DELETE FROM is_email_valid WHERE user_id=$1", [user.id]);

    // generate new token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    await pool.query(
      "INSERT INTO is_email_valid (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    );

    const verifyUrl = `${process.env.BACKEND_URL}/api/user/verify-email?token=${token}`;

    // send email
    await sendVerificationEmail(user.email,user.name,verifyUrl)
    res.status(200).json({ message: "Verification email resent successfully"});
  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ message: "Server error" });
  }}