import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/student-dashboard.css';
import axios from 'axios';
import UserProfile from '../components/UserProfile';
import MentorList from '../components/MentorList';
import DoubtList from '../components/DoubtList';
import MeetingCard from '../components/MeetingCard';
import ResourceGrid from '../components/ResourceGrid';
import FeedbackList from '../components/FeedbackList';
import StudentMeetings from '../components/StudentMeetings';
import Announcements from '../components/Announcements';

const API_URL = 'http://localhost:5000/api/users';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setEditForm({
          name: response.data.name || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          bio: response.data.bio || '',
          learningGoals: response.data.learningGoals || '',
          preferredSubjects: (response.data.preferredSubjects || []).join(', '),
          achievements: (response.data.achievements || []).join(', ')
        });
        
        // Fetch user's doubts
        const doubtsResponse = await axios.get('http://localhost:5000/api/doubts/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoubts(doubtsResponse.data);
        
        // Fetch all mentors
        const mentorsResponse = await axios.get('http://localhost:5000/api/users/mentors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMentors(mentorsResponse.data);
        
        // Fetch feedback for the student
        const feedbackResponse = await axios.get(`http://localhost:5000/api/feedback/student/${response.data._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedback(feedbackResponse.data);
        
        // Fetch study materials for the student
        const materialsResponse = await axios.get('http://localhost:5000/api/study-material/public/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudyMaterials(materialsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    // Don't process the array immediately - just store the raw input value
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Process comma-separated fields before sending to API
      const processedForm = {
        ...editForm,
        preferredSubjects: editForm.preferredSubjects.split(',').map(item => item.trim()).filter(item => item),
        achievements: editForm.achievements.split(',').map(item => item.trim()).filter(item => item)
      };
      
      const response = await axios.patch(`${API_URL}/me`, processedForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setEditing(false);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      learningGoals: user.learningGoals || '',
      preferredSubjects: (user.preferredSubjects || []).join(', '),
      achievements: (user.achievements || []).join(', ')
    });
    setEditing(false);
    setMessage('');
  };

  const handleDoubtAdded = (doubtData) => {
    if (doubtData.type === 'delete') {
      // Remove doubt from list
      setDoubts(prev => prev.filter(d => d._id !== doubtData.doubtId));
    } else if (doubtData.type === 'update') {
      // Update existing doubt
      setDoubts(prev => prev.map(d => d._id === doubtData.doubt._id ? doubtData.doubt : d));
    } else {
      // Add new doubt
      setDoubts(prev => [doubtData, ...prev]);
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/study-material/download/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">Failed to load profile</div>;

  // Ensure all values are defined
  const nextMeeting = user.nextMeeting || null;
  const resources = user.resources || [];

  return (
    <div className="student-dashboard">
      <Announcements />
      <div className="profile-section">
        <div className="profile-header">
          <h1>Welcome, {user.name}</h1>
          <p>Your personalized learning dashboard</p>
        </div>
        
        {/* Profile Information Display */}
        <div className="profile-info">
          <div className="profile-item">
            <div className="icon">📚</div>
            <div className="content">
              <h3>Class</h3>
              <p className="capitalize">{user.class}</p>
            </div>
          </div>
          <div className="profile-item">
            <div className="icon">📚</div>
            <div className="content">
              <h3>Stream</h3>
              <p className="capitalize">{user.stream}</p>
            </div>
          </div>
          <div className="profile-item">
            <div className="icon">🎯</div>
            <div className="content">
              <h3>Target Exam</h3>
              <p className="uppercase">{user.targetExam}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Editing Section */}
        <div className="section-card profile-edit-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            {!editing && (
              <button 
                className="edit-btn"
                onClick={() => setEditing(true)}
              >
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            )}
          </div>
          
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {editing ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    rows="2"
                    autoComplete="street-address"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your interests, and what motivates you to learn..."
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="learningGoals">Learning Goals</label>
                  <textarea
                    id="learningGoals"
                    name="learningGoals"
                    value={editForm.learningGoals}
                    onChange={handleInputChange}
                    placeholder="What are your main learning objectives? What do you want to achieve?"
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="preferredSubjects">Preferred Subjects (comma-separated)</label>
                  <input
                    id="preferredSubjects"
                    type="text"
                    value={editForm.preferredSubjects}
                    onChange={(e) => handleArrayInputChange('preferredSubjects', e.target.value)}
                    placeholder="e.g., Mathematics, Physics, Chemistry"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="achievements">Achievements (comma-separated)</label>
                  <input
                    id="achievements"
                    type="text"
                    value={editForm.achievements}
                    onChange={(e) => handleArrayInputChange('achievements', e.target.value)}
                    placeholder="e.g., School topper, Math Olympiad winner, Science fair winner"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{user.address || 'Not provided'}</span>
                </div>
              </div>
              
              {user.bio && (
                <div className="detail-item full-width">
                  <label>Bio:</label>
                  <span>{user.bio}</span>
                </div>
              )}
              
              {user.learningGoals && (
                <div className="detail-item full-width">
                  <label>Learning Goals:</label>
                  <span>{user.learningGoals}</span>
                </div>
              )}
              
              <div className="detail-item full-width">
                <label>Preferred Subjects:</label>
                <div className="subject-tags">
                  {user.preferredSubjects && user.preferredSubjects.length > 0 ? (
                    user.preferredSubjects.map((subject, index) => (
                      <span key={index} className="subject-tag">{subject}</span>
                    ))
                  ) : (
                    <span className="no-data">No subjects specified</span>
                  )}
                </div>
              </div>
              
              <div className="detail-item full-width">
                <label>Achievements:</label>
                <div className="achievement-tags">
                  {user.achievements && user.achievements.length > 0 ? (
                    user.achievements.map((achievement, index) => (
                      <span key={index} className="achievement-tag">{achievement}</span>
                    ))
                  ) : (
                    <span className="no-data">No achievements added</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-content">
          <MentorList mentors={mentors} />
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Doubts</h2>
        </div>
        <div className="section-content">
          <DoubtList doubts={doubts} onDoubtAdded={handleDoubtAdded} />
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Upcoming Meetings</h2>
        </div>
        <div className="section-content">
          <StudentMeetings />
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Study Materials</h2>
          <Link to="/study-material" className="view-all-btn">
            View All Materials
          </Link>
        </div>
        <div className="section-content">
          {studyMaterials && studyMaterials.materials && studyMaterials.materials.length > 0 ? (
            <div className="materials-preview">
              {studyMaterials.materials.slice(0, 3).map((material) => (
                <div key={material._id} className="material-preview-card">
                  <div className="material-info">
                    <h4>{material.title}</h4>
                    <p>{material.description}</p>
                    <small>Subject: {material.subject}</small>
                  </div>
                  {material.filePath && (
                    <button
                      className="download-btn-small"
                      onClick={() => handleDownload(material._id, material.originalName)}
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
              {studyMaterials.materials.length > 3 && (
                <div className="more-materials">
                  <p>And {studyMaterials.materials.length - 3} more materials...</p>
                </div>
              )}
            </div>
          ) : (
            <p>No study materials available yet.</p>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Feedback</h2>
        </div>
        <div className="section-content">
          <FeedbackList feedback={feedback} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
