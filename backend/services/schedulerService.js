// backend/services/schedulerService.js
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { pool } from '../config/db.js';
import { sendEmail } from './emailService.js';
import dayjs from 'dayjs';

const scheduler = new ToadScheduler();

export async function runTask(userId, docId, lastDate) {
    // Schedule a job to run at a specific time before the deadline
    // This is a simple example that checks every 24 hours. A more precise
    // implementation would schedule a one-off job for the specific date.
    
    // For this example, we'll run a check daily for upcoming deadlines
    const task = new Task('send deadline email', async () => {
        try {
            console.log(`Running deadline check for doc ID: ${docId}`);
            const client = await pool.connect();
            const today = dayjs();
            const deadline = dayjs(lastDate);
            
            // Check if the deadline is in 1 or 2 days
            if (deadline.diff(today, 'day') <= 2 && deadline.diff(today, 'day') >= 0) {
                // Get user email
                const userQuery = 'SELECT email FROM users WHERE id = $1';
                const userResult = await client.query(userQuery, [userId]);
                const userEmail = userResult.rows[0]?.email;
                
                if (userEmail) {
                    const subject = `Urgent: Action Required for Your Legal Document`;
                    const text = `
                        Hello,
                        
                        This is a reminder that the deadline for your document is approaching on ${deadline.format('YYYY-MM-DD')}.
                        Please take action to avoid any consequences.
                        
                        Thank you.
                    `;
                    await sendEmail(userEmail, subject, text);
                    console.log(`Email notification sent to ${userEmail} for doc ID: ${docId}`);
                }
            }
        } catch (error) {
            console.error(`Error sending deadline email for doc ID ${docId}:`, error);
        } finally {
            client.release();
        }
    });

    const job = new SimpleIntervalJob({ hours: 24, runImmediately: true }, task);
    scheduler.addSimpleIntervalJob(job);
    console.log(`Scheduled deadline check for doc ID: ${docId} on ${lastDate}`);
}