import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorApprovalManager from '../components/MentorApprovalManager';
import MeetingManager from '../components/MeetingManager';
import '../styles/admin-dashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    selectedStudent: '',
    selectedMentor: '',
    selectedResource: '',
    selectedDoubtType: 'All',
    announcement: '',
    students: [],
    mentors: [],
    doubts: [],
    resources: [],
    meetings: [],
    announcements: []
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchAllData();
  }, [navigate]);

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Configure axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch all data in parallel
      const [
        studentsResponse,
        mentorsResponse,
        doubtsResponse,
        meetingsResponse,
        resourcesResponse,
        announcementsResponse
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/students`),
        axios.get(`${API_BASE_URL}/users/mentors`),
        axios.get(`${API_BASE_URL}/doubts/all`),
        axios.get(`${API_BASE_URL}/meetings/all`),
        axios.get(`${API_BASE_URL}/study-material/all`),
        axios.get(`${API_BASE_URL}/announcements/all`)
      ]);

      setData(prev => ({
        ...prev,
        students: studentsResponse.data,
        mentors: mentorsResponse.data,
        doubts: doubtsResponse.data,
        meetings: meetingsResponse.data,
        resources: resourcesResponse.data,
        announcements: announcementsResponse.data
      }));

      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      setLoading(false);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Helper functions to update specific parts of data
  const updateData = (updates) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Real handlers with API calls
  const handleStudentAction = async (action, studentId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (action === 'edit') {
        // Navigate to edit page or open modal
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this student?')) {
          await axios.delete(`${API_BASE_URL}/users/${studentId}`, { headers });
          await fetchAllData(); // Refresh data
        }
      } else if (action === 'assign') {
        // Open mentor assignment modal
      }
    } catch (error) {
      setError('Failed to perform student action');
    }
  };

  const handleMentorAction = async (action, mentorId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (action === 'edit') {
        // Navigate to edit page or open modal
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this mentor?')) {
          await axios.delete(`${API_BASE_URL}/users/${mentorId}`, { headers });
          await fetchAllData(); // Refresh data
        }
      }
    } catch (error) {
      setError('Failed to perform mentor action');
    }
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', data.selectedResource);

        await axios.post(`${API_BASE_URL}/study-material/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        await fetchAllData(); // Refresh data
        alert('Resource uploaded successfully!');
      } catch (error) {
        setError('Failed to upload resource');
      }
    }
  };

  const handleDoubtStatus = async (doubtId, status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API_BASE_URL}/doubts/${doubtId}/status`, { status }, { headers });
      await fetchAllData(); // Refresh data
    } catch (error) {
      setError('Failed to update doubt status');
    }
  };

  const handleAnnouncement = async () => {
    if (!data.announcement.trim()) {
      alert('Please enter an announcement');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/announcements`, {
        message: data.announcement
      });

      setData(prev => ({ ...prev, announcement: '' }));
      alert('Announcement sent successfully!');
      
      // Refresh announcements list
      fetchAllData();
    } catch (error) {
      setError('Failed to send announcement');
    }
  };

  const handleToggleAnnouncement = async (announcementId) => {
    try {
      await axios.patch(`${API_BASE_URL}/announcements/${announcementId}/toggle`);
      alert('Announcement status updated successfully!');
      fetchAllData();
    } catch (error) {
      alert('Failed to update announcement status');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/announcements/${announcementId}`);
      alert('Announcement deleted successfully!');
      fetchAllData();
    } catch (error) {
      alert('Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <h2>Dashboard Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={fetchAllData} className="btn-primary">Retry</button>
            <button onClick={() => window.location.reload()} className="btn-secondary">Refresh Page</button>
          </div>
          <div className="error-details">
            <p>If the problem persists, please check:</p>
            <ul>
              <li>Backend server is running on port 5000</li>
              <li>You are logged in as an admin user</li>
              <li>Your internet connection is stable</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Premium Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Manage your educational platform with powerful insights and controls.</p>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="summary-number">{data.students.length}</div>
            <div className="summary-label">Total Students</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="summary-number">{data.mentors.length}</div>
            <div className="summary-label">Total Mentors</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div className="summary-number">{data.doubts.length}</div>
            <div className="summary-label">Total Doubts</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="summary-number">{data.resources.length}</div>
            <div className="summary-label">Total Resources</div>
          </div>
        </div>

        {/* Students Management */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Students Management</h3>
              <p>Manage student profiles and monitor their progress</p>
            </div>
          </div>
          <div className="admin-card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Stream</th>
                    <th>Target Exam</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                        No students found
                      </td>
                    </tr>
                  ) : (
                    data.students.map(student => (
                      <tr key={student._id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.class || 'N/A'}</td>
                        <td>{student.stream || 'N/A'}</td>
                        <td>{student.targetExam || 'N/A'}</td>
                        <td>
                          <div className="action-group">
                            <Link to={`/student-profile/${student._id}`} className="action-btn view-profile-btn">
                              <i className="fas fa-user"></i>
                              View Profile
                            </Link>
                            <button 
                              className="action-btn three-dots-btn" 
                              onClick={(e) => {
                                e.preventDefault();
                                toggleDropdown(student._id);
                              }}
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <div 
                              className={`action-dropdown ${activeDropdown === student._id ? 'active' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleStudentAction('edit', student._id)}
                              >
                                <i className="fas fa-edit"></i>
                                Edit Student
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleStudentAction('delete', student._id)}
                              >
                                <i className="fas fa-trash"></i>
                                Delete Student
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mentors Management */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Mentors Management</h3>
              <p>Manage mentor profiles and their specializations</p>
            </div>
          </div>
          <div className="admin-card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Contact Methods</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mentors.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-chalkboard-teacher" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                        No mentors found
                      </td>
                    </tr>
                  ) : (
                    data.mentors.map(mentor => (
                      <tr key={mentor._id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{mentor.name}</td>
                        <td>{mentor.email}</td>
                        <td>{mentor.phone || 'N/A'}</td>
                        <td>{mentor.specialization || 'N/A'}</td>
                        <td>{mentor.experience || 'N/A'}</td>
                        <td>
                          <div className="contact-methods">
                            {mentor.telegramId && (
                              <span className="contact-badge telegram" title={`Telegram: @${mentor.telegramId}`}>
                                <i className="fab fa-telegram"></i>
                              </span>
                            )}
                            {mentor.whatsapp && (
                              <span className="contact-badge whatsapp" title={`WhatsApp: ${mentor.whatsapp}`}>
                                <i className="fab fa-whatsapp"></i>
                              </span>
                            )}
                            {mentor.linkedin && (
                              <span className="contact-badge linkedin" title="LinkedIn Profile">
                                <i className="fab fa-linkedin"></i>
                              </span>
                            )}
                            {mentor.website && (
                              <span className="contact-badge website" title="Website">
                                <i className="fas fa-globe"></i>
                              </span>
                            )}
                            {!mentor.telegramId && !mentor.whatsapp && !mentor.linkedin && !mentor.website && (
                              <span className="contact-badge none">No additional contacts</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-group">
                            <Link to={`/mentor-profile/${mentor._id}`} className="action-btn view-profile-btn">
                              <i className="fas fa-user"></i>
                              View Profile
                            </Link>
                            <button className="action-btn three-dots-btn" onClick={(e) => {
                              e.preventDefault();
                              toggleDropdown(mentor._id);
                            }}>
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <div 
                              className={`action-dropdown ${activeDropdown === mentor._id ? 'active' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleMentorAction('edit', mentor._id)}
                              >
                                <i className="fas fa-edit"></i>
                                Edit Mentor
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleMentorAction('delete', mentor._id)}
                              >
                                <i className="fas fa-trash"></i>
                                Delete Mentor
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mentor Approval Management */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Mentor Approval Management</h3>
              <p>Review and approve/reject new mentor registration requests</p>
            </div>
          </div>
          <div className="admin-card">
            <MentorApprovalManager />
          </div>
        </div>

        {/* Resource Upload */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Resource Management</h3>
              <p>Upload and manage study materials for students</p>
            </div>
          </div>
          <div className="admin-card">
            <div className="resource-form">
              <select 
                value={data.selectedResource} 
                onChange={(e) => setData({ ...data, selectedResource: e.target.value })}
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
              <input type="file" onChange={handleResourceUpload} />
              <button className="btn-primary" onClick={handleResourceUpload}>
                <i className="fas fa-upload"></i>
                Upload Resource
              </button>
            </div>
          </div>
        </div>

        {/* Doubt Logs */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Doubt Management</h3>
              <p>Monitor and manage student doubts and questions</p>
            </div>
            <div className="doubt-filter">
              <select value={data.selectedDoubtType} onChange={(e) => setData({ ...data, selectedDoubtType: e.target.value })}>
                <option value="All">All Doubts</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="admin-card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.doubts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-question-circle" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                        No doubts found
                      </td>
                    </tr>
                  ) : (
                    data.doubts
                      .filter(doubt => data.selectedDoubtType === 'All' || doubt.status === data.selectedDoubtType)
                      .map(doubt => (
                        <tr key={doubt._id}>
                          <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {doubt.student?.name || 'Unknown Student'}
                          </td>
                          <td>{doubt.subject}</td>
                          <td>{doubt.title || 'No Title'}</td>
                          <td>
                            <span className={`status-badge ${doubt.status.toLowerCase()}`}>
                              {doubt.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doubt.description || doubt.title || 'No description'}
                          </td>
                          <td>{new Date(doubt.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-group">
                              <button 
                                className="action-btn resolve-btn" 
                                onClick={() => handleDoubtStatus(doubt._id, 'Resolved')}
                                disabled={doubt.status === 'Resolved'}
                              >
                                <i className="fas fa-check"></i>
                                Mark Resolved
                              </button>
                              <button 
                                className="action-btn three-dots-btn" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleDropdown(doubt._id);
                                }}
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              <div 
                                className={`action-dropdown ${activeDropdown === doubt._id ? 'active' : ''}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link to={`/student-profile/${doubt.student?._id}`} className="action-dropdown-item">
                                  <i className="fas fa-user"></i>
                                  View Student Profile
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Meeting Management (Admin Only) */}
        <div className="admin-section">
          <MeetingManager />
        </div>

        {/* Upcoming Meetings */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Meeting Overview</h3>
              <p>Monitor scheduled meetings between mentors and students</p>
            </div>
          </div>
          <div className="admin-card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Student</th>
                    <th>Mentor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.meetings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-calendar-alt" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                        No meetings scheduled
                      </td>
                    </tr>
                  ) : (
                    data.meetings.map(meeting => (
                      <tr key={meeting._id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{meeting.title}</td>
                        <td>
                          <div className="user-cell">
                            <span>{meeting.student?.name || 'Unknown Student'}</span>
                            <Link to={`/student-profile/${meeting.student?._id}`} className="profile-link">
                              <i className="fas fa-user"></i> View Profile
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <span>{meeting.mentor?.name || 'Unknown Mentor'}</span>
                            <Link to={`/mentor-profile/${meeting.mentor?._id}`} className="profile-link">
                              <i className="fas fa-user"></i> View Profile
                            </Link>
                          </div>
                        </td>
                        <td>{new Date(meeting.date).toLocaleDateString()}</td>
                        <td>{new Date(meeting.date).toLocaleTimeString()}</td>
                        <td>
                          <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                            {meeting.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h3>Announcements</h3>
              <p>Broadcast important messages to students and mentors</p>
            </div>
          </div>
          <div className="admin-card">
            <div className="notification-form">
              <textarea
                className="announcement-textarea"
                placeholder="Write your announcement here... (e.g., Important updates, schedule changes, or general information for students and mentors)"
                value={data.announcement}
                onChange={(e) => setData({ ...data, announcement: e.target.value })}
              ></textarea>
              <button className="btn-primary" onClick={handleAnnouncement}>
                <i className="fas fa-bullhorn"></i>
                Broadcast Announcement
              </button>
            </div>
            
            {/* Existing Announcements List */}
            <div className="announcements-list-section">
              <h4>Recent Announcements</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Message</th>
                      <th>Admin</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.announcements.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          <i className="fas fa-bullhorn" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                          No announcements yet
                        </td>
                      </tr>
                    ) : (
                      data.announcements.map(announcement => (
                        <tr key={announcement._id}>
                          <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {announcement.message}
                          </td>
                          <td>{announcement.adminName}</td>
                          <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                              {announcement.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="action-group">
                              <button 
                                className={`action-btn ${announcement.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                                onClick={() => handleToggleAnnouncement(announcement._id)}
                                title={announcement.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`fas ${announcement.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                {announcement.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteAnnouncement(announcement._id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
