import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorApprovalManager from '../components/MentorApprovalManager';
import MeetingManager from '../components/MeetingManager';
import API_ENDPOINTS from '../config/api';
import '../styles/admin-dashboard.css';

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

  const [selectedStudent, setSelectedStudent] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    // Check if user has recently logged out
    const hasRecentlyLoggedOut = sessionStorage.getItem('recentlyLoggedOut');
    if (hasRecentlyLoggedOut) {
      navigate('/login');
      return;
    }
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    console.log('Admin Dashboard - User data:', userData);
    
    if (userData.role !== 'admin') {
      console.error('User is not admin, role:', userData.role);
      navigate('/login');
      return;
    }

    // Test basic authentication first
    testAdminAuth();
  }, [navigate]);

  // Test admin authentication
  const testAdminAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Testing admin authentication...');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Test basic auth verification
      const authResponse = await axios.get(API_ENDPOINTS.USERS + '/me', { headers });
      console.log('Auth test response:', authResponse.data);
      
      if (authResponse.data.role !== 'admin') {
        setError('Access denied. Admin role required.');
        setLoading(false);
        return;
      }
      
      // If auth test passes, fetch all data
      fetchAllData();
    } catch (error) {
      console.error('Admin auth test failed:', error);
      setError(`Authentication failed: ${error.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching admin dashboard data...');

      const [
        studentsResponse,
        mentorsResponse,
        doubtsResponse,
        meetingsResponse,
        resourcesResponse,
        announcementsResponse
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.USERS, { headers }),
        axios.get(API_ENDPOINTS.MENTORS, { headers }),
        axios.get(API_ENDPOINTS.ALL_DOUBTS, { headers }),
        axios.get(API_ENDPOINTS.ALL_MEETINGS, { headers }),
        axios.get(API_ENDPOINTS.ALL_RESOURCES, { headers }),
        axios.get(API_ENDPOINTS.ALL_ANNOUNCEMENTS, { headers })
      ]);

      console.log('Data fetched successfully:', {
        students: studentsResponse.data.length,
        mentors: mentorsResponse.data.length,
        doubts: doubtsResponse.data.length,
        meetings: meetingsResponse.data.length,
        resources: resourcesResponse.data.length,
        announcements: announcementsResponse.data.length
      });

      setData(prev => ({
        ...prev,
        students: studentsResponse.data.filter(user => user.role === 'student'),
        mentors: mentorsResponse.data.filter(user => user.role === 'mentor'),
        doubts: doubtsResponse.data,
        meetings: meetingsResponse.data,
        resources: resourcesResponse.data,
        announcements: announcementsResponse.data
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
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
  const handleStudentAction = async (studentId, action) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (action === 'view') {
        // Implement view logic, e.g., navigate to a student profile page
        console.log('Viewing student:', studentId);
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this student?')) {
          await axios.delete(API_ENDPOINTS.USER_PROFILE(studentId), { headers });
          await fetchAllData(); // Refresh data
        }
      }
    } catch (error) {
      console.error(`Error performing action ${action} on student:`, error);
    }
  };

  const handleMentorAction = async (mentorId, action) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (action === 'view') {
        // Implement view logic
        console.log('Viewing mentor:', mentorId);
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this mentor?')) {
          await axios.delete(API_ENDPOINTS.USER_PROFILE(mentorId), { headers });
          await fetchAllData(); // Refresh data
        }
      }
    } catch (error) {
      console.error(`Error performing action ${action} on mentor:`, error);
    }
  };

  const handleResourceUpload = async (e) => {
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
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.UPLOAD_STUDENT_RESOURCE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Resource uploaded successfully!');
      setResourceFile(null);
      setResourceTitle('');
      setResourceDescription('');
      setSelectedStudent('');
      fetchAllData();
    } catch (error) {
      console.error('Error uploading resource:', error);
    }
  };

  const handleDoubtStatusChange = async (doubtId, status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(API_ENDPOINTS.DOUBT_STATUS(doubtId), { status }, { headers });
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error updating doubt status:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!data.announcement) {
      alert('Please enter an announcement message.');
      return;
    }
    try {
      await axios.post(API_ENDPOINTS.ANNOUNCEMENTS, {
        message: data.announcement
      });
      alert('Announcement created successfully!');
      setData(prev => ({ ...prev, announcement: '' }));
      fetchAllData();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement.');
    }
  };

  const handleToggleAnnouncement = async (announcementId) => {
    try {
      await axios.patch(API_ENDPOINTS.TOGGLE_ANNOUNCEMENT(announcementId));
      alert('Announcement status updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating announcement status:', error);
      alert('Failed to update announcement status.');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(API_ENDPOINTS.ANNOUNCEMENTS + `/${announcementId}`);
        alert('Announcement deleted successfully!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement.');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Checking authentication and fetching data...
          </p>
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
                                onClick={() => handleStudentAction(student._id, 'edit')}
                              >
                                <i className="fas fa-edit"></i>
                                Edit Student
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleStudentAction(student._id, 'delete')}
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
                                onClick={() => handleMentorAction(mentor._id, 'edit')}
                              >
                                <i className="fas fa-edit"></i>
                                Edit Mentor
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleMentorAction(mentor._id, 'delete')}
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="resource-student">Select Student:</label>
                  <select 
                    id="resource-student"
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Choose a student...</option>
                    {data.students.map(student => (
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
                                onClick={() => handleDoubtStatusChange(doubt._id, 'Resolved')}
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
              <button className="btn-primary" onClick={handleCreateAnnouncement}>
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
