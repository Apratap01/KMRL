import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { createTransporter } from "../services/createTransporter.js"; 
import nodemailer from 'nodemailer'

const transporter = await createTransporter()
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
    let info = await transporter.sendMail({
      from: `"LegalDocs" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.status(200).json({ message: "Verification email resent successfully" ,"Preview URL":nodemailer.getTestMessageUrl(info)});
  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ message: "Server error" });
  }}