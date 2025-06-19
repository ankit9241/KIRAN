const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('config');
const AdminNotificationService = require('../services/adminNotificationService');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Single-device login enforcement for mentor and student
        if (user.role === 'mentor' || user.role === 'student') {
            user.currentToken = token;
            await user.save();
        }
        // For admin, do not overwrite currentToken (allow multiple sessions)

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// Register as student
router.post('/register/student', async (req, res) => {
    try {
        const { name, email, password, class: studentClass, stream, targetExam, preferredSubjects, learningGoals } = req.body;

        // Validate required fields
        if (!name || !email || !password || !studentClass || !stream || !targetExam || !preferredSubjects || !learningGoals) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            class: studentClass,
            stream,
            targetExam,
            preferredSubjects,
            learningGoals
        });

        await user.save();

        // Notify admins about new student registration
        await AdminNotificationService.notifyNewStudentRegistration(user);

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'student'
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Register as mentor
router.post('/register/mentor', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            specialization, 
            experience, 
            qualifications, 
            teachingStyle,
            phone,
            telegramId,
            whatsapp,
            address,
            linkedin,
            website,
            bio,
            achievements
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !specialization || !experience || !qualifications || !teachingStyle) {
            return res.status(400).json({ message: 'All required fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with mentor role (pending approval)
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'mentor',
            specialization,
            experience,
            qualifications,
            teachingStyle,
            subjectsTaught: [specialization],
            mentorApprovalStatus: 'pending', // Set initial status as pending
            // Contact information
            phone: phone || '',
            telegramId: telegramId || '',
            whatsapp: whatsapp || '',
            address: address || '',
            linkedin: linkedin || '',
            website: website || '',
            // Additional information
            bio: bio || '',
            achievements: achievements ? achievements.split('\n').filter(item => item.trim()) : []
        });

        await user.save();

        // Notify admins about new mentor registration request
        await AdminNotificationService.notifyNewMentorRegistration(user);

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'mentor',
                mentorApprovalStatus: 'pending'
            },
            token,
            message: 'Mentor registration submitted successfully. Your account is pending admin approval.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Register as admin
router.post('/register/admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with admin role
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'admin'
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Please authenticate' });
        }

        const decoded = jwt.verify(token, config.get('jwtSecret'));
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Please authenticate' });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Create specific admin user (for development/testing)
router.post('/create-admin', async (req, res) => {
    try {
        const adminEmail = 'adityasinghofficial296@gmail.com';
        const adminPassword = 'admin#1122';
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            // Update existing admin
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.name = 'Admin';
            await existingAdmin.save();
            
            res.json({ 
                message: 'Admin user updated successfully',
                email: adminEmail,
                password: adminPassword
            });
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminUser = new User({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await adminUser.save();
            
            res.status(201).json({ 
                message: 'Admin user created successfully',
                email: adminEmail,
                password: adminPassword
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to create admin user', error: error.message });
    }
});

module.exports = router;
