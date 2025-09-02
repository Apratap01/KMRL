// import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
// import { pool } from '../config/db.js';
// import { sendEmail } from './emailService.js';
// import dayjs from 'dayjs';

// const scheduler = new ToadScheduler();

// export async function runTask(userId, docId, lastDate) {
//   const task = new Task('send deadline email', async () => {
//     let client;
//     try {
//       console.log(`Running deadline check for doc ID: ${docId}`);
//       client = await pool.connect();

//       const today = dayjs();
//       const deadline = dayjs(lastDate);
//       const daysLeft = deadline.diff(today, 'day');

//       if (daysLeft <= 2 && daysLeft >= 0) {
//         // Fetch user email
//         const { rows } = await client.query(
//           'SELECT email FROM users WHERE id = $1',
//           [userId]
//         );
//         const userEmail = rows[0]?.email;

//         if (userEmail) {
//           const subject = `Urgent: Action Required for Your Legal Document`;
//           const text = `
//             Hello,
            
//             This is a reminder that the deadline for your document is approaching on ${deadline.format(
//               'YYYY-MM-DD'
//             )}.
//             Please take action to avoid any consequences.
            
//             Thank you.
//           `;
//           await sendEmail(userEmail, subject, text);
//           console.log(
//             `Email notification sent to ${userEmail} for doc ID: ${docId}`
//           );
//         }
//       }
//     } catch (error) {
//       console.error(`Error sending deadline email for doc ID ${docId}:`, error);
//     } finally {
//       if (client) client.release();
//     }
//   });

//   // ⏱ Runs every 24h, executes immediately once too
//   const job = new SimpleIntervalJob({ hours: 24, runImmediately: true }, task);
//   scheduler.addSimpleIntervalJob(job);

//   console.log(`Scheduled daily deadline check for doc ID: ${docId} (deadline: ${lastDate})`);
// }
