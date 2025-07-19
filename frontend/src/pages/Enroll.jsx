import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/enroll.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';
import { verifyToken } from '../utils/auth';

const Enroll = () => {
  const { type } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    bio: '',
    // Student-specific fields
    class: '',
    stream: '',
    targetExam: '',
    preferredSubjects: '',
    learningGoals: '',
    // Mentor-specific fields
    specialization: '',
    experience: '',
    qualifications: '',
    teachingStyle: '',
    telegramId: '',
    whatsapp: '',
    linkedin: '',
    website: '',
    achievements: '',
    currentStatus: '' // NEW FIELD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isGoogleMode, setIsGoogleMode] = useState(false);
  const [registrationMode, setRegistrationMode] = useState('google'); // 'google' or 'email'
  const [googleUser, setGoogleUser] = useState(null); // Store Google user after sign-in
  const [googleSignInComplete, setGoogleSignInComplete] = useState(false); // Track if Google sign-in is done
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await verifyToken(token);
        if (!user || !user.role) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Check if user is already logged in (firebase)
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // Check if user has recently logged out
      const hasRecentlyLoggedOut = sessionStorage.getItem('recentlyLoggedOut');
      if (!user && hasRecentlyLoggedOut) {
        // Clear the recently logged out flag after a short delay
        setTimeout(() => {
          sessionStorage.removeItem('recentlyLoggedOut');
        }, 1000);
      }
      // Do NOT auto-login or redirect if user is present
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to validate required fields for Google registration
  const validateRequiredFields = () => {
    const requiredFields = ['name', 'phone', 'address', 'bio'];
    
    // Add role-specific required fields
    if (type === 'student') {
      requiredFields.push('class', 'stream', 'targetExam', 'preferredSubjects', 'learningGoals');
    } else if (type === 'mentor') {
      requiredFields.push('specialization', 'experience', 'qualifications', 'teachingStyle', 'achievements', 'bio', 'address', 'telegramId', 'currentStatus');
    }
    
    // Add email/password validation if in email mode
    if (registrationMode === 'email') {
      requiredFields.push('email', 'password', 'confirmPassword');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch (field) {
          case 'class': return 'Class';
          case 'stream': return 'Stream';
          case 'targetExam': return 'Target Exam';
          case 'preferredSubjects': return 'Preferred Subjects';
          case 'learningGoals': return 'Learning Goals';
          case 'specialization': return 'Specialization';
          case 'experience': return 'Years of Experience';
          case 'qualifications': return 'Qualifications';
          case 'teachingStyle': return 'Teaching Style';
          case 'achievements': return 'Achievements';
          case 'email': return 'Email';
          case 'password': return 'Password';
          case 'confirmPassword': return 'Confirm Password';
          case 'bio': return 'Bio';
          case 'address': return 'Address';
          case 'telegramId': return 'Telegram ID';
          case 'currentStatus': return 'Current Status';
          default: return field.charAt(0).toUpperCase() + field.slice(1);
        }
      });
      setError(`Please fill in the following required fields: ${fieldNames.join(', ')}`);
      return false;
    }
    
    // Additional validation for email mode
    if (registrationMode === 'email') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    
    return true;
  };

  const handleGoogleRegistration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store Google user data
      setGoogleUser(user);
      setGoogleSignInComplete(true);
      
      // Pre-fill form with Google data
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName,
        email: user.email
      }));
      
      setSuccess('Google account connected! Now fill in your details below.');
      
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleEnrollment = async () => {
    setLoading(true);
    setError(null);
    
    // Validate required fields before proceeding
    if (!validateRequiredFields()) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await googleUser.getIdToken();
      
      // Prepare registration data based on user type
      let registrationData = {
        name: formData.name || googleUser.displayName,
        email: googleUser.email,
        googleIdToken: token,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio
      };
      
      if (type === 'student') {
        registrationData = {
          ...registrationData,
          class: formData.class,
          stream: formData.stream,
          targetExam: formData.targetExam,
          preferredSubjects: formData.preferredSubjects.split(',').map(subject => subject.trim()).filter(subject => subject),
          learningGoals: formData.learningGoals
        };
      } else if (type === 'mentor') {
        registrationData = {
          ...registrationData,
          specialization: formData.specialization,
          experience: formData.experience,
          qualifications: formData.qualifications,
          teachingStyle: formData.teachingStyle,
          telegramId: formData.telegramId,
          whatsapp: formData.whatsapp,
          linkedin: formData.linkedin,
          website: formData.website,
          achievements: formData.achievements ? formData.achievements.split(',').map(a => a.trim()).filter(a => a) : [],
          currentStatus: formData.currentStatus
        };
      }
      
      // Call backend to register user with role
      const registerUrl = `${API_ENDPOINTS.REGISTER}/${type}`;
      await axios.post(registerUrl, registrationData);
      setSuccess('Account created successfully! Redirecting...');
      
      // Get user data and redirect
      const loginResponse = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { 
        googleIdToken: token 
      });
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      
      // Dispatch custom event to notify navbar of auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate required fields before proceeding
    if (!validateRequiredFields()) {
      setLoading(false);
      return;
    }
    
    try {
      // Prepare registration data based on user type
      let registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio
      };
      
      if (type === 'student') {
        registrationData = {
          ...registrationData,
          class: formData.class,
          stream: formData.stream,
          targetExam: formData.targetExam,
          preferredSubjects: formData.preferredSubjects.split(',').map(subject => subject.trim()).filter(subject => subject),
          learningGoals: formData.learningGoals
        };
      } else if (type === 'mentor') {
        registrationData = {
          ...registrationData,
          specialization: formData.specialization,
          experience: formData.experience,
          qualifications: formData.qualifications,
          teachingStyle: formData.teachingStyle,
          telegramId: formData.telegramId,
          whatsapp: formData.whatsapp,
          linkedin: formData.linkedin,
          website: formData.website,
          achievements: formData.achievements ? formData.achievements.split(',').map(a => a.trim()).filter(a => a) : [],
          currentStatus: formData.currentStatus
        };
      }
      
      // Call backend to register user with role
      const registerUrl = `${API_ENDPOINTS.REGISTER}/${type}`;
      await axios.post(registerUrl, registrationData);
      setSuccess('Account created successfully! Logging you in...');

      // Automatically log in the user
      const loginResponse = await axios.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect to dashboard based on role
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
      }, 1500);
    } catch (err) {
      console.error('Email registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

  if (!authChecked) return null;

  return (
    <div className="enroll-container">
      <div className="enroll-card">
        <div className="enroll-header">
          <h1>{getTitle()}</h1>
          <p>Join KIRAN and start your learning journey</p>
        </div>

        {/* Instruction message for registration */}
        <div className="enroll-instructions" style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#0c4a6e'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>📝 How to Register:</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            Choose your preferred registration method below:
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            <li><strong>Google Registration:</strong> First connect your Google account, then fill in your details and click "Enroll as Student/Mentor"</li>
            <li><strong>Email Registration:</strong> Fill all fields including email/password, then click "Enroll as Student/Mentor"</li>
          </ul>
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

        <form className="enroll-form" onSubmit={handleEmailRegistration}>
          {/* Registration Mode Selection */}
          <div className="registration-mode-selector" style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setRegistrationMode('google')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: registrationMode === 'google' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: registrationMode === 'google' ? '#eff6ff' : '#ffffff',
                color: registrationMode === 'google' ? '#1d4ed8' : '#64748b',
                fontWeight: registrationMode === 'google' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => setRegistrationMode('email')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: registrationMode === 'email' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: registrationMode === 'email' ? '#eff6ff' : '#ffffff',
                color: registrationMode === 'email' ? '#1d4ed8' : '#64748b',
                fontWeight: registrationMode === 'email' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Use Email & Password
            </button>
          </div>

          {/* Google Button - only show when Google mode is selected */}
          {registrationMode === 'google' && (
            <>
              {!googleSignInComplete ? (
                <>
                  <button 
                    onClick={handleGoogleRegistration} 
                    className="google-enroll-btn"
                    disabled={loading}
                    type="button"
                  >
                    {loading ? 'Connecting to Google...' : (
                      <>
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                        Continue with Google
                      </>
                    )}
                  </button>

                  <div className="enroll-separator">
                    <span>First connect your Google account, then fill in your details</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    backgroundColor: '#d1fae5',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
                    <span style={{ color: '#065f46', fontWeight: '500' }}>
                      Connected to Google: {googleUser?.email}
                    </span>
                  </div>
                </>
              )}
            </>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name" className="required">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email and Password fields - enabled/disabled based on mode */}
            <div className="form-group">
              <label htmlFor="email" className={registrationMode === 'email' ? 'required' : ''}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={registrationMode === 'google' && googleSignInComplete}
                required={registrationMode === 'email'}
                style={{
                  backgroundColor: registrationMode === 'google' && googleSignInComplete ? '#f3f4f6' : '#f8fafc'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className={registrationMode === 'email' ? 'required' : ''}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={registrationMode === 'google' && googleSignInComplete ? 'Set by Google account' : 'Enter your password (min 6 characters)'}
                disabled={registrationMode === 'google' && googleSignInComplete}
                required={registrationMode === 'email'}
                style={{
                  backgroundColor: registrationMode === 'google' && googleSignInComplete ? '#f3f4f6' : '#f8fafc'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className={registrationMode === 'email' ? 'required' : ''}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={registrationMode === 'google' && googleSignInComplete ? 'Set by Google account' : 'Confirm your password'}
                disabled={registrationMode === 'google' && googleSignInComplete}
                required={registrationMode === 'email'}
                style={{
                  backgroundColor: registrationMode === 'google' && googleSignInComplete ? '#f3f4f6' : '#f8fafc'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="required">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="required">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="required">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="4"
                required
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {type === 'student' && (
            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-group">
                <label htmlFor="class" className="required">Class</label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="dropper">Dropper</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stream" className="required">Stream</label>
                <select
                  id="stream"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Stream</option>
                  <option value="PCM">PCM (Physics, Chemistry, Mathematics)</option>
                  <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetExam" className="required">Target Exam</label>
                <select
                  id="targetExam"
                  name="targetExam"
                  value={formData.targetExam}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Target Exam</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="NEET">NEET</option>
                  <option value="CUET">CUET</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferredSubjects" className="required">Preferred Subjects</label>
                <input
                  type="text"
                  id="preferredSubjects"
                  name="preferredSubjects"
                  value={formData.preferredSubjects}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="learningGoals" className="required">Learning Goals</label>
                <textarea
                  id="learningGoals"
                  name="learningGoals"
                  value={formData.learningGoals}
                  onChange={handleChange}
                  placeholder="What are your learning goals?"
                  rows="4"
                  required
                />
              </div>
            </div>
          )}

          {/* Mentor-specific fields */}
          {type === 'mentor' && (
            <div className="form-section">
              <h3>Professional Information</h3>
              <div className="form-group">
                <label htmlFor="specialization" className="required">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics, Physics, Computer Science"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience" className="required">Years of Experience</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5 years of teaching experience"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualifications" className="required">Qualifications</label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="Your educational qualifications and certifications"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teachingStyle" className="required">Teaching Style</label>
                <textarea
                  id="teachingStyle"
                  name="teachingStyle"
                  value={formData.teachingStyle}
                  onChange={handleChange}
                  placeholder="Describe your teaching approach and methodology"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="achievements" className="required">Achievements</label>
                <textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  placeholder="List your achievements, awards, and recognitions"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentStatus">What are you currently doing? <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  id="currentStatus"
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                  placeholder="e.g. BTech at IIT BHU, Software Engineer at Google, etc."
                  required
                />
              </div>

              <h3>Contact Information</h3>
              <div className="form-group">
                <label htmlFor="telegramId">Telegram ID</label>
                <input
                  type="text"
                  id="telegramId"
                  name="telegramId"
                  value={formData.telegramId}
                  onChange={handleChange}
                  placeholder="Your Telegram username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp Number</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Your WhatsApp number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="Your LinkedIn profile URL"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Your personal website URL"
                />
              </div>
            </div>
          )}
        </form>

        {/* Email Registration Button - only show when email mode is selected */}
        {registrationMode === 'email' && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={handleEmailRegistration}
              disabled={loading}
              style={{
                backgroundColor: type === 'student' ? '#10b981' : '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? 'Creating Account...' : `Enroll as ${type === 'student' ? 'Student' : 'Mentor'}`}
            </button>
          </div>
        )}

        {/* Google Registration Button - only show when Google sign-in is complete */}
        {registrationMode === 'google' && googleSignInComplete && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={handleGoogleEnrollment}
              disabled={loading}
              style={{
                backgroundColor: type === 'student' ? '#10b981' : '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? 'Creating Account...' : `Enroll as ${type === 'student' ? 'Student' : 'Mentor'}`}
            </button>
          </div>
        )}

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
