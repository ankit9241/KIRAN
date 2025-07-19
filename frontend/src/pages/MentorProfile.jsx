import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import '../styles/mentor-profile.css';
import { FaCamera } from 'react-icons/fa';
import * as jwt_decode from "jwt-decode";

const SectionHeading = ({ iconClass, children }) => (
  <div className="section-title">
    <i className={iconClass}></i>
    <span>{children}</span>
  </div>
);

const renderApprovalBadge = (status) => {
  if (!status) return null;
  let icon, color, label;
  switch (status) {
    case 'approved':
      icon = <i className="fas fa-check-circle"></i>;
      color = '#10B981';
      label = 'Approved';
      break;
    case 'pending':
      icon = <i className="fas fa-clock"></i>;
      color = '#f59e0b';
      label = 'Pending';
      break;
    case 'rejected':
      icon = <i className="fas fa-times-circle"></i>;
      color = '#ef4444';
      label = 'Rejected';
      break;
    default:
      icon = null;
      color = '#64748b';
      label = status.charAt(0).toUpperCase() + status.slice(1);
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4em',
      background: color + '22',
      color,
      fontWeight: 700,
      borderRadius: '1.2em',
      padding: '0.25em 0.9em',
      fontSize: '1em',
      marginLeft: '0.5em',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {icon} {label}
    </span>
  );
};

const MentorProfile = () => {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(API_ENDPOINTS.USER_PROFILE(mentorId), {
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

  useEffect(() => {
    // Get current user id from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode.default(token);
        setCurrentUserId(decoded.id);
      } catch (e) {
        setCurrentUserId(null);
      }
    }
  }, []);

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
      // Refresh mentor profile
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE(mentorId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMentor(response.data);
    } catch (err) {
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

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
          <div className="profile-header relative">
            <button
              onClick={() => navigate(-1)}
              className="back-btn absolute top-4 left-4 z-10"
              style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <div className="header-content">
              {/* Remove the header-left div containing the back button */}
              <div className="header-center">
                <h1 className="header-title">Mentor Profile</h1>
                <p className="header-subtitle">View detailed information about this mentor</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            {/* Avatar and Basic Info */}
            <div className="profile-basic-info">
              <div className="profile-avatar">
                <div className="avatar-icon" style={{position: 'relative', overflow: 'visible'}}>
                  {mentor.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${mentor.profilePicture.replace(/\\/g, '/')}`}
                      alt="Profile"
                      className="profile-img"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-chalkboard-teacher"></i>
                  )}
                  {/* Overlay camera icon for upload */}
                  {currentUserId === mentorId && (
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
                  )}
                  {uploading && currentUserId === mentorId && <div className="uploading-overlay">Uploading...</div>}
                </div>
              </div>
              
              <div className="profile-info">
                <h2 className="user-name">{mentor.name}</h2>
                <p className="user-email">{mentor.email}</p>
                <div className="badges-container">
                  
                  {renderApprovalBadge(mentor.mentorApprovalStatus)}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="profile-details">
              {/* Professional Information */}
              <div className="detail-section">
                <SectionHeading iconClass="fas fa-briefcase">Professional Information</SectionHeading>
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

              {/* Contact Information */}
              <div className="detail-section">
                <SectionHeading iconClass="fas fa-address-book">Contact Information</SectionHeading>
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
                  {mentor.linkedin && (
                    <div className="detail-item">
                      <label>LinkedIn</label>
                      <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer">{mentor.linkedin}</a>
                    </div>
                  )}
                  {mentor.website && (
                    <div className="detail-item">
                      <label>Website</label>
                      <a href={mentor.website} target="_blank" rel="noopener noreferrer">{mentor.website}</a>
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

              {/* Subjects Taught */}
              {mentor.subjectsTaught && mentor.subjectsTaught.length > 0 && (
                <div className="detail-section">
                  <SectionHeading iconClass="fas fa-chalkboard">Subjects Taught</SectionHeading>
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
                  <SectionHeading iconClass="fas fa-times-circle">Rejection Reason</SectionHeading>
                  <div className="rejection-container">
                    <p className="rejection-text">{mentor.mentorRejectionReason}</p>
                    <small className="rejection-date">
                      Rejected on: {mentor.mentorApprovalDate ? formatDate(mentor.mentorApprovalDate) : 'Unknown date'}
                    </small>
                  </div>
                </div>
              )}

              {/* Bio */}
              {mentor.bio && (
                <div className="detail-section">
                  <SectionHeading iconClass="fas fa-user-edit">Bio</SectionHeading>
                  <div className="bio-container">
                    <p className="bio-text">{mentor.bio}</p>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {mentor.achievements && mentor.achievements.length > 0 && (
                <div className="detail-section">
                  <SectionHeading iconClass="fas fa-trophy">Achievements</SectionHeading>
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
                <SectionHeading iconClass="fas fa-info-circle">Account Information</SectionHeading>
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