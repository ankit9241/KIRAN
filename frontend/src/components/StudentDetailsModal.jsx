import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/student-details-modal.css';
import LoadingSpinner from './LoadingSpinner';

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentDoubts, setStudentDoubts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDetails();
    }
  }, [isOpen, student]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch detailed student information
      const studentResponse = await axios.get(`http://localhost:5000/api/users/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentDetails(studentResponse.data);

      // Fetch student's doubts
      const doubtsResponse = await axios.get(`http://localhost:5000/api/doubts/student/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentDoubts(doubtsResponse.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) return <div className="modal-loading"><LoadingSpinner /></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Student Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading">Loading student details...</div>
        ) : (
          <div className="modal-body">
            {/* Basic Information */}
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{studentDetails?.name || student.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{studentDetails?.email || student.email}</span>
                </div>
                <div className="info-item">
                  <label>Class:</label>
                  <span>{studentDetails?.class || student.class}</span>
                </div>
                <div className="info-item">
                  <label>Stream:</label>
                  <span>{studentDetails?.stream || student.stream}</span>
                </div>
                <div className="info-item">
                  <label>Target Exam:</label>
                  <span>{studentDetails?.targetExam || student.targetExam}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{studentDetails?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="profile-section">
              <h3>Academic Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Preferred Subjects:</label>
                  <span>
                    {studentDetails?.preferredSubjects?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Learning Goals:</label>
                  <span>{studentDetails?.learningGoals || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {studentDetails?.achievements && studentDetails.achievements.length > 0 && (
              <div className="profile-section">
                <h3>Achievements</h3>
                <ul className="achievements-list">
                  {studentDetails.achievements.map((achievement, index) => (
                    <li key={index}>🏆 {achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bio */}
            {studentDetails?.bio && (
              <div className="profile-section">
                <h3>Bio</h3>
                <p className="bio-text">{studentDetails.bio}</p>
              </div>
            )}

            {/* Doubts History */}
            <div className="profile-section">
              <h3>Doubts History ({studentDoubts.length})</h3>
              {studentDoubts.length > 0 ? (
                <div className="doubts-list">
                  {studentDoubts.map(doubt => (
                    <div key={doubt._id} className="doubt-item">
                      <div className="doubt-header">
                        <span className="doubt-subject">{doubt.subject}</span>
                        <span className={`doubt-status ${doubt.status}`}>
                          {doubt.status}
                        </span>
                      </div>
                      <h4 className="doubt-title">{doubt.title}</h4>
                      <p className="doubt-description">{doubt.description}</p>
                      <div className="doubt-meta">
                        <span>Created: {new Date(doubt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-doubts">No doubts asked yet.</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="profile-section">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{studentDetails?.email || student.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{studentDetails?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{studentDetails?.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal; 