import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/my-mentor-profile.css';
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';
import { FaCamera } from 'react-icons/fa';

const MyMentorProfile = () => {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

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
      const response = await axios.get('http://localhost:5000/api/users/me', {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchMentor = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMentor(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchMentor();
  }, [navigate]);

  if (loading) return <div className="my-mentor-profile-loading">Loading...</div>;
  if (error || !mentor) return <div className="my-mentor-profile-error">{error || 'Profile not found'}</div>;

  return (
    <div className={`my-mentor-profile-container${mentor.isPremium ? ' premium' : ''}`}>
      <div className="profile-header">
        <div className="avatar" style={{position: 'relative', overflow: 'visible'}}>
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
        <div className="profile-header-main">
          <div className="profile-info-row">
            <div className="profile-info">
              <h1>{mentor.name}</h1>
              <div className="profile-info-credentials">
                <span className="role-badge">Mentor{mentor.isPremium && <span className="premium-badge">Premium</span>}</span>
                {mentor.mentorApprovalStatus === 'approved' && (
                  <span className="approved-badge"><i className="fas fa-check-circle"></i> Approved</span>
                )}
                <span className="email">{mentor.email}</span>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => setIsEditOpen(true)}>
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          </div>
        </div>
      </div>
      <div className="profile-details">
        <div className="detail-item"><strong>Phone:</strong> {mentor.phone || 'N/A'}</div>
        <div className="detail-item"><strong>Specialization:</strong> {mentor.specialization || 'N/A'}</div>
        <div className="detail-item"><strong>Experience:</strong> {mentor.experience || 'N/A'}</div>
        <div className="detail-item"><strong>Qualifications:</strong> {mentor.qualifications || 'N/A'}</div>
        <div className="detail-item"><strong>Teaching Style:</strong> {mentor.teachingStyle || 'N/A'}</div>
        <div className="detail-item"><strong>Subjects Taught:</strong> {(mentor.subjectsTaught || []).join(', ') || 'N/A'}</div>
        <div className="detail-item"><strong>Bio:</strong> {mentor.bio || 'N/A'}</div>
        <div className="detail-item"><strong>Achievements:</strong> {(mentor.achievements || []).join(', ') || 'N/A'}</div>
      </div>
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={mentor}
        userType="mentor"
        onSaveSuccess={updated => { setIsEditOpen(false); setMentor(updated); }}
      />
    </div>
  );
};

export default MyMentorProfile; 