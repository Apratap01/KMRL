import nodemailer from 'nodemailer'
export const createTransporter = async () => {
    if (false) {
        // In production, use Gmail, Mailtrap, etc.
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // In development, use Ethereal test SMTP
        let testAccount = await nodemailer.createTestAccount();

        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};