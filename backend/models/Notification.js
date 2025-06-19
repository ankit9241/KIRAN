const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            // General notifications
            'announcement', 'message', 'reminder', 'update', 
            'doubt_response', 'meeting_scheduled',
            // Admin-specific notifications
            'new_student_registration', 'new_doubt_submission', 
            'meeting_request', 'feedback_submission',
            'new_mentor_registration', 'mentor_approval_update',
            'high_doubt_volume', 'meeting_conflict', 
            'storage_warning', 'user_activity_report',
            'daily_summary', 'weekly_summary', 'performance_metrics',
            'system_alert', 'user_engagement'
        ],
        default: 'announcement'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    senderName: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['activity', 'system', 'dashboard', 'general'],
        default: 'general'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['Announcement', 'Doubt', 'Meeting', 'StudyMaterial', 'User', 'Feedback']
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isActive: 1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 