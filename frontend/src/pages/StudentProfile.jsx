import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/student-profile.css';
import { FaCamera } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchStudentData();
  }, [studentId, navigate]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch student details
      const studentResponse = await axios.get(`http://localhost:5000/api/users/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(studentResponse.data);

      // Fetch student's doubts
      const doubtsResponse = await axios.get(`http://localhost:5000/api/doubts/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoubts(doubtsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load student profile');
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchStudentData(); // Refresh profile
    } catch (err) {
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  // Helper function to get last active date
  const getLastActive = () => {
    if (!student) return 'Unknown';
    // Use lastSeen field for accurate last activity tracking
    const lastActive = new Date(student.lastSeen || student.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return lastActive.toLocaleDateString();
  };

  // Helper function to check if student needs attention
  const getStudentFlags = () => {
    const flags = [];
    
    // Check if student has no doubts (might be inactive)
    if (doubts.length === 0) {
      flags.push({
        type: 'inactive',
        icon: 'fas fa-moon',
        text: 'No Recent Activity'
      });
    }
    
    // Check if student has many pending doubts (academic concern)
    const pendingDoubts = doubts.filter(d => d.status === 'pending').length;
    if (pendingDoubts > 3) {
      flags.push({
        type: 'academic-concern',
        icon: 'fas fa-exclamation-triangle',
        text: 'Multiple Pending Doubts'
      });
    }
    
    // Check if student has unresolved doubts for more than a week (emotional support)
    const oldDoubts = doubts.filter(d => {
      const doubtDate = new Date(d.createdAt);
      const now = new Date();
      const diffDays = Math.ceil((now - doubtDate) / (1000 * 60 * 60 * 24));
      return diffDays > 7 && d.status !== 'resolved';
    });
    
    if (oldDoubts.length > 0) {
      flags.push({
        type: 'emotional-support',
        icon: 'fas fa-heart',
        text: 'Needs Follow-up'
      });
    }
    
    return flags;
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const getDashboardRoute = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'mentor') return '/mentor';
    return '/';
  };

  if (loading) return <LoadingSpinner />;

  if (error || !student) {
    return (
      <div className="student-profile-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Student not found'}</p>
          <Link to={getDashboardRoute()} className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const studentFlags = getStudentFlags();

  return (
    <div className="student-profile-container">
      {/* Back Button - Moved to top */}
      <div className="top-back-button">
        <Link to={getDashboardRoute()} className="back-link">
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>

      {/* Student Profile Header - Always Visible */}
      <div className="profile-header">
        <div className="header-content">
          <div className="student-profile-info">
            <div className="student-avatar">
              <div className="avatar-circle" style={{position: 'relative', overflow: 'visible'}}>
                {student.profilePicture ? (
                  <img
                    src={`http://localhost:5000/${student.profilePicture.replace(/\\/g, '/')}`}
                    alt="Profile"
                    className="profile-img"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  student.name.charAt(0).toUpperCase()
                )}
                {/* Overlay camera icon for upload */}
                <label htmlFor="profile-pic-upload" className="profile-pic-upload-label">
                  <FaCamera className="profile-pic-upload-icon" />
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfilePicChange}
                    disabled={uploading}
                  />
                </label>
                {uploading && <div className="uploading-overlay">Uploading...</div>}
              </div>
            </div>
            
            <div className="student-details">
              <h1>{student.name}</h1>
              
              {/* Learning Goal Callout */}
              {student.learningGoals ? (
                <div className="learning-goal-callout">
                  <i className="fas fa-bullseye"></i>
                  <span>{student.learningGoals}</span>
                </div>
              ) : (
                <div className="learning-goal-callout no-goal">
                  <i className="fas fa-bullseye"></i>
                  <span>No learning goal set yet</span>
                </div>
              )}
              
              <div className="student-meta">
                <span className="meta-item">
                  <i className="fas fa-graduation-cap"></i>
                  {student.class} • {student.stream}
                </span>
                <span className="meta-item">
                  <i className="fas fa-target"></i>
                  {student.targetExam}
                </span>
              </div>
              
              {/* Preferred Subjects as Tags */}
              {student.preferredSubjects && student.preferredSubjects.length > 0 ? (
                <div className="preferred-subjects">
                  {student.preferredSubjects.map((subject, index) => (
                    <span key={index} className="subject-chip">
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="preferred-subjects">
                  <span className="subject-chip no-subjects">No subjects specified</span>
                </div>
              )}
              
              {/* Mentor Flags */}
              {studentFlags.length > 0 && (
                <div className="mentor-flags">
                  {studentFlags.map((flag, index) => (
                    <span key={index} className={`flag ${flag.type}`}>
                      <i className={flag.icon}></i>
                      {flag.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-navigation">
        <div className="nav-container">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-user"></i>
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'learning-journey' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning-journey')}
          >
            <i className="fas fa-road"></i>
            Learning Journey
          </button>
          <button 
            className={`nav-tab ${activeTab === 'doubts' ? 'active' : ''}`}
            onClick={() => setActiveTab('doubts')}
          >
            <i className="fas fa-question-circle"></i>
            Doubts ({doubts.length})
          </button>
          <button 
            className={`nav-tab ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            <i className="fas fa-trophy"></i>
            Milestones
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="content-grid">
              <div className="info-card">
                <h3>Profile Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Member Since</label>
                    <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Active</label>
                    <span>{getLastActive()}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{student.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{student.phone || 'Not provided'}</span>
                  </div>
                  {student.address && (
                    <div className="info-item">
                      <label>Address</label>
                      <span>{student.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Recent Feedback</h3>
                <div className="feedback-preview">
                  {doubts.length > 0 ? (
                    <div className="feedback-item">
                      <div className="feedback-header">
                        <span className="feedback-date">Latest doubt: {new Date(doubts[0].createdAt).toLocaleDateString()}</span>
                        <span className="feedback-rating">Active Learner</span>
                      </div>
                      <p>"Student is actively engaging with the learning process by asking questions."</p>
                    </div>
                  ) : (
                    <div className="no-feedback">
                      <i className="fas fa-comments"></i>
                      <h4>No Recent Activity</h4>
                      <p>This student hasn't asked any doubts yet. Consider reaching out to encourage engagement.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Activity Summary</h3>
                <div className="activity-summary">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-question-circle"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Doubts Asked</h4>
                      <span className="activity-number">{doubts.length}</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Active Days</h4>
                      <span className="activity-number">{Math.min(doubts.length, 7)}</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-comments"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Engagement Level</h4>
                      <span className="activity-number">
                        {doubts.length === 0 ? 'Low' : 
                         doubts.length <= 3 ? 'Medium' : 'High'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learning-journey' && (
          <div className="learning-journey-section">
            <div className="content-grid">
              <div className="info-card">
                <h3>Current Progress</h3>
                <div className="progress-summary">
                  {student.preferredSubjects && student.preferredSubjects.length > 0 ? (
                    student.preferredSubjects.map((subject, index) => {
                      const subjectDoubts = doubts.filter(d => d.subject === subject);
                      const progress = Math.min((subjectDoubts.length / 10) * 100, 100); // Simple progress calculation
                      
                      return (
                        <div key={index} className="progress-item">
                          <div className="progress-header">
                            <span>{subject}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{width: `${progress}%`}}></div>
                          </div>
                          <small>{subjectDoubts.length} doubts asked</small>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-progress">
                      <i className="fas fa-chart-line"></i>
                      <h4>No Progress Data</h4>
                      <p>No preferred subjects specified. Add subjects to track progress.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Weekly Study Summary</h3>
                <div className="weekly-summary">
                  {doubts.length > 0 ? (
                    <div className="summary-item">
                      <h4>Recent Activity</h4>
                      <p>Student has asked {doubts.length} doubt{doubts.length !== 1 ? 's' : ''} in total. 
                         {doubts.filter(d => d.status === 'resolved').length > 0 && 
                          ` ${doubts.filter(d => d.status === 'resolved').length} have been resolved.`}
                      </p>
                      <small>Last doubt: {new Date(doubts[0].createdAt).toLocaleDateString()}</small>
                    </div>
                  ) : (
                    <div className="no-summary">
                      <i className="fas fa-calendar-week"></i>
                      <h4>No Study Activity</h4>
                      <p>No recent study activity recorded. Encourage the student to engage more.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Mentor Notes</h3>
                <div className="mentor-notes">
                  {doubts.length > 0 ? (
                    <>
                      <div className="note-item">
                        <div className="note-header">
                          <span className="note-date">Based on current data</span>
                          <span className="note-tag">Observation</span>
                        </div>
                        <p>Student shows engagement through doubt asking. 
                           {doubts.filter(d => d.status === 'resolved').length > 0 ? 
                            ' Good progress in resolving doubts.' : 
                            ' Consider following up on pending doubts.'}
                        </p>
                      </div>
                      {student.learningGoals && (
                        <div className="note-item">
                          <div className="note-header">
                            <span className="note-date">Learning Goal</span>
                            <span className="note-tag">Focus</span>
                          </div>
                          <p>Student's learning goal: "{student.learningGoals}". 
                             Align doubt resolution with this objective.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-notes">
                      <i className="fas fa-sticky-note"></i>
                      <h4>No Notes Available</h4>
                      <p>No activity data available to generate notes. Consider reaching out to the student.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="doubts-section">
            <div className="doubts-header">
              <h3>Doubt History</h3>
              <div className="doubts-stats">
                <span className="stat-item">
                  <i className="fas fa-clock"></i>
                  Open: {doubts.filter(d => d.status === 'pending').length}
                </span>
                <span className="stat-item">
                  <i className="fas fa-user-check"></i>
                  In Progress: {doubts.filter(d => d.status === 'assigned').length}
                </span>
                <span className="stat-item">
                  <i className="fas fa-check-circle"></i>
                  Solved: {doubts.filter(d => d.status === 'resolved').length}
                </span>
              </div>
            </div>

            {/* Responsive: Table for desktop, cards for mobile */}
            <div className="doubts-list">
              {/* Desktop Table */}
              <div className="doubts-table-wrapper">
                <table className="doubts-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Mentor</th>
                      <th>Answer</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doubts.length > 0 ? (
                      doubts.map(doubt => (
                        <tr key={doubt._id}>
                          <td><span className="doubt-subject">{doubt.subject}</span></td>
                          <td className="doubt-title">{doubt.title}</td>
                          <td className="doubt-description">{doubt.description}</td>
                          <td><span className={`doubt-status ${doubt.status}`}>
                            {doubt.status === 'pending' ? 'Open' : doubt.status === 'assigned' ? 'In Progress' : 'Solved'}
                          </span></td>
                          <td>{doubt.mentor && doubt.mentor.name ? doubt.mentor.name : '-'}</td>
                          <td>{doubt.status === 'resolved' && doubt.mentorResponse ? doubt.mentorResponse : (doubt.status === 'resolved' ? <span style={{color:'#94a3b8'}}>No answer</span> : '-')}</td>
                          <td className="doubt-meta">
                            <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          <i className="fas fa-question-circle" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                          No doubts asked yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards (hidden on desktop via CSS) */}
              <div className="doubts-cards-mobile">
                {doubts.length > 0 ? (
                  doubts.map(doubt => (
                    <div key={doubt._id} className="doubt-card">
                      <div className="doubt-header">
                        <span className="doubt-subject">{doubt.subject}</span>
                        <span className={`doubt-status ${doubt.status}`}>
                          {doubt.status === 'pending' ? 'Open' : doubt.status === 'assigned' ? 'In Progress' : 'Solved'}
                        </span>
                      </div>
                      <h4 className="doubt-title">{doubt.title}</h4>
                      <p className="doubt-description">{doubt.description}</p>
                      {doubt.mentor && doubt.mentor.name && (
                        <div className="doubt-mentor" style={{marginTop:'0.5rem', color:'#2563eb', fontWeight:600}}>
                          Mentor: {doubt.mentor.name}
                        </div>
                      )}
                      {doubt.status === 'resolved' && (
                        <div className="doubt-answer" style={{marginTop:'0.5rem', color:'#059669', fontWeight:500}}>
                          Answer: {doubt.mentorResponse ? doubt.mentorResponse : <span style={{color:'#94a3b8'}}>No answer</span>}
                        </div>
                      )}
                      <div className="doubt-meta">
                        <i className="fas fa-calendar"></i>
                        <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-doubts">
                    <i className="fas fa-question-circle"></i>
                    <h4>No doubts asked yet</h4>
                    <p>This student hasn't asked any doubts yet. Consider encouraging them to engage more actively.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="milestones-section">
            <div className="content-grid">
              <div className="info-card">
                <h3>Major Study Goals</h3>
                <div className="milestones-list">
                  {student.learningGoals ? (
                    <div className="milestone-item in-progress">
                      <div className="milestone-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="milestone-content">
                        <h4>Learning Goal Achievement</h4>
                        <p>{student.learningGoals}</p>
                        <small>In progress - Continue supporting</small>
                      </div>
                    </div>
                  ) : (
                    <div className="no-milestones">
                      <i className="fas fa-target"></i>
                      <h4>No Goals Set</h4>
                      <p>No learning goals have been set for this student.</p>
                    </div>
                  )}
                  
                  {doubts.length > 0 && (
                    <div className="milestone-item completed">
                      <div className="milestone-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="milestone-content">
                        <h4>First Doubt Asked</h4>
                        <p>Student started engaging with the learning process</p>
                        <small>Completed: {new Date(doubts[0].createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Mentor-Set Milestones</h3>
                <div className="mentor-milestones">
                  {doubts.length > 0 ? (
                    <div className="milestone-item">
                      <div className="milestone-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="milestone-content">
                        <h4>Doubt Engagement</h4>
                        <p>Student actively asking questions</p>
                        <small>Current count: {doubts.length} doubts</small>
                      </div>
                    </div>
                  ) : (
                    <div className="no-milestones">
                      <i className="fas fa-star"></i>
                      <h4>No Milestones Set</h4>
                      <p>Consider setting engagement milestones for this student.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Consistency Achievements</h3>
                <div className="consistency-achievements">
                  {doubts.length > 0 ? (
                    <>
                      <div className="achievement-item">
                        <div className="achievement-icon">
                          <i className="fas fa-fire"></i>
                        </div>
                        <div className="achievement-content">
                          <h4>Doubt Asker</h4>
                          <p>Student has asked {doubts.length} doubt{doubts.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {doubts.filter(d => d.status === 'resolved').length > 0 && (
                        <div className="achievement-item">
                          <div className="achievement-icon">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <div className="achievement-content">
                            <h4>Problem Solver</h4>
                            <p>Resolved {doubts.filter(d => d.status === 'resolved').length} doubt{doubts.filter(d => d.status === 'resolved').length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-achievements">
                      <i className="fas fa-trophy"></i>
                      <h4>No Achievements Yet</h4>
                      <p>Student hasn't earned any achievements yet. Encourage engagement to unlock milestones.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Events & Workshops</h3>
                <div className="events-list">
                  <div className="no-events">
                    <i className="fas fa-users"></i>
                    <h4>No Events Attended</h4>
                    <p>No workshop or event participation recorded yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile; 