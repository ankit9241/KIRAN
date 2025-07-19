import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import API_ENDPOINTS from '../config/api';
import '../styles/notification-icon.css';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = ({ small = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(false);

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS, {
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
      
      const response = await axios.get(API_ENDPOINTS.UNREAD_NOTIFICATIONS, {
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);
      setMobileDropdown(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      // Mark all notifications as read when opening
      const markAllRead = async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.patch(API_ENDPOINTS.MARK_ALL_READ, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(0);
          setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        } catch (error) {}
      };
      markAllRead();
    }
  }, [isOpen, unreadCount]);

  const markAsRead = async (notificationId, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    try {
      const token = localStorage.getItem('token');
      await axios.patch(API_ENDPOINTS.MARK_READ(notificationId), {}, {
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
      await axios.patch(API_ENDPOINTS.MARK_ALL_READ, {}, {
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

  // Helper: handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead(notification._id, { stopPropagation: () => {} });
    }
    // Routing logic based on notification type
    switch (notification.type) {
      case 'update': // New resource (public or personal)
        // If personal resource (has relatedModel === 'StudyMaterial' and maybe metadata or message indicates personal)
        if (notification.relatedModel === 'StudyMaterial' && notification.message?.toLowerCase().includes('personal')) {
          // Go to dashboard personal resources section
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'student') {
            navigate('/student', { state: { scrollTo: 'personal-resources-section' } });
            setIsOpen(false);
            setTimeout(() => {
              // Find the Personal Resources section by its header
              const el = Array.from(document.querySelectorAll('.student-dashboard .section-header h2'))
                .find(h2 => h2.textContent.trim().toLowerCase().includes('personal resources'));
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
            break;
          }
        }
        // Default: go to study material page
        navigate('/study-material', { state: { scrollTo: 'resources-section' } });
        setIsOpen(false);
        setTimeout(() => {
          const el = document.querySelector('.resources-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        break;
      case 'mentor_approval_update':
      case 'new_mentor_registration':
        navigate('/admin', { state: { scrollTo: 'mentor-approval-section' } });
        setIsOpen(false);
        setTimeout(() => {
          const el = document.querySelector('.admin-section h3');
          if (el && el.textContent.includes('Mentor Approval')) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
        break;
      case 'meeting_scheduled':
        navigate('/student');
        setIsOpen(false);
        setTimeout(() => {
          const el = document.querySelector('.student-dashboard .section-header h2');
          if (el && el.textContent.includes('Upcoming Meetings')) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
        break;
      case 'doubt_response':
        navigate('/student');
        setIsOpen(false);
        setTimeout(() => {
          const el = document.querySelector('.student-dashboard .section-header h2');
          if (el && el.textContent.includes('Doubts')) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
        break;
      case 'announcement':
        navigate('/');
        setIsOpen(false);
        break;
      default:
        // Fallback: go to dashboard
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'mentor') navigate('/mentor');
        else if (user.role === 'student') navigate('/student');
        setIsOpen(false);
    }
  };

  return (
    <div className="notification-container">
      <div
        className="notification-icon"
        onClick={toggleDropdown}
        ref={iconRef}
        style={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0, margin: 0, ...(small ? { fontSize: '1.2rem', width: 28, height: 28 } : {}) }}
      >
        <i className="fas fa-bell" style={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0, margin: 0, ...(small ? { fontSize: '1.2rem' } : {}) }}></i>
        {unreadCount > 0 && (
          <span className="notification-badge" style={small ? { fontSize: '0.7em', minWidth: 16, height: 16, padding: '0 4px', top: -4, right: -4 } : {}}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Only render dropdown if not mobile */}
      {(isOpen && (
        <div
          className={`notification-dropdown${mobileDropdown ? ' mobile' : ''}`}
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          style={mobileDropdown ? {
            display: 'block',
            zIndex: 99999,
            position: 'fixed',
            top: '60px',
            right: '8px',
            left: 'auto',
            width: '98vw',
            minWidth: '200px',
            maxWidth: '320px',
            maxHeight: '38vh',
            padding: '0.5rem 0.5rem 0.15rem 0.5rem',
            borderRadius: '1rem',
            background: '#fff',
            boxShadow: '0 4px 16px rgba(31,41,55,0.13)',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
          } : {
            display: 'block',
            zIndex: 99999,
            position: 'fixed',
            top: '80px',
            right: '40px',
            background: '#fff',
            border: '2px solid #4F46E5',
            minWidth: '260px',
            maxWidth: '90vw',
            padding: '0.5rem 0.5rem 0.25rem 0.5rem',
          }}
        >
          <div className="notification-header">
            <h3>Notifications</h3>
            
          </div>

          <div className="notification-content" style={mobileDropdown ? { overflow: 'visible', maxHeight: 'none' } : {}}>
            {loading ? (
              <div className="notification-loading"><LoadingSpinner /></div>
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
                {notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
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
              <button className="view-all-notifications" onClick={() => { setIsOpen(false); navigate('/notifications'); }}>
                View All Notifications
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationIcon; 