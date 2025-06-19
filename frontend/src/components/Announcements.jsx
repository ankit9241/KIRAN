import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(response.data);
        setLoading(false);

        // Check for new announcements
        const lastSeenId = localStorage.getItem('lastSeenAnnouncementId');
        const active = response.data.filter(a => a.isActive);
        if (active.length > 0) {
          const latestId = active[0]._id;
          if (lastSeenId !== latestId) {
            setIsExpanded(true); // auto-expand if new
            localStorage.setItem('lastSeenAnnouncementId', latestId);
          }
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const handleHeaderClick = (e) => {
    // Don't expand if clicking on close button
    if (e.target.closest('.close-announcements')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const activeAnnouncements = announcements.filter(announcement => announcement.isActive);
  if (!isVisible || (activeAnnouncements.length === 0 && !isExpanded)) {
    return (
      <div className="announcements-restore">
        <button 
          className="restore-announcements" 
          onClick={() => {
            setIsVisible(true);
            setIsExpanded(true);
          }}
          title="Show announcements"
        >
          <i className="fas fa-bell"></i>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <h3>📢 Announcements</h3>
          <button className="close-announcements" onClick={handleClose} title="Close announcements">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="announcements-content">
          <div className="loading-announcements">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <h3>📢 Announcements</h3>
          <button className="close-announcements" onClick={handleClose} title="Close announcements">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="announcements-content">
          <div className="error-announcements">Unable to load announcements</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`announcements-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="announcements-header" onClick={handleHeaderClick}>
        <h3>📢 Announcements</h3>
        <div className="announcements-header-actions">
          <span className="announcement-count">{activeAnnouncements.length}</span>
          <button className="expand-btn">
            {isExpanded ? '−' : '+'}
          </button>
          <button className="close-announcements" onClick={handleClose} title="Close announcements">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div className="announcements-content">
        {activeAnnouncements.length === 0 ? (
          <div className="no-announcements">
            <p>No announcements at the moment</p>
            <small>Check back later for updates!</small>
          </div>
        ) : (
          <div className="announcements-list">
            {activeAnnouncements.slice(0, isExpanded ? activeAnnouncements.length : 3).map((announcement) => (
              <div key={announcement._id} className="announcement-item">
                <div className="announcement-message">
                  {announcement.message}
                </div>
                <div className="announcement-meta">
                  <span className="announcement-admin">By {announcement.adminName}</span>
                  <span className="announcement-time">{formatDate(announcement.createdAt)}</span>
                </div>
              </div>
            ))}
            {activeAnnouncements.length > 3 && !isExpanded && (
              <div className="more-announcements">
                <button onClick={() => setIsExpanded(true)}>
                  View {activeAnnouncements.length - 3} more...
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements; 