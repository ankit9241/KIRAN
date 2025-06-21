import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import { useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { verifyToken } from '../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has recently logged out
      const hasRecentlyLoggedOut = sessionStorage.getItem('recentlyLoggedOut');
      
      if (hasRecentlyLoggedOut) {
        // Clear the recently logged out flag
        sessionStorage.removeItem('recentlyLoggedOut');
        setAuthChecked(true);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        const user = await verifyToken(token);
        if (user && user.role) {
          switch (user.role) {
            case 'student': navigate('/student'); break;
            case 'mentor': navigate('/mentor'); break;
            case 'admin': navigate('/admin'); break;
            default: break;
          }
          return;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use backend authentication for email/password login
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch custom event to notify navbar of auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Redirect based on role
      setTimeout(() => {
        switch (response.data.user.role) {
          case 'student':
            navigate('/student');
            break;
          case 'mentor':
            navigate('/mentor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
            break;
        }
      }, 100);

    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Please provide email and password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { googleIdToken: token });

      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Dispatch custom event to notify navbar of auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      localStorage.setItem('initialLoginRedirect', 'true');

      setTimeout(() => {
        switch (response.data.user.role) {
          case 'student':
            navigate('/student');
            break;
          case 'mentor':
            navigate('/mentor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
            break;
        }
      }, 100);

    } catch (err) {
      console.error('Google login failed:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <div className="login-container">
      <div style={{ marginTop: '100px', marginBottom: '200px' }}>
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your KIRAN account</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Google Button on Top - Premium Style */}
          <button 
            onClick={handleGoogleLogin} 
            className="google-enroll-btn"
            disabled={loading}
            type="button"
            style={{ marginTop: '1rem', marginBottom: '1.5rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                Continue with Google
              </>
            )}
          </button>

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            <p style={{ textAlign: 'center' }}>
              <Link to="/forgot-password" className="forgot-password-link">Forgot your password?</Link>
            </p>

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p style={{ marginTop: 24, fontWeight: 500, color: '#374151', textAlign: 'center' }}>
              If new to this, enroll yourself as{' '}
              <span
                style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate('/enroll/student')}
              >
                Student
              </span>{' '}or{' '}
              <span
                style={{ color: '#10b981', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate('/enroll/mentor')}
              >
                Mentor
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
