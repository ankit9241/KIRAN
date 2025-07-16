import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/student-details-modal.css';

const EditProfileModal = ({ isOpen, onClose, userData, userType, onSaveSuccess }) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData) {
      setForm({ ...userData,
        preferredSubjects: Array.isArray(userData.preferredSubjects) ? userData.preferredSubjects.join(', ') : (userData.preferredSubjects || ''),
        achievements: Array.isArray(userData.achievements) ? userData.achievements.join(', ') : (userData.achievements || ''),
        subjectsTaught: Array.isArray(userData.subjectsTaught) ? userData.subjectsTaught.join(', ') : (userData.subjectsTaught || ''),
      });
    }
  }, [userData]);

  if (!isOpen) return null;

  // Debug log
  console.log('EditProfileModal rendered', { isOpen, userData });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Prepare fields
      let payload = { ...form };
      if (payload.preferredSubjects)
        payload.preferredSubjects = payload.preferredSubjects.split(',').map(s => s.trim()).filter(Boolean);
      if (payload.achievements)
        payload.achievements = payload.achievements.split(',').map(s => s.trim()).filter(Boolean);
      if (payload.subjectsTaught)
        payload.subjectsTaught = payload.subjectsTaught.split(',').map(s => s.trim()).filter(Boolean);
      // Remove empty/undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });
      // Only allow fields that backend accepts
      const allowedUpdates = [
        'name', 'email', 'phone', 'address', 'bio', 'achievements',
        'class', 'stream', 'targetExam', 'preferredSubjects', 'learningGoals',
        'specialization', 'experience', 'subjectsTaught', 'telegramId', 'whatsapp', 'linkedin', 'website',
        'teachingStyle', 'qualifications', 'profilePicture'
      ];
      Object.keys(payload).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete payload[key];
        }
      });
      console.log('PATCH payload:', payload);
      // PATCH to /api/users/me
      const res = await axios.patch('http://localhost:5000/api/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSaveSuccess && onSaveSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Fields for both mentor and student
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 500}}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-body" onSubmit={handleSave}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} type="email" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} />
          </div>
          {userType === 'student' && (
            <>
              <div className="form-group">
                <label>Learning Goals</label>
                <input name="learningGoals" value={form.learningGoals || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Preferred Subjects (comma separated)</label>
                <input name="preferredSubjects" value={form.preferredSubjects || ''} onChange={handleChange} />
              </div>
            </>
          )}
          {userType === 'mentor' && (
            <>
              <div className="form-group">
                <label>Specialization</label>
                <input name="specialization" value={form.specialization || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Experience</label>
                <input name="experience" value={form.experience || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Qualifications</label>
                <input name="qualifications" value={form.qualifications || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teaching Style</label>
                <input name="teachingStyle" value={form.teachingStyle || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Subjects Taught (comma separated)</label>
                <input name="subjectsTaught" value={form.subjectsTaught || ''} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Achievements (comma separated)</label>
            <input name="achievements" value={form.achievements || ''} onChange={handleChange} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 