import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/enroll.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const Enroll = () => {
  const { type } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
            googleIdToken: token 
          });
          
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
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
        } catch (error) {
          console.error('Error getting user data:', error);
          setError('Failed to get user information. Please try again.');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailPasswordRegistration = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Firebase Authentication for email/password registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const token = await user.getIdToken();

      // Call backend to register user with role
      const registerUrl = `${API_ENDPOINTS.REGISTER}/${type}`;
      await axios.post(registerUrl, {
        name: formData.name,
        email: formData.email,
        googleIdToken: token,
        role: type === 'mentor' ? 'mentor' : type === 'admin' ? 'admin' : 'student',
        subjectsTaught: type === 'mentor' ? [formData.specialization] : undefined
      });

      setSuccess('Account created successfully! Redirecting...');
      
      // Get user data and redirect
      const loginResponse = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
        googleIdToken: token 
      });
      
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      
      setTimeout(() => {
        switch (loginResponse.data.user.role) {
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
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegistration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      // Call backend to register user with role
      const registerUrl = `${API_ENDPOINTS.REGISTER}/${type}`;
      await axios.post(registerUrl, {
        name: formData.name || user.displayName,
        email: user.email,
        googleIdToken: token,
        role: type === 'mentor' ? 'mentor' : type === 'admin' ? 'admin' : 'student',
        subjectsTaught: type === 'mentor' ? [formData.specialization] : undefined
      });

      setSuccess('Account created successfully! Redirecting...');
      
      // Get user data and redirect
      const loginResponse = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
        googleIdToken: token 
      });
      
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      
      setTimeout(() => {
        switch (loginResponse.data.user.role) {
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
      }, 2000);

    } catch (err) {
      console.error('Google registration failed:', err);
      setError(err.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'student':
        return 'Student Registration';
      case 'mentor':
        return 'Mentor Registration';
      case 'admin':
        return 'Admin Registration';
      default:
        return 'Registration';
    }
  };

  return (
    <div className="enroll-container">
      <div className="enroll-card">
        <div className="enroll-header">
          <h1>{getTitle()}</h1>
          <p>Join KIRAN and start your learning journey</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleEmailPasswordRegistration} className="enroll-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

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

          {type === 'mentor' && (
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                placeholder="e.g., Mathematics, Physics, Computer Science"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" 
            className="enroll-btn" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          onClick={handleGoogleRegistration} 
          className="google-enroll-btn"
          disabled={loading}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
          Continue with Google
        </button>

        <div className="enroll-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Enroll;
