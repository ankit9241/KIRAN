import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/enroll.css';

const Enroll = () => {
  const { type } = useParams();
  const [formData, setFormData] = useState(type === 'mentor' ? {
    name: '',
    email: '',
    subject: '',
    experience: '',
    qualifications: '',
    teachingStyle: '',
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
    confirmPassword: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setSubmissionStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    try {
      console.log('Submitting enrollment:', formData);
      setSubmissionStatus({ type: 'success', message: `Account created successfully!` });
      setFormData(type === 'mentor' ? {
        name: '',
        email: '',
        subject: '',
        experience: '',
        qualifications: '',
        teachingStyle: '',
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
        confirmPassword: ''
      });
    } catch (error) {
      setSubmissionStatus({ type: 'error', message: 'Failed to create account. Please try again.' });
    }
  };

  return (
    <div className="enroll-page">
      <div className="enroll-header">
        <h1>Create Account</h1>
        <p>{type === 'mentor' ? 'Join as a Mentor' : 'Join as a Student'}</p>
      </div>
      
      <div className="enroll-container">
        <form onSubmit={handleSubmit} className="enroll-form">
          <div className="form-section">
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Gmail Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="yourname@gmail.com"
              />
            </div>

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
                placeholder="Enter password"
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
                placeholder="Confirm password"
              />
            </div>

            {type === 'student' ? (
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
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="physics"
                        name="Physics"
                        checked={formData.preferredSubjects.includes('Physics')}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      Physics
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="chemistry"
                        name="Chemistry"
                        checked={formData.preferredSubjects.includes('Chemistry')}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      Chemistry
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="mathematics"
                        name="Mathematics"
                        checked={formData.preferredSubjects.includes('Mathematics')}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      Mathematics
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="biology"
                        name="Biology"
                        checked={formData.preferredSubjects.includes('Biology')}
                        onChange={handleCheckboxChange}
                        className="mr-2"
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
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject Expertise</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select your subject</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="biology">Biology</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">Teaching Experience</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    required
                    placeholder="Tell us about your teaching experience..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qualifications" className="form-label">Qualifications</label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    required
                    placeholder="Tell us about your qualifications..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teachingStyle" className="form-label">Teaching Style</label>
                  <textarea
                    id="teachingStyle"
                    name="teachingStyle"
                    value={formData.teachingStyle}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    required
                    placeholder="Describe your teaching style..."
                  />
                </div>
              </>
            )}

            {submissionStatus && (
              <div className={`submission-status ${submissionStatus.type}`}>
                {submissionStatus.message}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
            >
              {type === 'mentor' ? 'Join as Mentor' : 'Join as Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Enroll;
