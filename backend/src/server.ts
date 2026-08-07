import cron from 'node-cron';
import { createApp } from './app.js';
import { runBillingReminderJob } from './core/billing/billing-reminder.job.js';

const app = createApp();
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor voando na porta ${PORT}`);
});

// Todo dia às 06:00 (horário do servidor) — ver docs/BILLING.md.
cron.schedule('0 6 * * *', () => {
  runBillingReminderJob().catch((error) => console.error('[billing-reminder] erro no job:', error));
});
