"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupJobs = startCleanupJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("./db"));
/**
 * Scheduled cleanup routine to enforce privacy and data retention.
 * Run daily at midnight (0 0 * * *).
 */
function startCleanupJobs() {
    console.log('[CRON] Initializing automated data retention cleanup schedule...');
    // Enforce retention limits: Delete anonymous questions published more than 30 days ago.
    // Their summary content is copied into public FAQs, so we do not retain raw records indefinitely.
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('[CRON] Executing scheduled data retention jobs...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const deletedQuestions = await db_1.default.anonymousQuestion.deleteMany({
                where: {
                    status: 'published',
                    publishedAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            console.log(`[CRON] Retention audit finished. Removed ${deletedQuestions.count} expired records.`);
        }
        catch (error) {
            console.error('[CRON] Error during retention cleanup:', error);
        }
    });
}
