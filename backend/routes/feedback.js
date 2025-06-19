const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const mentorAuth = require('../middleware/mentorAuth');
const AdminNotificationService = require('../services/adminNotificationService');

// Create feedback (mentor only)
router.post('/', [auth, mentorAuth], async (req, res) => {
  try {
    const feedback = new Feedback({
      text: req.body.text,
      student: req.body.studentId,
      mentor: req.user.id,
      rating: req.body.rating
    });

    const newFeedback = await feedback.save();
    await newFeedback.populate('student', 'name email');
    await newFeedback.populate('mentor', 'name email');
    
    // Notify admins about new feedback submission
    await AdminNotificationService.notifyFeedbackSubmission(newFeedback);
    
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all feedback for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.params.studentId })
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all feedback by a mentor
router.get('/mentor', [auth, mentorAuth], async (req, res) => {
  try {
    const feedback = await Feedback.find({ mentor: req.user.id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feedback (mentor only)
router.put('/:id', [auth, mentorAuth], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if the mentor owns this feedback
    if (feedback.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    feedback.text = req.body.text || feedback.text;
    feedback.rating = req.body.rating || feedback.rating;

    const updatedFeedback = await feedback.save();
    await updatedFeedback.populate('student', 'name email');
    await updatedFeedback.populate('mentor', 'name email');
    
    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete feedback (mentor only)
router.delete('/:id', [auth, mentorAuth], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if the mentor owns this feedback
    if (feedback.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 