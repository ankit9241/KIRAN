import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/student-dashboard.css';

const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState({
    name: 'John Doe',
    class: '12th',
    stream: 'Science',
    targetExam: 'JEE',
    progress: 65,
    doubts: [
      {
        id: 1,
        type: 'Academic',
        text: "I don't understand the concept of entropy in thermodynamics.",
        status: 'pending',
        date: '2025-06-13',
        mentor: 'Dr. Smith'
      },
      {
        id: 2,
        type: 'Emotional',
        text: 'I feel stressed about the upcoming JEE exam.',
        status: 'resolved',
        date: '2025-06-12',
        mentor: 'Dr. Johnson'
      },
    ],
    resources: [
      {
        id: 1,
        title: 'Physics Notes - Thermodynamics',
        type: 'PDF',
        subject: 'Physics',
        date: '2025-06-13',
        mentor: 'Dr. Smith'
      },
      {
        id: 2,
        title: 'Chemistry Videos - Organic Chemistry',
        type: 'Video',
        subject: 'Chemistry',
        date: '2025-06-12',
        mentor: 'Dr. Johnson'
      },
    ],
    feedback: [
      {
        id: 1,
        date: '2025-06-13',
        text: 'Great progress in physics concepts! Keep up the good work.',
        mentor: 'Dr. Smith'
      },
      {
        id: 2,
        date: '2025-06-12',
        text: 'Good job on your chemistry practice. Keep it up!',
        mentor: 'Dr. Johnson'
      },
    ],
    nextMeeting: {
      date: '2025-06-15',
      time: '15:00',
      notes: 'Review thermodynamics concepts and practice problems.',
      mentor: 'Dr. Smith'
    },
    mentors: [
      {
        id: 1,
        name: 'Dr. Smith',
        subjects: ['Physics', 'Mathematics'],
        email: 'drsmith@kiraneducation.com'
      },
      {
        id: 2,
        name: 'Dr. Johnson',
        subjects: ['Chemistry', 'Biology'],
        email: 'drjohnson@kiraneducation.com'
      }
    ]
  });

  const [selectedDoubtType, setSelectedDoubtType] = useState('All');
  const [newDoubt, setNewDoubt] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleAddDoubt = () => {
    if (newDoubt.trim() && selectedMentor) {
      const newDoubtItem = {
        id: studentInfo.doubts.length + 1,
        type: selectedDoubtType,
        text: newDoubt,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        mentor: studentInfo.mentors.find(m => m.id === selectedMentor).name
      };
      setStudentInfo(prev => ({
        ...prev,
        doubts: [...prev.doubts, newDoubtItem],
      }));
      setNewDoubt('');
    }
  };

  const handleFeedbackSubmit = () => {
    if (selectedMentor && feedbackText.trim()) {
      const newFeedback = {
        id: studentInfo.feedback.length + 1,
        date: new Date().toISOString().split('T')[0],
        text: feedbackText,
        mentor: studentInfo.mentors.find(m => m.id === selectedMentor).name
      };
      setStudentInfo(prev => ({
        ...prev,
        feedback: [...prev.feedback, newFeedback],
      }));
      setFeedbackText('');
      setSelectedMentor(null);
    }
  };

  return (
    <div className="student-dashboard">
      <div className="student-header">
        <h1>Student Dashboard</h1>
        <p>Your personal space to track progress and manage your education</p>
      </div>

      <div className="profile-section">
        <div className="profile-photo">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="profile-info">
          <h2>{studentInfo.name}</h2>
          <p>{studentInfo.class} - {studentInfo.stream}</p>
          <p>Target Exam: {studentInfo.targetExam}</p>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">Progress: {studentInfo.progress}%</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${studentInfo.progress}%` }}></div>
        </div>
      </div>

      <div className="mentor-section">
        <h2>Assigned Mentors</h2>
        <div className="mentor-list">
          {studentInfo.mentors.map(mentor => (
            <div key={mentor.id} className="mentor-card">
              <div className="mentor-photo">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="mentor-info">
                <h3>{mentor.name}</h3>
                <p>{mentor.subjects.join(', ')}</p>
                <p>{mentor.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="doubts-section">
        <h2>Doubts</h2>
        <div className="doubt-list">
          {studentInfo.doubts
            .filter(doubt => 
              selectedDoubtType === 'All' || doubt.type === selectedDoubtType
            )
            .map(doubt => (
              <div key={doubt.id} className="doubt-card">
                <div className="doubt-type" style={{ backgroundColor: doubt.type === 'Academic' ? 'var(--primary-color)' : 'var(--warning-color)' }}>
                  {doubt.type}
                </div>
                <div className="doubt-content">
                  <p>{doubt.text}</p>
                  <p className="doubt-date">{doubt.date}</p>
                  <p className="doubt-mentor">Mentor: {doubt.mentor}</p>
                </div>
                <div className={`doubt-status ${doubt.status.toLowerCase()}`}>
                  {doubt.status}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="meetings-section">
        <h2>Upcoming Meetings</h2>
        <div className="meeting-card">
          <div className="meeting-info">
            <div className="meeting-item">
              <span className="meeting-label">Date:</span>
              <span className="meeting-value">{new Date(studentInfo.nextMeeting.date).toLocaleDateString()}</span>
            </div>
            <div className="meeting-item">
              <span className="meeting-label">Time:</span>
              <span className="meeting-value">{studentInfo.nextMeeting.time}</span>
            </div>
            <div className="meeting-item">
              <span className="meeting-label">Mentor:</span>
              <span className="meeting-value">{studentInfo.nextMeeting.mentor}</span>
            </div>
            <div className="meeting-item">
              <span className="meeting-label">Notes:</span>
              <span className="meeting-value">{studentInfo.nextMeeting.notes}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resources-section">
        <h2>Resources</h2>
        <div className="resource-grid">
          {studentInfo.resources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className={`resource-icon ${resource.type.toLowerCase()}`}>
                {resource.type === 'PDF' ? <i className="fas fa-file-pdf"></i> : <i className="fas fa-video"></i>}
              </div>
              <div className="resource-details">
                <h3>{resource.title}</h3>
                <p>{resource.subject}</p>
                <p>{new Date(resource.date).toLocaleDateString()}</p>
                <p className="resource-mentor">From: {resource.mentor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-section">
        <h2>Mentor Feedback</h2>
        <div className="feedback-list">
          {studentInfo.feedback.map((feedback) => (
            <div key={feedback.id} className="feedback-item">
              <div className="feedback-date">{new Date(feedback.date).toLocaleDateString()}</div>
              <div className="feedback-text">"{feedback.text}"</div>
              <div className="feedback-mentor">From: {feedback.mentor}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-section send">
        <h2>Send Feedback</h2>
        <div className="feedback-form">
          <div className="form-group">
            <label htmlFor="mentor">Select Mentor:</label>
            <select
              id="mentor"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              required
            >
              <option value="">Select a mentor</option>
              {studentInfo.mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name} - {mentor.subjects.join(', ')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="feedback">Your Feedback:</label>
            <textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Write your feedback here..."
              required
            />
          </div>
          <button onClick={handleFeedbackSubmit}>
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
