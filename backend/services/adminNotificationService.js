const Notification = require('../models/Notification');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Meeting = require('../models/Meeting');
const Feedback = require('../models/Feedback');
const StudyMaterial = require('../models/StudyMaterial');

class AdminNotificationService {
    // Get all admin users
    static async getAdminUsers() {
        return await User.find({ role: 'admin' });
    }

    // Send notification to all admins
    static async notifyAdmins(notificationData) {
        try {
            const admins = await this.getAdminUsers();
            const notifications = admins.map(admin => ({
                userId: admin._id,
                ...notificationData
            }));

            await Notification.insertMany(notifications);
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    // Activity Notifications
    static async notifyNewStudentRegistration(student) {
        await this.notifyAdmins({
            type: 'new_student_registration',
            title: 'New Student Registration',
            message: `New student ${student.name} (${student.email}) has registered.`,
            senderName: 'System',
            priority: 'medium',
            category: 'activity',
            metadata: {
                studentId: student._id,
                studentName: student.name,
                studentEmail: student.email,
                registrationDate: student.createdAt
            },
            relatedId: student._id,
            relatedModel: 'User'
        });
    }

    static async notifyNewDoubtSubmission(doubt) {
        await this.notifyAdmins({
            type: 'new_doubt_submission',
            title: 'New Doubt Submission',
            message: `New doubt submitted: "${doubt.title}" by ${doubt.student.name}`,
            senderName: 'System',
            priority: 'medium',
            category: 'activity',
            metadata: {
                doubtId: doubt._id,
                doubtTitle: doubt.title,
                studentName: doubt.student.name,
                subject: doubt.subject
            },
            relatedId: doubt._id,
            relatedModel: 'Doubt'
        });
    }

    static async notifyMeetingRequest(meeting) {
        await this.notifyAdmins({
            type: 'meeting_request',
            title: 'New Meeting Request',
            message: `Meeting request: ${meeting.title} between ${meeting.student.name} and ${meeting.mentor.name}`,
            senderName: 'System',
            priority: 'medium',
            category: 'activity',
            metadata: {
                meetingId: meeting._id,
                meetingTitle: meeting.title,
                studentName: meeting.student.name,
                mentorName: meeting.mentor.name,
                meetingDate: meeting.date
            },
            relatedId: meeting._id,
            relatedModel: 'Meeting'
        });
    }

    static async notifyFeedbackSubmission(feedback) {
        await this.notifyAdmins({
            type: 'feedback_submission',
            title: 'New Feedback Submission',
            message: `New feedback submitted by ${feedback.mentor.name} for ${feedback.student.name}`,
            senderName: 'System',
            priority: 'low',
            category: 'activity',
            metadata: {
                feedbackId: feedback._id,
                mentorName: feedback.mentor.name,
                studentName: feedback.student.name,
                rating: feedback.rating
            },
            relatedId: feedback._id,
            relatedModel: 'Feedback'
        });
    }

    static async notifyNewMentorRegistration(mentor) {
        await this.notifyAdmins({
            type: 'new_mentor_registration',
            title: 'New Mentor Registration Request',
            message: `New mentor ${mentor.name} (${mentor.email}) has registered and is awaiting approval.`,
            senderName: 'System',
            priority: 'high',
            category: 'activity',
            metadata: {
                mentorId: mentor._id,
                mentorName: mentor.name,
                mentorEmail: mentor.email,
                specialization: mentor.specialization,
                experience: mentor.experience,
                qualifications: mentor.qualifications,
                registrationDate: mentor.createdAt
            },
            relatedId: mentor._id,
            relatedModel: 'User'
        });
    }

    static async notifyMentorApproval(mentor, admin, action) {
        const actionText = action === 'approved' ? 'approved' : 'rejected';
        const priority = action === 'approved' ? 'medium' : 'high';
        
        await this.notifyAdmins({
            type: 'mentor_approval_update',
            title: `Mentor ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
            message: `Mentor ${mentor.name} has been ${actionText} by ${admin.name}.`,
            senderName: 'System',
            priority: priority,
            category: 'activity',
            metadata: {
                mentorId: mentor._id,
                mentorName: mentor.name,
                mentorEmail: mentor.email,
                action: action,
                adminName: admin.name,
                adminId: admin._id,
                approvalDate: new Date(),
                rejectionReason: mentor.mentorRejectionReason
            },
            relatedId: mentor._id,
            relatedModel: 'User'
        });
    }

    // System Alerts
    static async checkAndNotifyHighDoubtVolume() {
        try {
            const pendingDoubts = await Doubt.countDocuments({ status: 'pending' });
            
            if (pendingDoubts >= 10) {
                await this.notifyAdmins({
                    type: 'high_doubt_volume',
                    title: 'High Doubt Volume Alert',
                    message: `There are ${pendingDoubts} pending doubts that need attention.`,
                    senderName: 'System',
                    priority: 'high',
                    category: 'system',
                    metadata: {
                        pendingCount: pendingDoubts,
                        threshold: 10
                    }
                });
            }
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    static async checkAndNotifyMeetingConflicts() {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const meetings = await Meeting.find({
                date: { $gte: today, $lt: tomorrow },
                status: 'scheduled'
            }).populate('student mentor');

            // Check for overlapping meetings for same mentor
            const mentorMeetings = {};
            meetings.forEach(meeting => {
                if (!mentorMeetings[meeting.mentor._id]) {
                    mentorMeetings[meeting.mentor._id] = [];
                }
                mentorMeetings[meeting.mentor._id].push(meeting);
            });

            for (const [mentorId, mentorMeetingList] of Object.entries(mentorMeetings)) {
                if (mentorMeetingList.length > 3) {
                    await this.notifyAdmins({
                        type: 'meeting_conflict',
                        title: 'High Meeting Volume Alert',
                        message: `${mentorMeetingList[0].mentor.name} has ${mentorMeetingList.length} meetings scheduled for today/tomorrow.`,
                        senderName: 'System',
                        priority: 'medium',
                        category: 'system',
                        metadata: {
                            mentorId: mentorId,
                            mentorName: mentorMeetingList[0].mentor.name,
                            meetingCount: mentorMeetingList.length,
                            meetings: mentorMeetingList.map(m => ({
                                id: m._id,
                                title: m.title,
                                date: m.date
                            }))
                        }
                    });
                }
            }
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    static async checkAndNotifyStorageUsage() {
        try {
            const fs = require('fs');
            const path = require('path');
            const uploadsDir = path.join(__dirname, '../uploads');
            
            if (fs.existsSync(uploadsDir)) {
                const stats = fs.statSync(uploadsDir);
                const sizeInMB = stats.size / (1024 * 1024);
                
                if (sizeInMB > 500) { // Alert if more than 500MB
                    await this.notifyAdmins({
                        type: 'storage_warning',
                        title: 'Storage Usage Warning',
                        message: `Upload storage usage is ${sizeInMB.toFixed(2)}MB. Consider cleanup.`,
                        senderName: 'System',
                        priority: 'medium',
                        category: 'system',
                        metadata: {
                            storageSize: sizeInMB,
                            threshold: 500,
                            unit: 'MB'
                        }
                    });
                }
            }
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    // Dashboard Notifications
    static async generateDailySummary() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const stats = {
                newStudents: await User.countDocuments({ 
                    role: 'student', 
                    createdAt: { $gte: today, $lt: tomorrow } 
                }),
                newDoubts: await Doubt.countDocuments({ 
                    createdAt: { $gte: today, $lt: tomorrow } 
                }),
                newMeetings: await Meeting.countDocuments({ 
                    createdAt: { $gte: today, $lt: tomorrow } 
                }),
                newFeedback: await Feedback.countDocuments({ 
                    createdAt: { $gte: today, $lt: tomorrow } 
                }),
                pendingDoubts: await Doubt.countDocuments({ status: 'pending' }),
                totalUsers: await User.countDocuments({ role: { $in: ['student', 'mentor'] } })
            };

            await this.notifyAdmins({
                type: 'daily_summary',
                title: 'Daily Activity Summary',
                message: `Today's activity: ${stats.newStudents} new students, ${stats.newDoubts} doubts, ${stats.newMeetings} meetings, ${stats.newFeedback} feedback. ${stats.pendingDoubts} doubts pending.`,
                senderName: 'System',
                priority: 'low',
                category: 'dashboard',
                metadata: {
                    date: today,
                    stats: stats
                }
            });
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    static async generateWeeklySummary() {
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const stats = {
                newStudents: await User.countDocuments({ 
                    role: 'student', 
                    createdAt: { $gte: weekAgo } 
                }),
                newDoubts: await Doubt.countDocuments({ 
                    createdAt: { $gte: weekAgo } 
                }),
                resolvedDoubts: await Doubt.countDocuments({ 
                    status: 'resolved',
                    updatedAt: { $gte: weekAgo } 
                }),
                newMeetings: await Meeting.countDocuments({ 
                    createdAt: { $gte: weekAgo } 
                }),
                completedMeetings: await Meeting.countDocuments({ 
                    status: 'completed',
                    updatedAt: { $gte: weekAgo } 
                }),
                totalUsers: await User.countDocuments({ role: { $in: ['student', 'mentor'] } })
            };

            const resolutionRate = stats.newDoubts > 0 ? 
                ((stats.resolvedDoubts / stats.newDoubts) * 100).toFixed(1) : 0;

            await this.notifyAdmins({
                type: 'weekly_summary',
                title: 'Weekly Performance Summary',
                message: `Week summary: ${stats.newStudents} new students, ${stats.newDoubts} doubts (${resolutionRate}% resolved), ${stats.newMeetings} meetings.`,
                senderName: 'System',
                priority: 'low',
                category: 'dashboard',
                metadata: {
                    startDate: weekAgo,
                    endDate: new Date(),
                    stats: stats,
                    resolutionRate: resolutionRate
                }
            });
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    static async generatePerformanceMetrics() {
        try {
            const totalStudents = await User.countDocuments({ role: 'student' });
            const totalMentors = await User.countDocuments({ role: 'mentor' });
            const totalDoubts = await Doubt.countDocuments();
            const resolvedDoubts = await Doubt.countDocuments({ status: 'resolved' });
            const totalMeetings = await Meeting.countDocuments();
            const completedMeetings = await Meeting.countDocuments({ status: 'completed' });

            const doubtResolutionRate = totalDoubts > 0 ? 
                ((resolvedDoubts / totalDoubts) * 100).toFixed(1) : 0;
            const meetingCompletionRate = totalMeetings > 0 ? 
                ((completedMeetings / totalMeetings) * 100).toFixed(1) : 0;

            await this.notifyAdmins({
                type: 'performance_metrics',
                title: 'Performance Metrics Update',
                message: `Platform metrics: ${totalStudents} students, ${totalMentors} mentors, ${doubtResolutionRate}% doubt resolution, ${meetingCompletionRate}% meeting completion.`,
                senderName: 'System',
                priority: 'low',
                category: 'dashboard',
                metadata: {
                    totalStudents,
                    totalMentors,
                    totalDoubts,
                    resolvedDoubts,
                    totalMeetings,
                    completedMeetings,
                    doubtResolutionRate,
                    meetingCompletionRate
                }
            });
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    static async generateUserEngagementReport() {
        try {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const activeStudents = await User.countDocuments({
                role: 'student',
                lastSeen: { $gte: lastWeek }
            });

            const activeMentors = await User.countDocuments({
                role: 'mentor',
                lastSeen: { $gte: lastWeek }
            });

            const totalStudents = await User.countDocuments({ role: 'student' });
            const totalMentors = await User.countDocuments({ role: 'mentor' });

            const studentEngagement = totalStudents > 0 ? 
                ((activeStudents / totalStudents) * 100).toFixed(1) : 0;
            const mentorEngagement = totalMentors > 0 ? 
                ((activeMentors / totalMentors) * 100).toFixed(1) : 0;

            await this.notifyAdmins({
                type: 'user_engagement',
                title: 'User Engagement Report',
                message: `Engagement: ${studentEngagement}% students active, ${mentorEngagement}% mentors active in last 7 days.`,
                senderName: 'System',
                priority: 'low',
                category: 'dashboard',
                metadata: {
                    activeStudents,
                    activeMentors,
                    totalStudents,
                    totalMentors,
                    studentEngagement,
                    mentorEngagement,
                    period: '7 days'
                }
            });
        } catch (error) {
            // No need to log errors here, as they are handled by the caller
        }
    }

    // System-wide alerts
    static async sendSystemAlert(title, message, priority = 'medium', metadata = {}) {
        await this.notifyAdmins({
            type: 'system_alert',
            title: title,
            message: message,
            senderName: 'System',
            priority: priority,
            category: 'system',
            metadata: metadata
        });
    }
}

module.exports = AdminNotificationService; 