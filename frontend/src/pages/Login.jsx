import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get user token for backend authentication
          const token = await user.getIdToken();
          
          // Call backend to get user data and role
          const response = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
            googleIdToken: token 
          });
          
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
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

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use Firebase Authentication for email/password login
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      // Call backend to get user data and role
      const response = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
        googleIdToken: token 
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
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
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
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

  return (
    <div className="login-container">
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

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="google-login-btn"
          disabled={loading}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
          Continue with Google
        </button>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/enroll/student">Sign up here</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
