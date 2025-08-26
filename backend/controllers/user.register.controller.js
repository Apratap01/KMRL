import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createTransporter } from "../services/createTransporter.js"; 
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body
        if (!email || !password || !name) {
            return res.status(400).json({ "message": "Check your details" })
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ "message": "User already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password , provider) VALUES ($1, $2, $3 , $4) RETURNING id, name, email, provider, created_at",
            [name, email, hashedPassword, "manual"]
        );

        const verificationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            "INSERT INTO is_email_valid (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [newUser.rows[0].id, verificationToken, expiresAt]
        );

        const verificationLink = `http://localhost:1818/api/user/verify-email?token=${verificationToken}`;
        console.log("Verify your email:", verificationLink);

        // Create transporter inside function for better error handling
        const transporter = await createTransporter();

        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: newUser.rows[0].email,
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
        });

        console.log("✅ Email sent successfully to:", newUser.rows[0].email);
        
        // Only show preview URL if using Ethereal (for development)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("Preview URL: %s", previewUrl);
        }

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify.",
            ...(previewUrl && { previewUrl }) // Only include previewUrl if it exists
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: "Server error" });
    }
}