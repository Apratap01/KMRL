import express from 'express'
import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { createTransporter } from '../services/createTransporter.js'

const transporter = await createTransporter()

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
      [hashedToken, new Date(Date.now() + 15 * 60 * 1000), email] // 15 min expiry
    );

    // send reset link
    const resetUrl = `http://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Change Password Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to change your password.</p>`,
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
