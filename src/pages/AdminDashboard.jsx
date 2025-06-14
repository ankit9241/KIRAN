import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState({
    selectedStudent: null,
    selectedMentor: null,
    selectedResource: null,
    selectedDoubtType: 'All',
    announcement: '',
    students: [
      {
        id: 1,
        name: 'John Doe',
        class: '12th',
        stream: 'Science',
        targetExam: 'JEE',
        mentor: 'Mr. Smith'
      },
      {
        id: 2,
        name: 'Jane Smith',
        class: '11th',
        stream: 'Commerce',
        targetExam: 'NEET',
        mentor: 'Ms. Johnson'
      }
    ],
    mentors: [
      { id: 1, name: 'Mr. Smith', subject: 'Physics', students: '5 students' },
      { id: 2, name: 'Ms. Johnson', subject: 'Chemistry', students: '3 students' }
    ],
    doubts: [
      { id: 1, studentName: 'John Doe', subject: 'Physics', type: 'Academic', status: 'Pending', question: 'Question about vectors', timestamp: '2025-06-13' },
      { id: 2, studentName: 'Jane Smith', subject: 'Chemistry', type: 'Emotional', status: 'Resolved', question: 'Stress management', timestamp: '2025-06-12' }
    ],
    resources: [
      { id: 1, subject: 'Physics', type: 'Study Material' },
      { id: 2, subject: 'Chemistry', type: 'Practice Papers' }
    ]
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Helper functions to update specific parts of data
  const updateData = (updates) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Handlers
  const handleStudentAction = (action, studentId) => {
    if (action === 'edit') {
      console.log(`Editing student ${studentId}`);
      // Add edit logic here
    } else if (action === 'delete') {
      console.log(`Deleting student ${studentId}`);
      // Add delete logic here
    } else if (action === 'assign') {
      console.log(`Assigning mentor to student ${studentId}`);
      // Add mentor assignment logic here
    }
  };

  const handleMentorAction = (action, mentorId) => {
    if (action === 'edit') {
      console.log(`Editing mentor ${mentorId}`);
      // Add edit logic here
    } else if (action === 'delete') {
      console.log(`Deleting mentor ${mentorId}`);
      // Add delete logic here
    }
  };

  const handleResourceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading resource:', file.name);
      // Add resource upload logic here
    }
  };

  const handleDoubtStatus = (doubtId, status) => {
    console.log(`Updating doubt ${doubtId} to ${status}`);
    // Add doubt status update logic here
  };

  const handleAnnouncement = () => {
    console.log('Announcement broadcast triggered');
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Admin! Manage students, mentors, and resources efficiently.</p>
      </div>

      {/* Admin Container */}
      <div className="admin-container">
        {/* Sidebar */}
        {/* <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
              <i className="fas fa-bars"></i>
            </div>
            <div className="sidebar-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>Admin</span>
            </div>
          </div>
          <div className="sidebar-menu">
            <div className="sidebar-item active">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </div>
            <div className="sidebar-item">
              <i className="fas fa-user-graduate"></i>
              <span>Students</span>
            </div>
            <div className="sidebar-item">
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Mentors</span>
            </div>
            <div className="sidebar-item">
              <i className="fas fa-question"></i>
              <span>Doubts</span>
            </div>
            <div className="sidebar-item">
              <i className="fas fa-file-alt"></i>
              <span>Resources</span>
            </div>
            <div className="sidebar-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Calendar</span>
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
                <i className="fas fa-question"></i>
              </div>
              <div className="summary-number">{data.doubts.length}</div>
              <div className="summary-label">Total Doubts</div>
            </div>
          </div>

          {/* Students Management */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Students Management</h3>
              <p>Manage student profiles and mentor assignments</p>
            </div>
            <div className="admin-card">
              <div className="section-header">
                <h2 className="section-title">Students Management</h2>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Stream</th>
                      <th>Target Exam</th>
                      <th>Mentor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td>{student.stream}</td>
                        <td>{student.targetExam}</td>
                        <td>{student.mentor}</td>

                        <td>
                          <div className="action-group">
                            <Link to={`/profile/${student.id}`} className="action-btn view-profile-btn">
                              <i className="fas fa-user"></i>
                              View Profile
                            </Link>
                            <button 
                              className="action-btn three-dots-btn" 
                              onClick={(e) => {
                                e.preventDefault();
                                toggleDropdown(student.id);
                              }}
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <div 
                              className={`action-dropdown ${activeDropdown === student.id ? 'active' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleStudentAction('edit', student.id)}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleStudentAction('delete', student.id)}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mentors Management */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Mentors Management</h3>
              <p>Manage mentor profiles and assignments</p>
            </div>
            <div className="admin-card">
              <div className="section-header">
                <h2 className="section-title">Mentors Management</h2>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mentors.map(mentor => (
                      <tr key={mentor.id}>
                        <td>{mentor.name}</td>
                        <td>{mentor.subject}</td>
                        <td>{mentor.students}</td>
                        <td>
                          <div className="action-group">
                            <Link to={`/profile/${mentor.id}`} className="action-btn view-profile-btn">
                              <i className="fas fa-user"></i>
                              View Profile
                            </Link>
                            <button className="action-btn three-dots-btn" onClick={(e) => {
                              e.preventDefault();
                              toggleDropdown(mentor.id);
                            }}>
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <div 
                              className={`action-dropdown ${activeDropdown === mentor.id ? 'active' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleMentorAction('edit', mentor.id)}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button 
                                className="action-dropdown-item" 
                                onClick={() => handleMentorAction('delete', mentor.id)}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resource Upload */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Resource Upload</h3>
              <p>Upload study materials and practice papers</p>
            </div>
            <div className="admin-card">
              <div className="resource-form">
                <select onChange={(e) => setData({ ...data, selectedResource: e.target.value })}>
                  <option value="">Select Subject</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                <input type="file" onChange={handleResourceUpload} />
                <button className="btn-primary" onClick={handleResourceUpload}>
                  <i className="fas fa-upload mr-2"></i>Upload
                </button>
              </div>
            </div>
          </div>

          {/* Doubt Logs */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Doubt Logs</h3>
              <p>Manage student doubts and questions</p>
            </div>
            <div className="admin-card">
              <div className="section-header">
                <h2 className="section-title">Doubt Logs</h2>
                <div className="doubt-filter">
                  <select value={data.selectedDoubtType} onChange={(e) => setData({ ...data, selectedDoubtType: e.target.value })}>
                    <option value="All">All Types</option>
                    <option value="Academic">Academic</option>
                    <option value="Emotional">Emotional</option>
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Question</th>
                      <th>Timestamp</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.doubts
                      .filter(doubt => data.selectedDoubtType === 'All' || doubt.type === data.selectedDoubtType)
                      .map(doubt => (
                        <tr key={doubt.id}>
                          <td>{doubt.studentName}</td>
                          <td>{doubt.subject}</td>
                          <td>{doubt.type}</td>
                          <td>
                            <span className={`status-badge ${doubt.status.toLowerCase()}`}>
                              {doubt.status}
                            </span>
                          </td>
                          <td>{doubt.question}</td>
                          <td>{doubt.timestamp}</td>
                          <td>
                            <div className="action-group">
                              <button 
                                className="action-btn resolve-btn" 
                                onClick={() => handleDoubtStatus(doubt.id, 'Resolved')}
                              >
                                <i className="fas fa-check"></i>
                                Mark Resolved
                              </button>
                              <button 
                                className="action-btn three-dots-btn" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleDropdown(doubt.id);
                                }}
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              <div 
                                className={`action-dropdown ${activeDropdown === doubt.id ? 'active' : ''}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link to={`/profile/${doubt.studentName}`} className="action-dropdown-item">
                                  <i className="fas fa-user"></i>
                                  View Student Profile
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calendar Section (Placeholder) */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Upcoming Meetings</h3>
              <p>View upcoming meetings and events</p>
            </div>
            <div className="admin-card">
              <div className="calendar-view">
                <p>Calendar view coming soon...</p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="admin-section">
            <div className="section-header">
              <h3>Announcements</h3>
              <p>Broadcast important announcements to students and mentors</p>
            </div>
            <div className="admin-card">
              <div className="notification-form">
                <textarea
                  className="announcement-textarea"
                  placeholder="Write your announcement here..."
                  value={data.announcement}
                  onChange={(e) => setData({ ...data, announcement: e.target.value })}
                ></textarea>
                <button className="btn-primary" onClick={handleAnnouncement}>
                  <i className="fas fa-bullhorn mr-2"></i>Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
