import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data to determine role
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;
        
        // Redirect based on user role
        if (user.role === 'student') {
          navigate(`/student-profile/${userId}`);
        } else if (user.role === 'mentor') {
          // For mentors, we'll show a simple profile page
          navigate(`/mentor-profile/${userId}`);
        } else {
          // For admins or other roles, show a simple profile
          navigate(`/admin-profile/${userId}`);
        }
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndRedirect();
    }
  }, [userId, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading profile...
      </div>
    );
  }

  return null;
};

export default UserProfile; 