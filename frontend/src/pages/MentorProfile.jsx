import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/mentor-profile.css';

const MentorProfile = () => {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/users/${mentorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMentor(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        setError('Failed to load mentor profile');
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorProfile();
    }
  }, [mentorId, navigate]);

  if (loading) {
    return (
      <div className="mentor-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="mentor-profile-page">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Profile Not Found</h2>
          <p>{error || 'Mentor profile could not be loaded.'}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mentor-profile-page">
      <div className="profile-container">
        {/* Main Profile Content */}
        <div className="profile-main">
          {/* Header Section */}
          <div className="profile-header">
            <div className="header-content">
              <div className="header-left">
                <button onClick={() => navigate(-1)} className="back-btn">
                  <i className="fas fa-arrow-left"></i>
                  <span>Back</span>
                </button>
              </div>
              <div className="header-center">
                <h1 className="header-title">Mentor Profile</h1>
                <p className="header-subtitle">View detailed information about this mentor</p>
              </div>
              <div className="header-right">
                <span className="header-badge">Mentor</span>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            {/* Avatar and Basic Info */}
            <div className="profile-basic-info">
              <div className="profile-avatar">
                <div className="avatar-icon">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
              </div>
              
              <div className="profile-info">
                <h2 className="user-name">{mentor.name}</h2>
                <p className="user-email">{mentor.email}</p>
                <div className="badges-container">
                  <span className="role-badge mentor">
                    Mentor
                  </span>
                  
                  {mentor.mentorApprovalStatus && (
                    <span className={`approval-badge ${mentor.mentorApprovalStatus}`}>
                      {mentor.mentorApprovalStatus.charAt(0).toUpperCase() + mentor.mentorApprovalStatus.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="profile-details">
              {/* Professional Information */}
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-briefcase"></i>
                  Professional Information
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Specialization</label>
                    <span>{mentor.specialization || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Experience</label>
                    <span>{mentor.experience || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Qualifications</label>
                    <span>{mentor.qualifications || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Teaching Style</label>
                    <span>{mentor.teachingStyle || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Subjects Taught */}
              {mentor.subjectsTaught && mentor.subjectsTaught.length > 0 && (
                <div className="detail-section">
                  <h3 className="section-title">
                    <i className="fas fa-chalkboard"></i>
                    Subjects Taught
                  </h3>
                  <div className="subjects-container">
                    {mentor.subjectsTaught.map((subject, index) => (
                      <span key={index} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {mentor.mentorApprovalStatus === 'rejected' && mentor.mentorRejectionReason && (
                <div className="detail-section">
                  <h3 className="section-title">
                    <i className="fas fa-times-circle"></i>
                    Rejection Reason
                  </h3>
                  <div className="rejection-container">
                    <p className="rejection-text">{mentor.mentorRejectionReason}</p>
                    <small className="rejection-date">
                      Rejected on: {mentor.mentorApprovalDate ? formatDate(mentor.mentorApprovalDate) : 'Unknown date'}
                    </small>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-address-book"></i>
                  Contact Information
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{mentor.email}</span>
                  </div>
                  {mentor.phone && (
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{mentor.phone}</span>
                    </div>
                  )}
                  {mentor.telegramId && (
                    <div className="detail-item">
                      <label>Telegram</label>
                      <span>@{mentor.telegramId}</span>
                    </div>
                  )}
                  {mentor.whatsapp && (
                    <div className="detail-item">
                      <label>WhatsApp</label>
                      <span>{mentor.whatsapp}</span>
                    </div>
                  )}
                  {mentor.address && (
                    <div className="detail-item">
                      <label>Address</label>
                      <span>{mentor.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <div className="detail-section">
                  <h3 className="section-title">
                    <i className="fas fa-user-edit"></i>
                    Bio
                  </h3>
                  <div className="bio-container">
                    <p className="bio-text">{mentor.bio}</p>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {mentor.achievements && mentor.achievements.length > 0 && (
                <div className="detail-section">
                  <h3 className="section-title">
                    <i className="fas fa-trophy"></i>
                    Achievements
                  </h3>
                  <div className="achievements-container">
                    <ul className="achievements-list">
                      {mentor.achievements.map((achievement, index) => (
                        <li key={index} className="achievement-item">
                          <i className="fas fa-medal"></i>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-info-circle"></i>
                  Account Information
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Member Since</label>
                    <span>{formatDate(mentor.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Seen</label>
                    <span>{mentor.lastSeen ? formatDate(mentor.lastSeen) : 'Never'}</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile; 