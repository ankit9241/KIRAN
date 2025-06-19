const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'responded', 'resolved'],
        default: 'pending'
    },
    // Mentor response fields
    mentorResponse: {
        type: String
    },
    responseDate: {
        type: Date
    },
    // Document uploads
    uploadedDocuments: [{
        filename: String,
        originalName: String,
        filePath: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Doubt', doubtSchema); 