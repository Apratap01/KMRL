// // backend/services/emailService.js
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// // You need to configure a transporter with your email service provider
// // e.g., using Gmail or an SMTP server
// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Example with Gmail
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export async function sendEmail(to, subject, text) {
//     const mailOptions = {
//         from: `"LegalDocs" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         text,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         return { success: true, message: 'Emai Notification Sent' };
//     } catch (error) {
//         console.error("Error sending email:", error);
//         throw new Error('Failed to send email.');
//     }
// }