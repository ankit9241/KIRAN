import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaVideo, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import '../styles/MeetingManager.css';

const MeetingManager = ({ userRole }) => {
    const [meetings, setMeetings] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        studentId: '',
        date: '',
        time: '',
        duration: 30,
        meetingLink: '',
        meetingType: 'individual'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMeetings();
        fetchStudents();
    }, [userRole]);

    const fetchMeetings = async () => {
        try {
            const endpoint = userRole === 'mentor' ? API_ENDPOINTS.MENTOR_MEETINGS : API_ENDPOINTS.STUDENT_MEETINGS;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMeetings(response.data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/meetings/students', {
                headers: {
                    'x-auth-token': token
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const dateTime = new Date(`${formData.date}T${formData.time}`);
            
            const meetingData = {
                title: formData.title,
                description: formData.description,
                studentId: formData.meetingType === 'individual' ? formData.studentId : undefined,
                date: dateTime.toISOString(),
                duration: parseInt(formData.duration),
                meetingLink: formData.meetingLink,
                meetingType: formData.meetingType
            };

            const url = editingMeeting 
                ? API_ENDPOINTS.MEETING_BY_ID(editingMeeting._id)
                : API_ENDPOINTS.MEETINGS;
            
            const method = editingMeeting ? 'put' : 'post';

            const response = await axios[method](url, meetingData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.status === 201 || response.status === 200) {
                const data = response.data;
                if (editingMeeting) {
                    setMeetings(meetings.map(m => m._id === editingMeeting._id ? data : m));
                    setSuccess('Meeting updated successfully!');
                } else {
                    setMeetings([...meetings, data]);
                    setSuccess('Meeting created successfully!');
                }
                resetForm();
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to save meeting');
            }
        } catch (error) {
            console.error('Error saving meeting:', error);
            setError('Failed to save meeting');
        }
    };

    const handleDelete = async (meetingId) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) {
            return;
        }

        try {
            await axios.delete(API_ENDPOINTS.MEETING_BY_ID(meetingId), {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMeetings(meetings.filter(m => m._id !== meetingId));
            setSuccess('Meeting deleted successfully!');
        } catch (error) {
            console.error('Error deleting meeting:', error);
            setError('Failed to delete meeting');
        }
    };

    const handleEdit = (meeting) => {
        const date = new Date(meeting.date);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().slice(0, 5);

        setFormData({
            title: meeting.title,
            description: meeting.description,
            studentId: meeting.student ? meeting.student._id : '',
            date: dateStr,
            time: timeStr,
            duration: meeting.duration,
            meetingLink: meeting.meetingLink || '',
            meetingType: meeting.meetingType || 'individual'
        });
        setEditingMeeting(meeting);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            studentId: '',
            date: '',
            time: '',
            duration: 30,
            meetingLink: '',
            meetingType: 'individual'
        });
        setEditingMeeting(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    if (loading) {
        return <div className="loading">Loading meetings...</div>;
    }

    return (
        <div className="meeting-manager">
            <div className="meeting-header">
                <h2><FaCalendar /> Meeting Management</h2>
                <button 
                    className="btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <FaPlus /> Schedule Meeting
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="meeting-form-container">
                    <div className="meeting-form">
                        <h3>{editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Meeting Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="Enter meeting title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                    placeholder="Enter meeting description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Meeting Type *</label>
                                <select
                                    value={formData.meetingType}
                                    onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                                    required
                                >
                                    <option value="individual">Individual Meeting</option>
                                    <option value="all_students">All Students</option>
                                    <option value="all_mentors">All Mentors</option>
                                    <option value="all_users">All Users (Students + Mentors)</option>
                                </select>
                            </div>

                            {formData.meetingType === 'individual' && (
                                <div className="form-group">
                                    <label>Student *</label>
                                    <select
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (minutes) *</label>
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                        required
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="90">1.5 hours</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Time *</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Meeting Link</label>
                                <input
                                    type="url"
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="meetings-list">
                <h3>Your Scheduled Meetings</h3>
                {meetings.length === 0 ? (
                    <div className="empty-state">
                        <FaCalendar className="empty-icon" />
                        <h4>No meetings scheduled</h4>
                        <p>Schedule your first meeting with a student to get started.</p>
                    </div>
                ) : (
                    <div className="meetings-grid">
                        {meetings.map(meeting => (
                            <div key={meeting._id} className="meeting-card">
                                <div className="meeting-header-card">
                                    <h4>{meeting.title}</h4>
                                    <span className={`status-badge ${meeting.status}`}>
                                        {meeting.status}
                                    </span>
                                </div>
                                
                                <div className="meeting-details">
                                    <p className="meeting-description">{meeting.description}</p>
                                    
                                    <div className="meeting-info">
                                        {meeting.meetingType === 'individual' && meeting.student && (
                                            <div className="info-item">
                                                <FaUser />
                                                <span>{meeting.student.name}</span>
                                            </div>
                                        )}
                                        {meeting.meetingType !== 'individual' && (
                                            <div className="info-item">
                                                <FaUser />
                                                <span>
                                                    {meeting.meetingType === 'all_students' && 'All Students'}
                                                    {meeting.meetingType === 'all_mentors' && 'All Mentors'}
                                                    {meeting.meetingType === 'all_users' && 'All Users'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <FaCalendar />
                                            <span>{formatDate(meeting.date)}</span>
                                        </div>
                                        <div className="info-item">
                                            <FaClock />
                                            <span>{formatTime(meeting.date)} ({meeting.duration} min)</span>
                                        </div>
                                        {meeting.meetingLink && (
                                            <div className="info-item">
                                                <FaVideo />
                                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                                    Join Meeting
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="meeting-actions">
                                    <button 
                                        className="btn-edit"
                                        onClick={() => handleEdit(meeting)}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(meeting._id)}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingManager; 