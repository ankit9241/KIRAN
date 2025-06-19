const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// Enroll in a course
router.post('/:courseId', auth, async (req, res) => {
    try {
        const user = req.user;
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled
        if (user.enrolledCourses.includes(course._id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add course to user's enrolled courses
        user.enrolledCourses.push(course._id);
        await user.save();

        // Update course enrollment count
        course.enrollmentCount += 1;
        await course.save();

        res.json({
            message: 'Successfully enrolled in course',
            course: {
                id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                duration: course.duration,
                mentor: course.mentor
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's enrolled courses
router.get('/', auth, async (req, res) => {
    try {
        const user = req.user;
        
        // Get all enrolled courses with populated mentor details
        const courses = await Course.find({
            _id: { $in: user.enrolledCourses }
        }).populate('mentor', 'name specialization');

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unenroll from a course
router.delete('/:courseId', auth, async (req, res) => {
    try {
        const user = req.user;
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is enrolled in this course
        const index = user.enrolledCourses.indexOf(course._id);
        if (index === -1) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        // Remove course from user's enrolled courses
        user.enrolledCourses.splice(index, 1);
        await user.save();

        // Update course enrollment count
        course.enrollmentCount -= 1;
        await course.save();

        res.json({ message: 'Successfully unenrolled from course' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
