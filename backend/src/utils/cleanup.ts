import cron from 'node-cron';
import prisma from './db';

/**
 * Scheduled cleanup routine to enforce privacy and data retention.
 * Run daily at midnight (0 0 * * *).
 */
export function startCleanupJobs() {
  console.log('[CRON] Initializing automated data retention cleanup schedule...');
  
  // Enforce retention limits: Delete anonymous questions published more than 30 days ago.
  // Their summary content is copied into public FAQs, so we do not retain raw records indefinitely.
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Executing scheduled data retention jobs...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedQuestions = await prisma.anonymousQuestion.deleteMany({
        where: {
          status: 'published',
          publishedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(`[CRON] Retention audit finished. Removed ${deletedQuestions.count} expired records.`);
    } catch (error) {
      console.error('[CRON] Error during retention cleanup:', error);
    }
  });
}
