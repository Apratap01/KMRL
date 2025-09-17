import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail'; // Add SendGrid as backup
import dotenv from 'dotenv';

dotenv.config();

// Multiple transporter options for better reliability
const createGmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Use service instead of manual host
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Make sure this is App Password, not regular password
        },
        // Remove custom port and secure settings when using 'service'
    });
};

// Alternative: SMTP2GO or other cloud-friendly services
const createSMTP2GOTransporter = () => {
    return nodemailer.createTransport({
        host: 'mail.smtp2go.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP2GO_USER,
            pass: process.env.SMTP2GO_PASS,
        },
    });
};

// SendGrid setup as fallback
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Function to send email with fallback options
const sendVerificationEmail = async (to, name, verificationLink) => {
    const emailData = {
        from: `"LegalDocs" <${process.env.EMAIL_USER}>`,
        to: to,
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

    // Try Gmail first
    try {
        const gmailTransporter = createGmailTransporter();
        const info = await gmailTransporter.sendMail(emailData);
        console.log("✅ Email sent via Gmail:", info.messageId);
        return { success: true, provider: 'Gmail', messageId: info.messageId };
    } catch (gmailError) {
        console.log("❌ Gmail failed:", gmailError.message);
        
        // Try SendGrid as fallback
        if (process.env.SENDGRID_API_KEY) {
            try {
                const sendGridData = {
                    to: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    text: emailData.text,
                    html: emailData.html,
                };
                
                const info = await sgMail.send(sendGridData);
                console.log("✅ Email sent via SendGrid");
                return { success: true, provider: 'SendGrid', messageId: info[0].headers['x-message-id'] };
            } catch (sendGridError) {
                console.log("❌ SendGrid failed:", sendGridError.message);
                
                // Try SMTP2GO or other service as final fallback
                if (process.env.SMTP2GO_USER && process.env.SMTP2GO_PASS) {
                    try {
                        const smtp2goTransporter = createSMTP2GOTransporter();
                        const info = await smtp2goTransporter.sendMail(emailData);
                        console.log("✅ Email sent via SMTP2GO:", info.messageId);
                        return { success: true, provider: 'SMTP2GO', messageId: info.messageId };
                    } catch (smtp2goError) {
                        console.log("❌ SMTP2GO failed:", smtp2goError.message);
                    }
                }
            }
        }
        
        // If all methods fail, throw error
        throw new Error(`All email services failed. Last error: ${gmailError.message}`);
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ "message": "Check your details" });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ "message": "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, provider) VALUES ($1, $2, $3, $4) RETURNING id, name, email, provider, created_at",
            [name, email, hashedPassword, "manual"]
        );

        const verificationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            "INSERT INTO is_email_valid (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [newUser.rows[0].id, verificationToken, expiresAt]
        );

        const verificationLink = `${process.env.BACKEND_URL}/api/user/verify-email?token=${verificationToken}`;
        console.log("Verification link:", verificationLink);

        // Send email with fallback options
        try {
            const emailResult = await sendVerificationEmail(
                newUser.rows[0].email,
                name,
                verificationLink
            );
            
            console.log(`✅ Email sent successfully via ${emailResult.provider} to:`, newUser.rows[0].email);
            
            res.status(201).json({
                message: "User registered successfully. Please check your email to verify.",
            });
        } catch (emailError) {
            console.error('❌ All email services failed:', emailError.message);
            
            // Still register the user but warn about email
            res.status(201).json({
                message: "User registered successfully, but email verification failed. Please contact support.",
                warning: "Email service temporarily unavailable"
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: "Server error" });
    }
};