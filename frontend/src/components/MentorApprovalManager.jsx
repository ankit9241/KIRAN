import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/mentor-approval-manager.css';

const MentorApprovalManager = () => {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [pendingResponse, allResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/users/mentors/pending', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/mentors/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPendingMentors(pendingResponse.data);
      setAllMentors(allResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors');
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/mentors/${mentorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the mentors list
      await fetchMentors();
      alert('Mentor approved successfully!');
    } catch (error) {
      console.error('Error approving mentor:', error);
      alert('Error approving mentor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (mentorId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/mentors/${mentorId}/reject`, {
        rejectionReason: rejectionReason.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the mentors list
      await fetchMentors();
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedMentor(null);
      alert('Mentor rejected successfully!');
    } catch (error) {
      console.error('Error rejecting mentor:', error);
      alert('Error rejecting mentor: ' + (error.response?.data?.message || error.message));
    }
  };

  const openRejectModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedMentor(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'approved':
        return <span className="status-badge approved">Approved</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mentor-approval-manager">
        <div className="loading">Loading mentor requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentor-approval-manager">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="mentor-approval-manager">
      <div className="manager-header">
        <h2>Mentor Approval Management</h2>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingMentors.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Mentors ({allMentors.length})
          </button>
        </div>
      </div>

      <div className="mentors-list">
        {activeTab === 'pending' ? (
          pendingMentors.length === 0 ? (
            <div className="no-mentors">
              <p>No pending mentor requests</p>
            </div>
          ) : (
            pendingMentors.map((mentor) => (
              <div key={mentor._id} className="mentor-card pending">
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <p className="email">{mentor.email}</p>
                  <p className="specialization">Specialization: {mentor.specialization}</p>
                  <p className="experience">Experience: {mentor.experience}</p>
                  <p className="qualifications">Qualifications: {mentor.qualifications}</p>
                  <p className="registration-date">
                    Registered: {formatDate(mentor.createdAt)}
                  </p>
                  
                  {/* Contact Information */}
                  <div className="contact-info">
                    <h4>Contact Information</h4>
                    <div className="contact-details">
                      {mentor.phone && (
                        <p className="contact-item">
                          <i className="fas fa-phone"></i>
                          <span>{mentor.phone}</span>
                        </p>
                      )}
                      {mentor.telegramId && (
                        <p className="contact-item">
                          <i className="fab fa-telegram"></i>
                          <span>@{mentor.telegramId}</span>
                        </p>
                      )}
                      {mentor.whatsapp && (
                        <p className="contact-item">
                          <i className="fab fa-whatsapp"></i>
                          <span>{mentor.whatsapp}</span>
                        </p>
                      )}
                      {mentor.address && (
                        <p className="contact-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{mentor.address}</span>
                        </p>
                      )}
                      {mentor.linkedin && (
                        <p className="contact-item">
                          <i className="fab fa-linkedin"></i>
                          <span>LinkedIn Profile</span>
                        </p>
                      )}
                      {mentor.website && (
                        <p className="contact-item">
                          <i className="fas fa-globe"></i>
                          <span>Website</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  {mentor.bio && (
                    <div className="additional-info">
                      <h4>Bio</h4>
                      <p className="bio-text">{mentor.bio}</p>
                    </div>
                  )}
                  
                  {mentor.achievements && mentor.achievements.length > 0 && (
                    <div className="additional-info">
                      <h4>Achievements</h4>
                      <ul className="achievements-list">
                        {mentor.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mentor-actions">
                  <button 
                    className="approve-button"
                    onClick={() => handleApprove(mentor._id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => openRejectModal(mentor)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          allMentors.map((mentor) => (
            <div key={mentor._id} className={`mentor-card ${mentor.mentorApprovalStatus}`}>
              <div className="mentor-info">
                <div className="mentor-header">
                  <h3>{mentor.name}</h3>
                  {getStatusBadge(mentor.mentorApprovalStatus)}
                </div>
                <p className="email">{mentor.email}</p>
                <p className="specialization">Specialization: {mentor.specialization}</p>
                <p className="experience">Experience: {mentor.experience}</p>
                <p className="qualifications">Qualifications: {mentor.qualifications}</p>
                <p className="registration-date">
                  Registered: {formatDate(mentor.createdAt)}
                </p>
                {mentor.mentorApprovalDate && (
                  <p className="approval-date">
                    {mentor.mentorApprovalStatus === 'approved' ? 'Approved' : 'Rejected'}: {formatDate(mentor.mentorApprovalDate)}
                  </p>
                )}
                {mentor.mentorRejectionReason && (
                  <p className="rejection-reason">
                    Rejection Reason: {mentor.mentorRejectionReason}
                  </p>
                )}
                
                {/* Contact Information */}
                <div className="contact-info">
                  <h4>Contact Information</h4>
                  <div className="contact-details">
                    {mentor.phone && (
                      <p className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{mentor.phone}</span>
                      </p>
                    )}
                    {mentor.telegramId && (
                      <p className="contact-item">
                        <i className="fab fa-telegram"></i>
                        <span>@{mentor.telegramId}</span>
                      </p>
                    )}
                    {mentor.whatsapp && (
                      <p className="contact-item">
                        <i className="fab fa-whatsapp"></i>
                        <span>{mentor.whatsapp}</span>
                      </p>
                    )}
                    {mentor.address && (
                      <p className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{mentor.address}</span>
                      </p>
                    )}
                    {mentor.linkedin && (
                      <p className="contact-item">
                        <i className="fab fa-linkedin"></i>
                        <span>LinkedIn Profile</span>
                      </p>
                    )}
                    {mentor.website && (
                      <p className="contact-item">
                        <i className="fas fa-globe"></i>
                        <span>Website</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Additional Information */}
                {mentor.bio && (
                  <div className="additional-info">
                    <h4>Bio</h4>
                    <p className="bio-text">{mentor.bio}</p>
                  </div>
                )}
                
                {mentor.achievements && mentor.achievements.length > 0 && (
                  <div className="additional-info">
                    <h4>Achievements</h4>
                    <ul className="achievements-list">
                      {mentor.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {mentor.mentorApprovalStatus === 'pending' && (
                <div className="mentor-actions">
                  <button 
                    className="approve-button"
                    onClick={() => handleApprove(mentor._id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => openRejectModal(mentor)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="reject-modal">
            <h3>Reject Mentor Request</h3>
            <p>Are you sure you want to reject <strong>{selectedMentor?.name}</strong>?</p>
            <div className="form-group">
              <label htmlFor="rejectionReason">Rejection Reason (Required):</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows="4"
                required
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={closeRejectModal}
              >
                Cancel
              </button>
              <button 
                className="confirm-reject-button"
                onClick={() => handleReject(selectedMentor._id)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorApprovalManager; 