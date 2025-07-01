const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['broadcast', 'meeting', 'doubt'],
        default: 'broadcast'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    },
    doubtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doubt'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema); 