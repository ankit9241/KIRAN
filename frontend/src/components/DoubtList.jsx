import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const DoubtList = ({ doubts = [], onDoubtAdded }) => {
  const [selectedDoubtType, setSelectedDoubtType] = useState('All');
  const [newDoubt, setNewDoubt] = useState('');
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedDoubts, setExpandedDoubts] = useState(new Set());
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingDoubt, setEditingDoubt] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', subject: '' });
  const [expandedDoubtId, setExpandedDoubtId] = useState(null);

  const toggleDoubtExpansion = (doubtId) => {
    setExpandedDoubts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(doubtId)) {
        newSet.delete(doubtId);
      } else {
        newSet.add(doubtId);
      }
      return newSet;
    });
  };

  const toggleMenu = (doubtId, event) => {
    event.stopPropagation(); // Prevent doubt expansion when clicking menu
    setActiveMenu(activeMenu === doubtId ? null : doubtId);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const handleEditDoubt = (doubt) => {
    setEditingDoubt(doubt);
    setEditForm({
      title: doubt.title,
      description: doubt.description,
      subject: doubt.subject
    });
    setActiveMenu(null);
  };

  const handleDeleteDoubt = async (doubtId) => {
    if (window.confirm('Are you sure you want to delete this doubt? This action cannot be undone.')) {
      try {
        await axios.delete(API_ENDPOINTS.DOUBT_BY_ID(doubtId), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        
        // Remove from local state
        if (onDoubtAdded) {
          onDoubtAdded({ type: 'delete', doubtId });
        }
        
        alert('Doubt deleted successfully!');
      } catch (error) {
        console.error('Error deleting doubt:', error);
        alert('Failed to delete doubt. Please try again.');
      }
    }
    setActiveMenu(null);
  };

  const handleUpdateDoubt = async () => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.subject.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.patch(API_ENDPOINTS.DOUBT_BY_ID(editingDoubt._id), editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Update local state
      if (onDoubtAdded) {
        onDoubtAdded({ type: 'update', doubt: response.data });
      }

      setEditingDoubt(null);
      setEditForm({ title: '', description: '', subject: '' });
      alert('Doubt updated successfully!');
    } catch (error) {
      console.error('Error updating doubt:', error);
      alert('Failed to update doubt. Please try again.');
    }
  };

  const handleAddDoubt = async () => {
    if (!doubtTitle.trim() || !newDoubt.trim() || !doubtSubject.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(API_ENDPOINTS.DOUBTS, {
        title: doubtTitle,
        description: newDoubt,
        subject: doubtSubject
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Doubt submitted successfully!');
      setDoubtTitle('');
      setNewDoubt('');
      setDoubtSubject('');
      
      // Call the callback to refresh doubts list
      if (onDoubtAdded) {
        onDoubtAdded(response.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating doubt:', error);
      setError(error.response?.data?.message || 'Failed to submit doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoubts = (doubts || []).filter(doubt => 
    selectedDoubtType === 'All' || doubt.subject === selectedDoubtType
  );

  return (
    <div className="doubts-section">
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

      <div className="doubt-list premium-timeline">
      {filteredDoubts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3>No Doubts Yet</h3>
          <p>You haven't asked any questions yet. Use the form below to ask your first doubt!</p>
        </div>
      ) : (
          filteredDoubts.map(doubt => {
            const isExpanded = expandedDoubtId === doubt._id;
            const hasResponse = !!doubt.mentorResponse;
              return (
              <div
                key={doubt._id}
                className={`premium-doubt-card${isExpanded ? ' expanded' : ''}${hasResponse ? ' has-response' : ''}`}
                onClick={() => setExpandedDoubtId(isExpanded ? null : doubt._id)}
              >
                <div className="premium-doubt-header">
                  <div className="premium-doubt-dot" style={{ background: hasResponse ? '#10b981' : '#3b82f6' }} />
                  <div className="premium-doubt-main">
                    <div className="premium-doubt-title-row">
                      <span className="premium-doubt-title">{doubt.title}</span>
                      <span className={`premium-status-badge ${doubt.status.toLowerCase()}`}>{doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}</span>
                    </div>
                    <div className="premium-doubt-meta">
                      <span><i className="fas fa-calendar"></i> {new Date(doubt.createdAt).toLocaleDateString()}</span>
                      <span><i className="fas fa-book"></i> {doubt.subject}</span>
                      {doubt.mentor && <span><i className="fas fa-user-tie"></i> {doubt.mentor.name}</span>}
                      {hasResponse && <span className="premium-has-response"><i className="fas fa-check-circle"></i> Mentor Responded</span>}
                    </div>
                      </div>
                  <div className="premium-expand-icon">
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                          </div>
                      </div>
                {isExpanded && (
                  <div className="premium-doubt-details">
                    <div className="premium-question-bubble">
                      <div className="bubble-label">Your Question</div>
                      <div className="bubble-content">{doubt.description}</div>
                    </div>
                        {hasResponse && (
                      <div className="premium-response-bubble">
                        <div className="bubble-label"><i className="fas fa-user-tie"></i> Mentor's Response</div>
                        <div className="bubble-content">{doubt.mentorResponse}</div>
                        {doubt.responseDate && (
                          <div className="bubble-date">Responded: {new Date(doubt.responseDate).toLocaleDateString()}</div>
                        )}
                            {doubt.uploadedDocuments && doubt.uploadedDocuments.length > 0 && (
                          <div className="bubble-docs">
                            <div className="bubble-label"><i className="fas fa-paperclip"></i> Attachments</div>
                            <div className="bubble-doc-list">
                              {doubt.uploadedDocuments.map((doc, idx) => (
                                    <a 
                                  key={idx}
                                      href={API_ENDPOINTS.FILE_PATH(doc.filePath)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                  className="bubble-doc-link"
                                    >
                                  <i className="fas fa-file"></i> {doc.originalName}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
          })
        )}
        </div>

      <div className="add-doubt">
        <div className="form-header">
          <h3>Ask a New Doubt</h3>
          <p>Your doubt will be visible to all mentors who can help you</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="doubt-title">Doubt Title</label>
          <input
            id="doubt-title"
            type="text"
            value={doubtTitle}
            onChange={(e) => setDoubtTitle(e.target.value)}
            placeholder="Brief title for your doubt..."
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="doubt-subject">Subject</label>
          <select
            id="doubt-subject"
            value={doubtSubject}
            onChange={(e) => setDoubtSubject(e.target.value)}
          >
            <option value="">Select a subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="doubt-text">Your Doubt</label>
          <textarea
            id="doubt-text"
            value={newDoubt}
            onChange={(e) => setNewDoubt(e.target.value)}
            placeholder="Describe your doubt in detail..."
            rows="4"
          />
        </div>

        <button 
          onClick={handleAddDoubt}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? (
            <>
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Doubt
            </>
          )}
        </button>
      </div>

      {/* Edit Doubt Modal */}
      {editingDoubt && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal" style={{ marginTop: '120px', maxHeight: '60vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Edit Doubt</h3>
              <button className="close-btn" onClick={() => setEditingDoubt(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">Doubt Title</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your doubt..."
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-subject">Subject</label>
                <select
                  id="edit-subject"
                  value={editForm.subject}
                  onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <option value="">Select a subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Your Doubt</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your doubt in detail..."
                  rows="4"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditingDoubt(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdateDoubt}>
                Update Doubt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtList;
