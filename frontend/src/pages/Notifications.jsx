import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/notifications.css';
import API_ENDPOINTS from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.NOTIFICATIONS, { headers: { Authorization: `Bearer ${token}` } });
        // Support both array and { notifications: [...] }
        let data = res.data;
        if (data && !Array.isArray(data) && Array.isArray(data.notifications)) {
          data = data.notifications;
        }
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(API_ENDPOINTS.MARK_ALL_READ, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // Optionally show error
    } finally {
      setMarking(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(API_ENDPOINTS.MARK_READ(notifId), {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="notifications-page-premium">
      <div className="notifications-header-premium">
        <h1>Notifications</h1>
        <button className="mark-all-read-btn-premium" onClick={handleMarkAllRead} disabled={marking}>
          Mark All Read
        </button>
      </div>
      {loading ? (
        <div className="notifications-loading"><LoadingSpinner /></div>
      ) : error ? (
        <div className="notifications-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">No notifications yet.</div>
      ) : (
        <div className="notifications-list-premium">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notification-card-premium${notif.isRead ? '' : ' unread'}`}
              onClick={() => { if (!notif.isRead) handleMarkAsRead(notif._id); }}
              style={{ cursor: !notif.isRead ? 'pointer' : 'default', fontWeight: notif.isRead ? 400 : 700, background: notif.isRead ? '#fff' : '#e0f2fe' }}
            >
              <div className="notification-card-header-premium">
                <span className="notification-title-premium" style={{ fontWeight: notif.isRead ? 600 : 800 }}>
                  {notif.title}
                </span>
                <span className="notification-time-premium">{formatTime(notif.createdAt)}</span>
                {!notif.isRead && <span className="notification-unread-dot-premium" />}
              </div>
              <div className="notification-message-premium">{notif.message}</div>
              <div className="notification-meta-premium">
                <span className="notification-sender-premium">{notif.senderName || 'System'}</span>
                {notif.category && <span className="notification-category-premium">{notif.category}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications; 