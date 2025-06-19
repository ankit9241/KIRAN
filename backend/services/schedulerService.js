const cron = require('node-cron');
const AdminNotificationService = require('./adminNotificationService');

class SchedulerService {
    static init() {
        // Daily summary at 9:00 AM
        cron.schedule('0 9 * * *', async () => {
            await AdminNotificationService.generateDailySummary();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // Weekly summary every Sunday at 10:00 AM
        cron.schedule('0 10 * * 0', async () => {
            await AdminNotificationService.generateWeeklySummary();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // Performance metrics every Monday at 8:00 AM
        cron.schedule('0 8 * * 1', async () => {
            await AdminNotificationService.generatePerformanceMetrics();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // User engagement report every Wednesday at 9:00 AM
        cron.schedule('0 9 * * 3', async () => {
            await AdminNotificationService.generateUserEngagementReport();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // System health checks every 6 hours
        cron.schedule('0 */6 * * *', async () => {
            await AdminNotificationService.checkAndNotifyHighDoubtVolume();
            await AdminNotificationService.checkAndNotifyMeetingConflicts();
            await AdminNotificationService.checkAndNotifyStorageUsage();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // High priority checks every 2 hours during business hours (9 AM - 6 PM)
        cron.schedule('0 9-18/2 * * 1-5', async () => {
            await AdminNotificationService.checkAndNotifyHighDoubtVolume();
        }, {
            timezone: 'Asia/Kolkata'
        });
    }

    // Manual trigger methods for testing
    static async triggerDailySummary() {
        await AdminNotificationService.generateDailySummary();
    }

    static async triggerWeeklySummary() {
        await AdminNotificationService.generateWeeklySummary();
    }

    static async triggerSystemChecks() {
        await AdminNotificationService.checkAndNotifyHighDoubtVolume();
        await AdminNotificationService.checkAndNotifyMeetingConflicts();
        await AdminNotificationService.checkAndNotifyStorageUsage();
    }

    static async triggerPerformanceMetrics() {
        await AdminNotificationService.generatePerformanceMetrics();
    }

    static async triggerUserEngagement() {
        await AdminNotificationService.generateUserEngagementReport();
    }
}

module.exports = SchedulerService; 