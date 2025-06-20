const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
        }
    },
    password: {
        type: String,
        // Only require password for local (manual) signups
        required: function() { return this.authProvider !== 'google'; }
    },
    profilePicture: {
        type: String
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['student', 'mentor', 'admin'],
        default: 'student'
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    // Additional contact fields for mentors
    telegramId: {
        type: String
    },
    whatsapp: {
        type: String
    },
    linkedin: {
        type: String
    },
    website: {
        type: String
    },
    // Student-specific fields
    class: {
        type: String,
        required: function() { return this.role === 'student'; }
    },
    stream: {
        type: String,
        required: function() { return this.role === 'student'; }
    },
    targetExam: {
        type: String,
        required: function() { return this.role === 'student'; }
    },
    preferredSubjects: [{
        type: String,
        required: function() { return this.role === 'student'; }
    }],
    // Mentor-specific fields
    specialization: {
        type: String,
        required: function() { return this.role === 'mentor'; }
    },
    experience: {
        type: String,
        required: function() { return this.role === 'mentor'; }
    },
    subjectsTaught: [{
        type: String,
        required: function() { return this.role === 'mentor'; }
    }],
    teachingStyle: {
        type: String,
        required: function() { return this.role === 'mentor'; }
    },
    qualifications: {
        type: String,
        required: function() { return this.role === 'mentor'; }
    },
    // Mentor approval system
    mentorApprovalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    mentorApprovalDate: {
        type: Date
    },
    mentorApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    mentorRejectionReason: {
        type: String
    },
    // Admin-specific fields
    department: {
        type: String,
        required: false
    },
    adminRole: {
        type: String,
        required: false
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    // Common fields for both roles
    bio: {
        type: String
    },
    achievements: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0
    },
    learningGoals: {
        type: String,
        required: function() { return this.role === 'student'; }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    currentToken: {
        type: String,
        required: false
    },
    googleId: { type: String },
    isGoogleUser: { type: Boolean, default: false },
});

// Add a pre-save hook to check if email is already registered
userSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const existingUser = await this.constructor.findOne({ email: this.email });
            if (existingUser) {
                throw new Error('Email is already registered');
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        config.get('jwtSecret'),
        { expiresIn: '24h' }
    );
};

module.exports = mongoose.model('User', userSchema);
