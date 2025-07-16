import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/my-student-profile.css';
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';

const MyStudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    console.log('isEditOpen changed:', isEditOpen);
  }, [isEditOpen]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="my-student-profile-loading">Loading...</div>;
  if (error || !user) return <div className="my-student-profile-error">{error || 'Profile not found'}</div>;

  return (
    <div className={`my-student-profile-container${user.isPremium ? ' premium' : ''}`}>
      <div className="profile-header">
        <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <span className="email">{user.email}</span>
        </div>
        <button className="edit-profile-btn" onClick={() => { console.log('Edit button clicked'); setIsEditOpen(true); }}>
          <i className="fas fa-edit"></i> Edit Profile
        </button>
      </div>
      <div className="profile-details">
        {/* Academic Info Row above Profile Details */}
        <div className="profile-info-row">
          <div className="academic-badges">
            {user.class && (
              <span className="academic-badge">
                <i className="fas fa-graduation-cap"></i>
                Class {user.class}
              </span>
            )}
            {user.stream && (
              <span className="academic-badge">
                <i className="fas fa-book"></i>
                {user.stream}
              </span>
            )}
            {user.targetExam && (
              <span className="academic-badge">
                <i className="fas fa-bullseye"></i>
                {user.targetExam}
              </span>
            )}
          </div>
        </div>
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
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={user}
        userType="student"
        onSaveSuccess={updated => { setIsEditOpen(false); setUser(updated); }}
      />
    </div>
  );
};

export default MyStudentProfile; 