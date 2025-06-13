import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/mentor-dashboard.css';

const MentorDashboard = () => {
  const [mentorInfo, setMentorInfo] = useState({
    name: 'Dr. Smith',
    experience: '5 years',
    subjects: ['Physics', 'Mathematics'],
    email: 'drsmith@kiraneducation.com',
    students: 25,
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'John Doe',
      class: '12th',
      stream: 'Science',
      targetExam: 'JEE',
      progress: 65,
      doubts: 3,
      lastMeeting: '2025-06-10',
      nextMeeting: '2025-06-20',
      notes: 'Good progress in thermodynamics. Needs more practice with numericals.',
      emotionalNotes: 'Showing signs of exam stress. Needs more emotional support.',
    },
    {
      id: 2,
      name: 'Jane Smith',
      class: '12th',
      stream: 'Science',
      targetExam: 'NEET',
      progress: 75,
      doubts: 2,
      lastMeeting: '2025-06-11',
      nextMeeting: '2025-06-21',
      notes: 'Excellent grasp of organic chemistry. Working on biochemistry now.',
      emotionalNotes: 'Confident and motivated. Good emotional state.',
    },
  ]);

  const [doubts, setDoubts] = useState([
    {
      id: 1,
      studentId: 1,
      type: 'Academic',
      subject: 'Physics',
      question: 'Explain the concept of entropy in thermodynamics.',
      status: 'Pending',
      timestamp: '2025-06-12',
    },
    {
      id: 2,
      studentId: 2,
      type: 'Emotional',
      subject: 'Personal',
      question: 'Feeling overwhelmed with NEET preparation.',
      status: 'Pending',
      timestamp: '2025-06-12',
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [selectedDoubtType, setSelectedDoubtType] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [selectedStudentForResource, setSelectedStudentForResource] = useState(null);

  const handleMeetingNotes = (studentId, notes) => {
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, notes: notes }
        : student
    );
    setStudents(updatedStudents);
    setMeetingNotes('');
    setSelectedStudent(null);
  };

  const handleFeedback = () => {
    if (selectedStudent && feedback) {
      const updatedStudents = students.map(student => 
        student.id === parseInt(selectedStudent)
          ? { ...student, notes: feedback }
          : student
      );
      setStudents(updatedStudents);
      setFeedback('');
      setSelectedStudent(null);
    }
  };

  const handleResourceUpload = () => {
    if (resourceFile && selectedStudentForResource) {
      // Here you would typically upload the file to a server
      // For now, we'll just update the state
      const updatedStudents = students.map(student => 
        student.id === parseInt(selectedStudentForResource)
          ? { ...student, resources: [...(student.resources || []), resourceFile.name] }
          : student
      );
      setStudents(updatedStudents);
      setResourceFile(null);
      setSelectedStudentForResource(null);
    }
  };

  const handleDoubtStatus = (doubtId, status) => {
    const updatedDoubts = doubts.map(doubt => 
      doubt.id === doubtId 
        ? { ...doubt, status: status }
        : doubt
    );
    setDoubts(updatedDoubts);
  };

  const handleProgressUpdate = (studentId, currentProgress) => {
    const newProgress = Math.min(currentProgress + 5, 100); // Cap at 100%
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, progress: newProgress }
        : student
    );
    setStudents(updatedStudents);
  };

  return (
    <div className="mentor-dashboard">
      <div className="dashboard-header">
        <h1>Mentor Dashboard</h1>
        <p>Welcome, {mentorInfo.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-number">{mentorInfo.students}</div>
          <div className="stat-label">Total Students</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-number">{mentorInfo.experience}</div>
          <div className="stat-label">Experience</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-number">4.5</div>
          <div className="stat-label">Rating</div>
        </div>
      </div>

      {/* Assigned Students Table */}
      <div className="students-section">
        <h2>Assigned Students</h2>
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Doubt Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.progress}%</td>
                  <td>{student.doubts}</td>
                  <td>
                    <button className="view-details-btn">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doubt Queue Section */}
      <div className="doubts-section">
        <div className="doubts-header">
          <h2>Doubt Queue</h2>
          <div className="doubts-filter">
            <select
              value={selectedDoubtType}
              onChange={(e) => setSelectedDoubtType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Academic">Academic</option>
              <option value="Emotional">Emotional</option>
            </select>
          </div>
        </div>
        <div className="doubts-list">
          {doubts
            .filter(doubt => 
              selectedDoubtType === 'All' || doubt.type === selectedDoubtType
            )
            .map(doubt => (
              <div key={doubt.id} className="doubt-item">
                <div className="doubt-content">
                  <p><strong>Student:</strong> {students.find(s => s.id === doubt.studentId)?.name}</p>
                  <p><strong>Type:</strong> {doubt.type}</p>
                  <p><strong>Subject:</strong> {doubt.subject}</p>
                  <p><strong>Question:</strong> {doubt.question}</p>
                  <p><strong>Timestamp:</strong> {doubt.timestamp}</p>
                </div>
                <div className="doubt-status">
                  <span className={`status-badge ${doubt.status.toLowerCase()}`}>
                    {doubt.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <h2>Add Feedback</h2>
        <div className="feedback-form">
          <select onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback here..."
          />
          <button onClick={() => handleFeedback()}>Submit Feedback</button>
        </div>
      </div>

      {/* Resource Upload Section */}
      <div className="resources-section">
        <h2>Upload Resource</h2>
        <div className="resource-form">
          <select onChange={(e) => setSelectedStudentForResource(e.target.value)}>
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            onChange={(e) => setResourceFile(e.target.files[0])}
          />
          <button onClick={() => handleResourceUpload()}>Upload</button>
        </div>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="sessions-section">
        <h2>Upcoming Sessions</h2>
        <div className="sessions-table">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Meeting Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(student => student.nextMeeting)
                .map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.nextMeeting}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emotional Notes Section */}
      <div className="emotional-notes-section">
        <h2>Private Emotional Notes</h2>
        <div className="emotional-notes">
          {students.map(student => (
            <div key={student.id} className="student-notes">
              <h3>{student.name}</h3>
              <p>{student.emotionalNotes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
