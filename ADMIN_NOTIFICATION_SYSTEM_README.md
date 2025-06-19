# 🔔 Admin Notification System - KIRAN

## 📋 Overview

The KIRAN Admin Notification System provides comprehensive real-time notifications to administrators about platform activities, system health, and performance metrics. This system ensures admins stay informed about all important events and can take proactive actions.

## 🚀 Features Implemented

### 📈 Activity Notifications
- **New Student Registrations** 👨‍🎓
- **New Doubt Submissions** ❓
- **Meeting Requests** 🤝
- **Feedback Submissions** ⭐

### ⚠️ System Alerts
- **High Doubt Volume** - Alerts when pending doubts exceed threshold
- **Meeting Conflicts** - Warns about mentor scheduling conflicts
- **Storage Warnings** - Monitors upload storage usage
- **System Alerts** - General system notifications

### 📊 Dashboard Notifications
- **Daily Summaries** - Daily activity reports
- **Weekly Summaries** - Weekly performance reports
- **Performance Metrics** - Platform statistics
- **User Engagement Reports** - User activity analysis

## 🏗️ Architecture

### Backend Components

#### 1. **Enhanced Notification Model** (`backend/models/Notification.js`)
```javascript
// New fields added:
- priority: 'low' | 'medium' | 'high' | 'urgent'
- category: 'activity' | 'system' | 'dashboard' | 'general'
- metadata: Mixed (for additional data)
```

#### 2. **Admin Notification Service** (`backend/services/adminNotificationService.js`)
- Centralized service for all admin notifications
- Methods for each notification type
- System health monitoring
- Performance metrics generation

#### 3. **Scheduler Service** (`backend/services/schedulerService.js`)
- Automated notification generation
- Cron jobs for periodic reports
- Manual trigger methods for testing

### Frontend Components

#### 1. **Enhanced NotificationIcon** (`frontend/src/components/NotificationIcon.jsx`)
- Support for new notification types
- Priority indicators
- Category labels
- Enhanced styling

#### 2. **Updated CSS** (`frontend/src/styles/notification-icon.css`)
- Priority-based color coding
- Category-specific styling
- Mobile responsive design

## 📅 Scheduled Tasks

### Daily Tasks
- **9:00 AM** - Daily activity summary
- **Every 6 hours** - System health checks
- **Every 2 hours (9 AM - 6 PM)** - High priority checks

### Weekly Tasks
- **Sunday 10:00 AM** - Weekly performance summary
- **Monday 8:00 AM** - Performance metrics
- **Wednesday 9:00 AM** - User engagement report

## 🔧 API Endpoints

### Test Endpoints (Manual Triggers)
```bash
# Daily Summary
POST /api/admin/notifications/test/daily-summary

# Weekly Summary
POST /api/admin/notifications/test/weekly-summary

# System Checks
POST /api/admin/notifications/test/system-checks

# Performance Metrics
POST /api/admin/notifications/test/performance-metrics

# User Engagement
POST /api/admin/notifications/test/user-engagement
```

## 🎨 Notification Types & Icons

### Activity Notifications
- 👨‍🎓 New Student Registration
- ❓ New Doubt Submission
- 🤝 Meeting Request
- ⭐ Feedback Submission

### System Alerts
- ⚠️ High Doubt Volume
- 🚨 Meeting Conflict
- 💾 Storage Warning
- 🔧 System Alert

### Dashboard Notifications
- 📊 Daily Summary
- 📈 Weekly Summary
- 📋 Performance Metrics
- 👥 User Engagement

## 🎯 Priority Levels

### Color Coding
- **🔴 Urgent** - Red (#ef4444)
- **🟡 High** - Amber (#f59e0b)
- **🔵 Medium** - Blue (#3b82f6)
- **⚪ Low** - Gray (#6b7280)

## 📱 Mobile Responsive

The notification system is fully responsive and works seamlessly on:
- 📱 Mobile devices (360px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install node-cron
```

### 2. Start the Server
```bash
npm run dev
```

The scheduler will automatically initialize when the server starts.

### 3. Test Notifications
Use the test endpoints to manually trigger notifications:

```bash
# Test daily summary
curl -X POST http://localhost:5000/api/admin/notifications/test/daily-summary

# Test system checks
curl -X POST http://localhost:5000/api/admin/notifications/test/system-checks
```

## 🔍 Monitoring & Debugging

### Console Logs
The system provides detailed console logs for:
- Scheduler initialization
- Notification generation
- Error handling
- System health checks

### Database Queries
Monitor notification data in MongoDB:
```javascript
// View all admin notifications
db.notifications.find({ "userId": { $in: adminUserIds } })

// View unread notifications
db.notifications.find({ "isRead": false, "userId": { $in: adminUserIds } })
```

## 📊 Performance Metrics

The system tracks:
- **User Registration Rates**
- **Doubt Resolution Rates**
- **Meeting Completion Rates**
- **User Engagement Levels**
- **System Health Metrics**

## 🔒 Security Features

- **Role-based Access** - Only admins receive admin notifications
- **Authentication Required** - All notification endpoints require valid tokens
- **Data Validation** - All notification data is validated before storage

## 🛠️ Customization

### Adding New Notification Types
1. Update the Notification model enum
2. Add method to AdminNotificationService
3. Update frontend icon mapping
4. Add CSS styling if needed

### Modifying Schedules
Edit `backend/services/schedulerService.js` to change:
- Timing of reports
- Frequency of checks
- Timezone settings

### Threshold Adjustments
Modify thresholds in `AdminNotificationService`:
- Doubt volume threshold (currently 10)
- Storage warning threshold (currently 500MB)
- Meeting conflict threshold (currently 3 meetings)

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check if admin users exist
   - Verify scheduler is running
   - Check console logs for errors

2. **Scheduled tasks not running**
   - Verify node-cron is installed
   - Check timezone settings
   - Ensure server is running

3. **Frontend not displaying notifications**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check authentication status

### Debug Commands
```bash
# Check scheduler status
curl http://localhost:5000/api/test

# Manually trigger notifications
curl -X POST http://localhost:5000/api/admin/notifications/test/daily-summary

# Check notification count
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/notifications/unread-count
```

## 📈 Future Enhancements

### Planned Features
- **Email Notifications** - Send notifications via email
- **Push Notifications** - Real-time browser notifications
- **Notification Preferences** - Allow admins to customize notification types
- **Advanced Analytics** - More detailed performance metrics
- **Integration Alerts** - Third-party service notifications

### Performance Optimizations
- **Caching** - Cache frequently accessed notification data
- **Batch Processing** - Process notifications in batches
- **Database Indexing** - Optimize notification queries

## 📞 Support

For issues or questions about the Admin Notification System:
1. Check the console logs for error messages
2. Review the troubleshooting section
3. Test with manual trigger endpoints
4. Verify database connectivity

---

**🎉 The KIRAN Admin Notification System is now fully operational and will keep administrators informed about all platform activities!** 