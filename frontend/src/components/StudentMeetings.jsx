import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaVideo, FaCheckCircle, FaTimesCircle, FaBell, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/StudentMeetings.css';

const StudentMeetings = ({ role }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMeetings();
    }, [role]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            let endpoint = 'http://localhost:5000/api/meetings/student';
            if (role === 'mentor') {
                endpoint = 'http://localhost:5000/api/meetings/mentor';
            }
            const response = await fetch(endpoint, {
                headers: {
                    'x-auth-token': token
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMeetings(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch meetings');
            }
        } catch (error) {
            setError('Failed to fetch meetings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled':
                return <FaCalendar className="status-icon scheduled" />;
            case 'completed':
                return <FaCheckCircle className="status-icon completed" />;
            case 'cancelled':
                return <FaTimesCircle className="status-icon cancelled" />;
            default:
                return <FaCalendar className="status-icon" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const isMeetingUpcoming = (meetingDate) => {
        const now = new Date();
        const meeting = new Date(meetingDate);
        return meeting > now;
    };

    const getTimeUntilMeeting = (meetingDate) => {
        const now = new Date();
        const meeting = new Date(meetingDate);
        const diff = meeting - now;
        
        if (diff <= 0) return null;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} away`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} away`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} away`;
        return 'Starting soon';
    };

    const upcomingMeetings = meetings.filter(meeting => 
        meeting.status === 'scheduled' && isMeetingUpcoming(meeting.date)
    );
    
    const otherMeetings = meetings.filter(meeting => 
        !(meeting.status === 'scheduled' && isMeetingUpcoming(meeting.date))
    );

    if (loading) {
        return (
            <div className="student-meetings">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your meetings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-meetings">
                <div className="error-container">
                    <FaTimesCircle className="error-icon" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-meetings">
            

            {meetings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon-container">
                        <FaCalendar className="empty-icon" />
                    </div>
                    <h3>No meetings scheduled</h3>
                    <p>Your mentors will schedule meetings with you here. Check back later!</p>
                </div>
            ) : (
                <div className="meetings-sections">
                    {/* Upcoming Meetings Section */}
                    {upcomingMeetings.length > 0 && (
                        <div className="meetings-section">
                            <div className="section-header upcoming">
                                <h3><FaBell /> Upcoming Meetings</h3>
                                <span className="section-count">{upcomingMeetings.length}</span>
                            </div>
                            <div className="meetings-grid">
                                {upcomingMeetings.map(meeting => (
                                    <div key={meeting._id} className="meeting-card upcoming-meeting">
                                        <div className="meeting-card-header">
                                            <div className="meeting-title-section">
                                                <h4>{meeting.title}</h4>
                                                <div className="time-until">
                                                    <FaClock />
                                                    <span>{getTimeUntilMeeting(meeting.date)}</span>
                                                </div>
                                            </div>
                                            <div className="meeting-status">
                                                <span className="status-badge scheduled">Scheduled</span>
                                            </div>
                                        </div>

                                        <div className="meeting-content">
                                            <p className="meeting-description">{meeting.description}</p>
                                            
                                            <div className="meeting-info-grid">
                                                <div className="info-item">
                                                    <FaUser className="info-icon" />
                                                    <div className="info-content">
                                                        <span className="info-label">Mentor</span>
                                                        <span className="info-value">{meeting.mentor.name}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="info-item">
                                                    <FaCalendar className="info-icon" />
                                                    <div className="info-content">
                                                        <span className="info-label">Date & Time</span>
                                                        <span className="info-value">
                                                            {formatDate(meeting.date)} at {formatTime(meeting.date)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="info-item">
                                                    <FaClock className="info-icon" />
                                                    <div className="info-content">
                                                        <span className="info-label">Duration</span>
                                                        <span className="info-value">{meeting.duration} minutes</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {meeting.meetingLink && (
                                                <div className="meeting-actions">
                                                    <a 
                                                        href={meeting.meetingLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="join-meeting-btn"
                                                    >
                                                        <FaVideo />
                                                        Join Meeting
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Meetings Section */}
                    {otherMeetings.length > 0 && (
                        <div className="meetings-section">
                            <div className="section-header other">
                                <h3><FaCalendar /> Meeting History</h3>
                                <span className="section-count">{otherMeetings.length}</span>
                            </div>
                            <div className="meetings-list">
                                {otherMeetings.map(meeting => (
                                    <div key={meeting._id} className={`meeting-card ${meeting.status}`}>
                                        <div className="meeting-card-header">
                                            <div className="meeting-title-section">
                                                <h4>{meeting.title}</h4>
                                                <div className="meeting-meta">
                                                    <span className="meeting-date">{formatDate(meeting.date)}</span>
                                                    <span className="meeting-time">{formatTime(meeting.date)}</span>
                                                </div>
                                            </div>
                                            <div className="meeting-status">
                                                <span className={`status-badge ${meeting.status}`}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="meeting-content">
                                            <p className="meeting-description">{meeting.description}</p>
                                            
                                            <div className="meeting-info-compact">
                                                <div className="info-item">
                                                    <FaUser className="info-icon" />
                                                    <span>{meeting.mentor.name}</span>
                                                </div>
                                                
                                                <div className="info-item">
                                                    <FaClock className="info-icon" />
                                                    <span>{meeting.duration} minutes</span>
                                                </div>
                                            </div>

                                            {meeting.status === 'completed' && (
                                                <div className="meeting-completed-badge">
                                                    <FaCheckCircle />
                                                    <span>Meeting completed successfully</span>
                                                </div>
                                            )}

                                            {meeting.status === 'cancelled' && (
                                                <div className="meeting-cancelled-badge">
                                                    <FaTimesCircle />
                                                    <span>Meeting was cancelled</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentMeetings; 