import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
export const createTransporter = async () => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your App Password
      },
    });
};