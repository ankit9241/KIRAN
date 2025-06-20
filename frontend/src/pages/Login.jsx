import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error('Invalid response: No user data received');
      }

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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome to KIRAN</h1>
            <p>Sign in to continue your learning journey</p>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button className="enroll-google-btn" style={{marginBottom:'1.2rem', width: '100%'}} onClick={handleGoogleLogin} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width:24,marginRight:8}} />
            Sign in with Google
          </button>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@gmail.com"
                required
                disabled={loading}
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
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="decorative-line"></div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>

            <p className="signup-link">
              New to KIRAN?{' '}
              <Link to="/">Go to Homepage to enroll as Student or Mentor</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
