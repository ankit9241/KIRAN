import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaVideo, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/MeetingManager.css';

const MeetingManager = () => {
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
        meetingLink: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMeetings();
        fetchStudents();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/meetings/mentor', {
                headers: {
                    'x-auth-token': token
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMeetings(data);
            }
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
                studentId: formData.studentId,
                date: dateTime.toISOString(),
                duration: parseInt(formData.duration),
                meetingLink: formData.meetingLink
            };

            const url = editingMeeting 
                ? `http://localhost:5000/api/meetings/${editingMeeting._id}`
                : 'http://localhost:5000/api/meetings';
            
            const method = editingMeeting ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(meetingData)
            });

            if (response.ok) {
                const data = await response.json();
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
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                setMeetings(meetings.filter(m => m._id !== meetingId));
                setSuccess('Meeting deleted successfully!');
            } else {
                setError('Failed to delete meeting');
            }
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
            studentId: meeting.student._id,
            date: dateStr,
            time: timeStr,
            duration: meeting.duration,
            meetingLink: meeting.meetingLink || ''
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
            meetingLink: ''
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

                            <div className="form-row">
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
                                        <div className="info-item">
                                            <FaUser />
                                            <span>{meeting.student.name}</span>
                                        </div>
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