import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-profile.css';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error || !admin) return <div className="admin-profile-error">{error || 'Profile not found'}</div>;

  return (
    <div className={`admin-profile-container${admin.isPremium ? ' premium' : ''}`}>
      <div className="profile-header">
        <div className="avatar"><i className="fas fa-user-shield"></i></div>
        <div className="profile-info">
          <h1>{admin.name}</h1>
          <span className="role-badge">Admin{admin.isPremium && <span className="premium-badge">Premium</span>}</span>
          <p className="email">{admin.email}</p>
        </div>
      </div>
      <div className="profile-details">
        <div className="detail-item"><strong>Phone:</strong> {admin.phone || 'N/A'}</div>
        <div className="detail-item"><strong>Address:</strong> {admin.address || 'N/A'}</div>
        <div className="detail-item"><strong>Bio:</strong> {admin.bio || 'N/A'}</div>
        <div className="detail-item"><strong>Role:</strong> {admin.role || 'N/A'}</div>
      </div>
    </div>
  );
};

export default AdminProfile; 