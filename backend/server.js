const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('config');
const SchedulerService = require('./services/schedulerService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
};

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'), mongooseOptions)
    .then(() => {
        // Initialize admin notification scheduler
        SchedulerService.init();
    })
    .catch(err => {
        process.exit(1); // Exit if connection fails
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/doubts', require('./routes/doubt'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/study-material', require('./routes/study-material'));
app.use('/api/meetings', require('./routes/meeting'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications'));

// Admin notification test routes
app.post('/api/admin/notifications/test/daily-summary', async (req, res) => {
    try {
        await SchedulerService.triggerDailySummary();
        res.json({ message: 'Daily summary triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error triggering daily summary', error: error.message });
    }
});

app.post('/api/admin/notifications/test/weekly-summary', async (req, res) => {
    try {
        await SchedulerService.triggerWeeklySummary();
        res.json({ message: 'Weekly summary triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error triggering weekly summary', error: error.message });
    }
});

app.post('/api/admin/notifications/test/system-checks', async (req, res) => {
    try {
        await SchedulerService.triggerSystemChecks();
        res.json({ message: 'System checks triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error triggering system checks', error: error.message });
    }
});

app.post('/api/admin/notifications/test/performance-metrics', async (req, res) => {
    try {
        await SchedulerService.triggerPerformanceMetrics();
        res.json({ message: 'Performance metrics triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error triggering performance metrics', error: error.message });
    }
});

app.post('/api/admin/notifications/test/user-engagement', async (req, res) => {
    try {
        await SchedulerService.triggerUserEngagement();
        res.json({ message: 'User engagement report triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error triggering user engagement report', error: error.message });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to KIRAN backend API' });
});

// Test route for debugging
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is running!',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: err.message
    });
});

const PORT = config.get('port') || 5000;
app.listen(PORT, () => {});
