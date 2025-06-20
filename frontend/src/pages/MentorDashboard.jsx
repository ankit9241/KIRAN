import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import '../styles/mentor-dashboard.css';
import '../styles/student-profile.css';
import StudentDetailsModal from '../components/StudentDetailsModal';
import MeetingManager from '../components/MeetingManager';
import Announcements from '../components/Announcements';
import StudentMeetings from '../components/StudentMeetings';

const MentorDashboard = () => {
  const [mentorInfo, setMentorInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [pendingDoubts, setPendingDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoubtForResponse, setSelectedDoubtForResponse] = useState(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseFiles, setResponseFiles] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [showApprovalMessage, setShowApprovalMessage] = useState(true);
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState(null);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const [meetingsRes, studentsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.MEETINGS, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(API_ENDPOINTS.USERS, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setMeetings(meetingsRes.data);
        setStudents(studentsRes.data.filter(user => user.role === 'student'));

        const [mentorResponse, approvalResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.USERS}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_ENDPOINTS.USERS}/mentor/approval-status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setMentorInfo(mentorResponse.data);
        setApprovalStatus(approvalResponse.data);

        // Check if approval message should be shown
        const dismissedStatus = localStorage.getItem('mentorApprovalMessageDismissed');
        const currentStatus = approvalResponse.data.mentorApprovalStatus;
        
        if (dismissedStatus === currentStatus) {
          setShowApprovalMessage(false);
        } else {
          setShowApprovalMessage(true);
        }

        // Fetch doubts only if approved
        if (approvalResponse.data.mentorApprovalStatus === 'approved') {
          const [assignedDoubtsResponse, pendingDoubtsResponse] = await Promise.all([
            axios.get(`${API_ENDPOINTS.DOUBTS}/mentor`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_ENDPOINTS.DOUBTS}/pending`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          setDoubts(assignedDoubtsResponse.data);
          setPendingDoubts(pendingDoubtsResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching mentor data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [selectedDoubtType, setSelectedDoubtType] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  const handleViewDetails = (studentId) => {
    navigate(`/student-profile/${studentId}`);
  };

  const handleFeedback = async () => {
    if (!selectedStudent || !feedback.trim()) {
      alert('Please select a student and provide feedback');
      return;
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.FEEDBACK}`, {
        studentId: selectedStudent,
        text: feedback,
        rating: feedbackRating
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Feedback submitted successfully!');
      setFeedback('');
      setSelectedStudent('');
      setFeedbackRating(5);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleResourceUpload = async () => {
    if (!selectedStudent || !resourceFile || !resourceTitle) {
      alert('Please select a student, provide a title, and choose a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', resourceFile);
    formData.append('studentId', selectedStudent);
    formData.append('title', resourceTitle);
    formData.append('description', resourceDescription);

    try {
      // Use the correct endpoint for personal resource upload
      const response = await axios.post(`${API_ENDPOINTS.STUDY_MATERIAL}/upload-student`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Personal resource uploaded successfully!');
      setResourceFile(null);
      setResourceTitle('');
      setResourceDescription('');
      setSelectedStudent('');
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Failed to upload resource. Please try again.');
    }
  };

  const handleViewDetailsModal = (student) => {
    setSelectedStudentForModal(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudentForModal(null);
  };

  const openResponseModal = (doubt) => {
    setSelectedDoubtForResponse(doubt);
    setIsResponseModalOpen(true);
  };

  const closeResponseModal = () => {
    setIsResponseModalOpen(false);
    setSelectedDoubtForResponse(null);
    setResponseText('');
    setResponseFiles([]);
  };

  const handleFileChange = (e) => {
    setResponseFiles(Array.from(e.target.files));
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      alert('Please provide a response to the doubt');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('response', responseText);
      
      // Add files if any
      responseFiles.forEach(file => {
        formData.append('documents', file);
      });

      const response = await axios.patch(
        `${API_ENDPOINTS.DOUBTS}/${selectedDoubtForResponse._id}/respond`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update the doubts list
      setDoubts(prev => prev.map(d => d._id === selectedDoubtForResponse._id ? response.data : d));
      
      alert('Response submitted successfully!');
      closeResponseModal();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    }
  };

  const handlePickUpDoubt = async (doubtId) => {
    try {
      console.log('Attempting to pick up doubt:', doubtId);
      console.log('API URL:', `${API_ENDPOINTS.DOUBTS}/${doubtId}/assign`);
      
      const response = await axios.patch(`${API_ENDPOINTS.DOUBTS}/${doubtId}/assign`);
      
      console.log('Pick up doubt response:', response.data);
      
      // Update the doubts lists
      setDoubts(prev => [...prev, response.data]);
      setPendingDoubts(prev => prev.filter(d => d._id !== doubtId));
      
      alert('Doubt picked up successfully!');
    } catch (error) {
      console.error('Error picking up doubt:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to pick up doubt. Please try again.');
    }
  };

  const handleResolveDoubt = async (doubtId) => {
    try {
      const response = await axios.patch(`${API_ENDPOINTS.DOUBTS}/${doubtId}/resolve`);
      
      // Update the doubts list
      setDoubts(prev => prev.map(d => d._id === doubtId ? response.data : d));
      
      alert('Doubt resolved successfully!');
    } catch (error) {
      console.error('Error resolving doubt:', error);
      alert('Failed to resolve doubt. Please try again.');
    }
  };

  const dismissApprovalMessage = () => {
    setShowApprovalMessage(false);
    localStorage.setItem('mentorApprovalMessageDismissed', approvalStatus.mentorApprovalStatus);
  };

  const openEditProfile = () => {
    setEditProfileData({ ...(mentorInfo || {}) });
    setIsEditProfileOpen(true);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
    setEditProfileError(null);
  };

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfileArrayChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
  };

  // Helper to ensure required mentor fields are always present
  const getCompleteEditProfileData = (data) => {
    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      telegramId: data.telegramId || '',
      whatsapp: data.whatsapp || '',
      linkedin: data.linkedin || '',
      website: data.website || '',
      specialization: data.specialization || '',
      experience: data.experience || '',
      subjectsTaught: Array.isArray(data.subjectsTaught)
        ? data.subjectsTaught.filter(s => s)
        : (data.subjectsTaught ? data.subjectsTaught.split(',').map(s => s.trim()).filter(s => s) : []),
      teachingStyle: data.teachingStyle || '',
      qualifications: data.qualifications || '',
      bio: data.bio || '',
      achievements: Array.isArray(data.achievements)
        ? data.achievements.filter(a => a)
        : (data.achievements ? data.achievements.split(',').map(a => a.trim()).filter(a => a) : []),
      profilePicture: data.profilePicture || '',
    };
  };

  const handleEditProfileSave = async (e) => {
    e.preventDefault();
    setEditProfileLoading(true);
    setEditProfileError(null);
    // Validate required mentor fields
    const dataToSend = getCompleteEditProfileData(editProfileData);
    if (!dataToSend.specialization || !dataToSend.experience || !dataToSend.teachingStyle || !dataToSend.qualifications || dataToSend.subjectsTaught.length === 0) {
      setEditProfileError('All mentor fields (Specialization, Experience, Subjects Taught, Teaching Style, Qualifications) are required.');
      setEditProfileLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${API_ENDPOINTS.USERS}/me`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMentorInfo(res.data);
      setIsEditProfileOpen(false);
    } catch (err) {
      setEditProfileError('Failed to update profile. Please try again.');
    } finally {
      setEditProfileLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!mentorInfo) return <div className="error">Failed to load profile</div>;

  return (
    <div className="mentor-dashboard">
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal-overlay" onClick={closeEditProfile}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={closeEditProfile}>×</button>
            </div>
            <form className="edit-profile-form" onSubmit={handleEditProfileSave}>
              <div className="form-group"><label>Name</label><input name="name" value={editProfileData?.name || ''} onChange={handleEditProfileChange} required /></div>
              <div className="form-group"><label>Email</label><input name="email" value={editProfileData?.email || ''} onChange={handleEditProfileChange} required disabled /></div>
              <div className="form-group"><label>Phone</label><input name="phone" value={editProfileData?.phone || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>Address</label><input name="address" value={editProfileData?.address || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>Telegram ID</label><input name="telegramId" value={editProfileData?.telegramId || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>WhatsApp</label><input name="whatsapp" value={editProfileData?.whatsapp || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>LinkedIn</label><input name="linkedin" value={editProfileData?.linkedin || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>Website</label><input name="website" value={editProfileData?.website || ''} onChange={handleEditProfileChange} /></div>
              <div className="form-group"><label>Specialization</label><input name="specialization" value={editProfileData?.specialization || ''} onChange={handleEditProfileChange} required /></div>
              <div className="form-group"><label>Experience</label><input name="experience" value={editProfileData?.experience || ''} onChange={handleEditProfileChange} required /></div>
              <div className="form-group"><label>Subjects Taught (comma separated)</label><input name="subjectsTaught" value={editProfileData?.subjectsTaught?.join(', ') || ''} onChange={handleEditProfileArrayChange} required /></div>
              <div className="form-group"><label>Teaching Style</label><input name="teachingStyle" value={editProfileData?.teachingStyle || ''} onChange={handleEditProfileChange} required /></div>
              <div className="form-group"><label>Qualifications</label><input name="qualifications" value={editProfileData?.qualifications || ''} onChange={handleEditProfileChange} required /></div>
              <div className="form-group"><label>Bio</label><textarea name="bio" value={editProfileData?.bio || ''} onChange={handleEditProfileChange} rows={2} /></div>
              <div className="form-group"><label>Achievements (comma separated)</label><input name="achievements" value={editProfileData?.achievements?.join(', ') || ''} onChange={handleEditProfileArrayChange} /></div>
              {/* Profile picture upload can be added here if needed */}
              {editProfileError && <div className="error-message">{editProfileError}</div>}
              <button className="btn-primary" type="submit" disabled={editProfileLoading}>{editProfileLoading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}
      <Announcements />
      <div className="dashboard-header">
        <h1>Mentor Dashboard</h1>
        <p>Welcome, {mentorInfo.name}</p>
        <button className="btn-primary" style={{float:'right',marginTop:-40}} onClick={openEditProfile}>Edit Profile</button>
      </div>

      {/* Approval Status Display - Only show if not dismissed */}
      {approvalStatus && showApprovalMessage && (
        <div className={`approval-status ${approvalStatus.mentorApprovalStatus}`}>
          {approvalStatus.mentorApprovalStatus === 'pending' && (
            <div className="status-message pending">
              <i className="fas fa-clock"></i>
              <div>
                <h3>Account Pending Approval</h3>
                <p>Your mentor account is currently under review by our admin team. You'll be able to access all features once approved.</p>
                <small>Registration Date: {new Date(mentorInfo.createdAt).toLocaleDateString()}</small>
              </div>
              <button className="dismiss-btn" onClick={dismissApprovalMessage} title="Dismiss message">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {approvalStatus.mentorApprovalStatus === 'rejected' && (
            <div className="status-message rejected">
              <i className="fas fa-times-circle"></i>
              <div>
                <h3>Account Rejected</h3>
                <p>Your mentor application has been rejected.</p>
                {approvalStatus.mentorRejectionReason && (
                  <p><strong>Reason:</strong> {approvalStatus.mentorRejectionReason}</p>
                )}
                <small>Rejection Date: {approvalStatus.mentorApprovalDate ? new Date(approvalStatus.mentorApprovalDate).toLocaleDateString() : 'N/A'}</small>
              </div>
              <button className="dismiss-btn" onClick={dismissApprovalMessage} title="Dismiss message">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {approvalStatus.mentorApprovalStatus === 'approved' && (
            <div className="status-message approved">
              <i className="fas fa-check-circle"></i>
              <div>
                <h3>Account Approved</h3>
                <p>Your mentor account has been approved! You now have access to all mentor features.</p>
                <small>Approval Date: {approvalStatus.mentorApprovalDate ? new Date(approvalStatus.mentorApprovalDate).toLocaleDateString() : 'N/A'}</small>
              </div>
              <button className="dismiss-btn" onClick={dismissApprovalMessage} title="Dismiss message">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Only show dashboard content if approved */}
      {approvalStatus && approvalStatus.mentorApprovalStatus === 'approved' ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="stat-number">{students.length}</div>
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
                    <th>Class</th>
                    <th>Stream</th>
                    <th>Target Exam</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.stream}</td>
                      <td>{student.targetExam}</td>
                      <td>
                        <button 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(student._id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Details Modal */}
          {isModalOpen && selectedStudentForModal && (
            <StudentDetailsModal
              student={selectedStudentForModal}
              isOpen={isModalOpen}
              onClose={closeModal}
            />
          )}

          {/* Doubt Response Modal */}
          {isResponseModalOpen && selectedDoubtForResponse && (
            <div className="modal-overlay">
              <div className="modal-content response-modal">
                <div className="modal-header">
                  <h3>Respond to Doubt</h3>
                  <button className="close-btn" onClick={closeResponseModal}>×</button>
                </div>
                
                <div className="modal-body">
                  <div className="doubt-summary">
                    <h4>Student's Question:</h4>
                    <p><strong>{selectedDoubtForResponse.title}</strong></p>
                    <p>{selectedDoubtForResponse.description}</p>
                    <p><small>Subject: {selectedDoubtForResponse.subject}</small></p>
                  </div>
                  
                  <div className="response-form">
                    <div className="form-group">
                      <label htmlFor="response-text">Your Response:</label>
                      <textarea
                        id="response-text"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Provide a detailed response to the student's doubt..."
                        rows="6"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="response-files">Upload Documents (Optional):</label>
                      <input
                        type="file"
                        id="response-files"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                      <small>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</small>
                    </div>
                    
                    {responseFiles.length > 0 && (
                      <div className="selected-files">
                        <h5>Selected Files:</h5>
                        <ul>
                          {responseFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={closeResponseModal}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSubmitResponse}>
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Doubt Section */}
          <div className="doubts-section">
            <div className="doubts-header">
              <h2>Doubt Section</h2>
            </div>
            
            {/* Available Doubts Sub-section */}
            <div className="doubt-subsection available-doubts">
              <div className="subsection-header">
                <h3>Available Doubts</h3>
                <span className="subsection-badge">{pendingDoubts.length} available</span>
              </div>
              <div className="doubts-list">
                {pendingDoubts.length === 0 ? (
                  <p className="no-doubts">No pending doubts available</p>
                ) : (
                  pendingDoubts.map(doubt => {
                    return (
                      <div key={doubt._id} className="doubt-item pending">
                        <div className="doubt-content">
                          <h4>{doubt.title}</h4>
                          <p><strong>Student:</strong> {doubt.student.name}</p>
                          <p><strong>Subject:</strong> {doubt.subject}</p>
                          <p><strong>Question:</strong> {doubt.description}</p>
                          <p><strong>Posted:</strong> {new Date(doubt.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="doubt-actions">
                          <button 
                            className="pickup-btn"
                            style={{
                              pointerEvents: 'auto',
                              cursor: 'pointer',
                              zIndex: 1000,
                              position: 'relative'
                            }}
                            onClick={() => {
                              alert('Pickup button clicked!');
                              handlePickUpDoubt(doubt._id);
                            }}
                          >
                            Pick Up Doubt
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Assigned Doubts Sub-section */}
            <div className="doubt-subsection assigned-doubts">
              <div className="subsection-header">
                <h3>My Assigned Doubts</h3>
                <span className="subsection-badge">{doubts.length} assigned</span>
              </div>
              <div className="doubts-list">
                {doubts.length === 0 ? (
                  <p className="no-doubts">No assigned doubts</p>
                ) : (
                  doubts.map(doubt => (
                    <div key={doubt._id} className="doubt-item assigned">
                      <div className="doubt-content">
                        <h4>{doubt.title}</h4>
                        <p><strong>Student:</strong> {doubt.student.name}</p>
                        <p><strong>Subject:</strong> {doubt.subject}</p>
                        <p><strong>Question:</strong> {doubt.description}</p>
                        <p><strong>Status:</strong> {doubt.status}</p>
                        <p><strong>Assigned:</strong> {new Date(doubt.createdAt).toLocaleDateString()}</p>
                        
                        {/* Show mentor response if available */}
                        {doubt.mentorResponse && (
                          <div className="mentor-response">
                            <h5>Your Response:</h5>
                            <p>{doubt.mentorResponse}</p>
                            <p><small>Responded on: {new Date(doubt.responseDate).toLocaleDateString()}</small></p>
                            
                            {/* Show uploaded documents if any */}
                            {doubt.uploadedDocuments && doubt.uploadedDocuments.length > 0 && (
                              <div className="uploaded-documents">
                                <h6>Uploaded Documents:</h6>
                                <ul>
                                  {doubt.uploadedDocuments.map((doc, index) => (
                                    <li key={index}>
                                      <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                        {doc.originalName}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="doubt-actions">
                        {doubt.status === 'assigned' && (
                          <button 
                            className="respond-btn"
                            onClick={() => openResponseModal(doubt)}
                          >
                            Respond to Doubt
                          </button>
                        )}
                        {doubt.status === 'responded' && (
                          <button 
                            className="resolve-btn"
                            onClick={() => handleResolveDoubt(doubt._id)}
                          >
                            Mark as Resolved
                          </button>
                        )}
                        {doubt.status === 'resolved' && (
                          <span className="resolved-badge">Resolved</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mentor Meeting Details Section (read-only) */}
          <div className="mentor-meetings-section">
            <h2>My Meetings</h2>
            <StudentMeetings role="mentor" />
          </div>

          {/* Resource Upload Section */}
          <div className="resources-section">
            <div className="section-header">
              <h2>Upload Study Materials</h2>
              <p>Share resources and materials with your students</p>
            </div>
            <div className="resource-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="resource-student">Select Student:</label>
                  <select 
                    id="resource-student"
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} - {student.class}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="resource-title">Resource Title:</label>
                  <input
                    id="resource-title"
                    type="text"
                    placeholder="Enter resource title..."
                    value={resourceTitle || ''}
                    onChange={(e) => setResourceTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="resource-description">Description:</label>
                <textarea
                  id="resource-description"
                  placeholder="Describe the resource..."
                  value={resourceDescription || ''}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="resource-file">Upload File:</label>
                <input
                  id="resource-file"
                  type="file"
                  onChange={(e) => setResourceFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
                />
                <small>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, MP4, MP3</small>
              </div>
              {resourceFile && (
                <div className="selected-file">
                  <p><strong>Selected:</strong> {resourceFile.name}</p>
                </div>
              )}
              
              <button 
                className="upload-btn"
                onClick={handleResourceUpload}
                disabled={!selectedStudent || !resourceFile || !resourceTitle}
              >
                Upload Resource
              </button>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="feedback-section">
            <div className="section-header">
              <h2>Student Feedback</h2>
              <p>Provide constructive feedback to help students improve</p>
            </div>
            <div className="feedback-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="feedback-student">Select Student:</label>
                  <select 
                    id="feedback-student"
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} - {student.class}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="feedback-rating">Rating:</label>
                  <select 
                    id="feedback-rating"
                    value={feedbackRating || 5} 
                    onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                  >
                    <option value="5">Excellent (5)</option>
                    <option value="4">Good (4)</option>
                    <option value="3">Average (3)</option>
                    <option value="2">Below Average (2)</option>
                    <option value="1">Poor (1)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="feedback-text">Feedback:</label>
                <textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write detailed feedback about the student's performance, strengths, areas for improvement..."
                  rows="5"
                />
              </div>
              <button 
                className="feedback-btn"
                onClick={handleFeedback}
                disabled={!selectedStudent || !feedback.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="approval-pending-message">
          <p>Your mentor account is pending approval. You'll be able to access all features once an admin approves your account.</p>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
