import cron from 'node-cron'
import { pool } from '../config/db.js'
import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'

dotenv.config()
if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key missing in environment variables!");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

        for (const doc of rows) {
            const msg = {
                to: doc.email,
                from: `"LegalDocs" <${process.env.FROM_EMAIL}>`, // Verified sender in SendGrid
                subject: "📌 Reminder: Document deadline is tomorrow",
                text: `Hello! Your document "${doc.title}" is due on ${doc.last_date}. Please take necessary action.`,
                html: `
                    <p>Hello!</p>
                    <p>Your document "<strong>${doc.title}</strong>" is due on <strong>${doc.last_date}</strong>. Please take necessary action.</p>
                `,
            };


            try {
                const response = await sgMail.send(msg);
                console.log(`✅ Reminder sent to ${doc.email}`);
            } catch (sendGridError) {
                console.error(`❌ Failed to send reminder to ${doc.email}:`, sendGridError.message);
                if (sendGridError.response) {
                    console.error(sendGridError.response.body);
                }
            }

            await client.query(
                "UPDATE docs SET reminder_sent = true WHERE id = $1",
                [doc.id]
            );
        }

    } catch (err) {
        console.error("Error in reminder cron job:", err);
    }
});
