import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/enroll.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Enroll = () => {
  const { type } = useParams();
  const [formData, setFormData] = useState(type === 'mentor' ? {
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualifications: '',
    teachingStyle: '',
    phone: '',
    telegramId: '',
    whatsapp: '',
    address: '',
    linkedin: '',
    website: '',
    bio: '',
    achievements: '',
    subjectsTaught: [],
    password: '',
    confirmPassword: '',
    profilePicture: ''
  } : type === 'admin' ? {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  } : {
    name: '',
    email: '',
    class: '',
    stream: '',
    targetExam: '',
    preferredSubjects: [],
    learningGoals: '',
    password: '',
    confirmPassword: '',
    profilePicture: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [googleIdToken, setGoogleIdToken] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'preferredSubjects') {
      setFormData(prev => ({
        ...prev,
        preferredSubjects: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferredSubjects: checked
        ? [...prev.preferredSubjects, name]
        : prev.preferredSubjects.filter(subj => subj !== name)
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      setGoogleUser({
        name: user.displayName,
        email: user.email,
        picture: user.photoURL
      });
      setGoogleIdToken(token);
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        profilePicture: user.photoURL || ''
      }));
    } catch (error) {
      setSubmissionStatus({ type: 'error', message: 'Google login failed. Please try again or use email sign up.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!googleIdToken && formData.password !== formData.confirmPassword) {
      setSubmissionStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    const requestBody = {
      ...formData,
      role: type === 'mentor' ? 'mentor' : type === 'admin' ? 'admin' : 'student',
      subjectsTaught: type === 'mentor' ? [formData.specialization] : undefined,
      googleIdToken: googleIdToken || undefined
    };
    try {
      const response = await fetch(`http://localhost:5000/api/auth/register/${type === 'mentor' ? 'mentor' : type === 'admin' ? 'admin' : 'student'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = type === 'mentor' ? '/mentor' : type === 'admin' ? '/admin' : '/student';
      } else {
        setSubmissionStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setSubmissionStatus({ type: 'error', message: 'Failed to create account. Please try again.' });
    }
  };

  return (
    <div className="enroll-page">
      <div className="enroll-header">
        <h1>Create Account</h1>
        <p>{type === 'mentor' ? 'Join as a Mentor' : type === 'admin' ? 'Join as an Admin' : 'Join as a Student'}</p>
      </div>
      
      <div className="enroll-container">
        <button className="enroll-google-btn" style={{marginBottom:'1.2rem', width: '100%'}} onClick={handleGoogleSignIn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width:24,marginRight:8}} />
          Sign up with Google
        </button>
        <form onSubmit={handleSubmit} className="enroll-form">
            <h3>Personal Information</h3>
            {googleUser && (
              <div className="google-profile-row">
                <img src={googleUser.picture} alt="Profile" className="google-profile-pic" />
                <span className="google-profile-name">{googleUser.name}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter your full name"
                disabled={!!googleUser}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="yourname@example.com"
                disabled={!!googleUser}
              />
          </div>

            {!googleUser && (
              <>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Create Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter a strong password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              </>
            )}

            {type === 'mentor' ? (
              <>
                <h3>Professional Information</h3>
                <div className="form-group">
                  <label htmlFor="specialization" className="form-label">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter your specialization (e.g., Physics, Chemistry)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">Experience (in years)</label>
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter your years of experience"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qualifications" className="form-label">Qualifications</label>
                  <input
                    type="text"
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter your qualifications"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teachingStyle" className="form-label">Teaching Style</label>
                  <input
                    type="text"
                    id="teachingStyle"
                    name="teachingStyle"
                    value={formData.teachingStyle}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Describe your teaching style"
                  />
                </div>

                <h3>Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telegramId" className="form-label">Telegram ID</label>
                  <input
                    type="text"
                    id="telegramId"
                    name="telegramId"
                    value={formData.telegramId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your Telegram username (without @)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp" className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your WhatsApp number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin" className="form-label">LinkedIn Profile</label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your LinkedIn profile URL"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website" className="form-label">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your website URL"
                  />
                </div>

                <h3>Additional Information</h3>
                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell us about yourself and your teaching philosophy..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="achievements" className="form-label">Achievements & Awards</label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="List your achievements, awards, certifications, etc."
                  />
                </div>
              </>
            ) : type === 'admin' ? (
              // Admin form - no additional fields needed, just name, email, password
              <></>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="class" className="form-label">Current Class</label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select your class</option>
                    <option value="10">10th Class</option>
                    <option value="11">11th Class</option>
                    <option value="12">12th Class</option>
                    <option value="dropper">Dropper</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stream" className="form-label">Stream</label>
                  <select
                    id="stream"
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select your stream</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="targetExam" className="form-label">Target Exam</label>
                  <select
                    id="targetExam"
                    name="targetExam"
                    value={formData.targetExam}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                  <option value="">Select target exam</option>
                  <option value="board">Board Exams</option>
                  <option value="jee">JEE</option>
                    <option value="neet">NEET</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Subjects</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="Physics"
                        checked={formData.preferredSubjects.includes('Physics')}
                        onChange={handleCheckboxChange}
                      />
                      Physics
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="Chemistry"
                        checked={formData.preferredSubjects.includes('Chemistry')}
                        onChange={handleCheckboxChange}
                      />
                      Chemistry
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="Mathematics"
                        checked={formData.preferredSubjects.includes('Mathematics')}
                        onChange={handleCheckboxChange}
                      />
                      Mathematics
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="Biology"
                        checked={formData.preferredSubjects.includes('Biology')}
                        onChange={handleCheckboxChange}
                      />
                      Biology
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="learningGoals" className="form-label">Learning Goals</label>
                  <textarea
                    id="learningGoals"
                    name="learningGoals"
                    value={formData.learningGoals}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    required
                    placeholder="Tell us about your learning goals..."
                  />
                </div>
              </>
            )}

            {submissionStatus && (
              <div className={`submission-status ${submissionStatus.type}`}>
                {submissionStatus.message}
              </div>
            )}

            <button type="submit" className="submit-button">
              {type === 'mentor' ? 'Register as Mentor' : type === 'admin' ? 'Register as Admin' : 'Register as Student'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Enroll;
