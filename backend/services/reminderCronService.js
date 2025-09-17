import cron from 'node-cron'
import { pool } from '../config/db.js'
import { createTransporter } from './createTransporter.js'
import dotenv from 'dotenv'
import nodemailer from "nodemailer"

dotenv.config()


cron.schedule("0 9 * * *", async () => {
    console.log("Running daily reminder cron job...");

    try {
        const client = await pool.connect();
        const tomorrowQuery = `
 SELECT d.id, d.title, d.last_date, u.email
FROM docs d
JOIN users u ON d.user_id = u.id
WHERE d.last_date = CURRENT_DATE + INTERVAL '1 day'
     AND d.reminder_sent = false;
`;


        const { rows } = await client.query(tomorrowQuery);

        const { rows: debugRows } = await client.query(`
  SELECT (timezone('Asia/Kolkata', now())::date + INTERVAL '1 day') AS tomorrow
`);
        console.log("Tomorrow according to DB (IST):", debugRows[0].tomorrow);

        console.log("Fetched rows:", rows);


        if (rows.length === 0) {
            console.log("No reminders to send today.");
            client.release();
            return;
        }

        const transporter = await createTransporter();

        for (const doc of rows) {
            const mailOptions = {
                from: `"LegalDocs" <${process.env.EMAIL_USER}>`,
                to: doc.email,
                subject: "📌 Reminder: Document deadline is tomorrow",
                text: `Hello! Your document "${doc.title}" is due on ${doc.last_date}. Please take necessary action.`,
            };

            const info = await transporter.sendMail(mailOptions);

            // Preview URL (only works for Ethereal)
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`Reminder sent to ${doc.email}: ${info.messageId}`);
            if (previewUrl) {
                console.log(`Preview email here: ${previewUrl}`);
            }

            // Update reminder_sent
            await client.query(
                "UPDATE docs SET reminder_sent = true WHERE id = $1",
                [doc.id]
            );
        }

    } catch (err) {
        console.error("Error in reminder cron job:", err);
    }
});
