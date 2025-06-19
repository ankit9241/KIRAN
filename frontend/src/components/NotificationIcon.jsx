import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/notification-icon.css';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load notifications: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUnreadCount(response.data.count);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the icon and dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          iconRef.current && !iconRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener only when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
      // Mark all notifications as read when opening
      try {
        const token = localStorage.getItem('token');
        await axios.patch('http://localhost:5000/api/notifications/mark-all-read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
        // Update notifications to show as read
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      } catch (error) {
      }
    }
  };

  const markAsRead = async (notificationId, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      // General notifications
      case 'announcement':
        return '📢';
      case 'message':
        return '💬';
      case 'reminder':
        return '⏰';
      case 'update':
        return '🔄';
      case 'doubt_response':
        return '❓';
      case 'meeting_scheduled':
        return '📅';
      
      // Admin-specific activity notifications
      case 'new_student_registration':
        return '👨‍🎓';
      case 'new_doubt_submission':
        return '❓';
      case 'meeting_request':
        return '🤝';
      case 'feedback_submission':
        return '⭐';
      case 'new_mentor_registration':
        return '👨‍🏫';
      case 'mentor_approval_update':
        return '✅';
      
      // System alerts
      case 'high_doubt_volume':
        return '⚠️';
      case 'meeting_conflict':
        return '🚨';
      case 'storage_warning':
        return '💾';
      case 'system_alert':
        return '🔧';
      
      // Dashboard notifications
      case 'daily_summary':
        return '📊';
      case 'weekly_summary':
        return '📈';
      case 'performance_metrics':
        return '📋';
      case 'user_engagement':
        return '👥';
      
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444'; // red
      case 'high':
        return '#f59e0b'; // amber
      case 'medium':
        return '#3b82f6'; // blue
      case 'low':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'activity':
        return 'Activity';
      case 'system':
        return 'System';
      case 'dashboard':
        return 'Dashboard';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-icon-wrapper" onClick={toggleDropdown} ref={iconRef}>
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="notification-dropdown" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
              <button 
                className="close-notifications"
                onClick={() => setIsOpen(false)}
                title="Close notifications"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <i className="fas fa-spinner fa-spin"></i>
                Loading notifications...
              </div>
            ) : error ? (
              <div className="notification-error">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
                <small>You're all caught up!</small>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={(e) => !notification.isRead && markAsRead(notification._id, e)}
                    data-priority={notification.priority || 'medium'}
                    data-category={notification.category || 'general'}
                  >
                    <div className="notification-icon-small">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <div className="notification-title">
                          {notification.title}
                        </div>
                        {notification.priority && (
                          <div 
                            className="notification-priority"
                            style={{ backgroundColor: getPriorityColor(notification.priority) }}
                            title={`Priority: ${notification.priority}`}
                          >
                            {notification.priority.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-sender">
                          {notification.senderName}
                        </span>
                        {notification.category && (
                          <span className="notification-category">
                            {getCategoryLabel(notification.category)}
                          </span>
                        )}
                        <span className="notification-time">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-notifications">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon; 