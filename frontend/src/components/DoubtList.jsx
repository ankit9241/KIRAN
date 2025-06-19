import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/doubts/${doubtId}`, {
          headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:5000/api/doubts/${editingDoubt._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/doubts', {
        title: doubtTitle,
        description: newDoubt,
        subject: doubtSubject
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

      {filteredDoubts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3>No Doubts Yet</h3>
          <p>You haven't asked any questions yet. Use the form below to ask your first doubt!</p>
        </div>
      ) : (
        <div className="doubt-history-section">
          <div className="section-header">
            <h3>📚 Doubt History ({filteredDoubts.length})</h3>
            <p>Click on any doubt to view details and mentor responses</p>
          </div>
          <div className="doubt-list">
            {filteredDoubts.map(doubt => {
              const isExpanded = expandedDoubts.has(doubt._id);
              const hasResponse = doubt.mentorResponse;
              
              return (
                <div key={doubt._id} className={`doubt-card ${hasResponse ? 'has-response' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  <div className="doubt-header" onClick={() => toggleDoubtExpansion(doubt._id)}>
                    <div className="doubt-type-badge" style={{ 
                      backgroundColor: doubt.subject === 'Mathematics' ? 'var(--primary-color)' : 
                                     doubt.subject === 'Physics' ? 'var(--warning-color)' :
                                     doubt.subject === 'Chemistry' ? 'var(--success-color)' : 'var(--primary-color)',
                      color: 'white'
                    }}>
                      {doubt.subject}
                    </div>
                    
                    <div className="doubt-summary">
                      <h4 className="doubt-title">{doubt.title}</h4>
                      <div className="doubt-meta">
                        <span className="doubt-date">{new Date(doubt.createdAt).toLocaleDateString()}</span>
                        <span className="doubt-status">Status: {doubt.status}</span>
                        {doubt.mentor && <span className="doubt-mentor">Mentor: {doubt.mentor.name}</span>}
                        {hasResponse && <span className="response-indicator">📝 Has Response</span>}
                      </div>
                    </div>
                    
                    <div className="doubt-actions">
                      <div className={`doubt-status-badge ${doubt.status.toLowerCase()}`}>
                        {doubt.status}
                      </div>
                      
                      {/* 3-dot menu for doubt actions */}
                      <div className="doubt-menu">
                        <button 
                          className="menu-btn"
                          onClick={(e) => toggleMenu(doubt._id, e)}
                          onBlur={() => setTimeout(closeMenu, 150)}
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        
                        {activeMenu === doubt._id && (
                          <div className="menu-dropdown">
                            {doubt.status === 'pending' && (
                              <button 
                                className="menu-item edit"
                                onClick={() => handleEditDoubt(doubt)}
                              >
                                <i className="fas fa-edit"></i>
                                Edit Doubt
                              </button>
                            )}
                            {doubt.status === 'pending' && (
                              <button 
                                className="menu-item delete"
                                onClick={() => handleDeleteDoubt(doubt._id)}
                              >
                                <i className="fas fa-trash"></i>
                                Delete Doubt
                              </button>
                            )}
                            {doubt.status !== 'pending' && (
                              <span className="menu-item disabled">
                                <i className="fas fa-lock"></i>
                                Cannot edit assigned doubts
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button className="expand-btn">
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="doubt-details">
                      <div className="doubt-content">
                        <h5>Your Question:</h5>
                        <p className="doubt-text">{doubt.description}</p>
                        
                        {/* Mentor Response Section */}
                        {hasResponse && (
                          <div className="mentor-response-section">
                            <div className="response-header">
                              <h5>📝 Mentor's Response</h5>
                              <span className="response-date">
                                {new Date(doubt.responseDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="response-content">
                              <p>{doubt.mentorResponse}</p>
                            </div>
                            
                            {/* Uploaded Documents */}
                            {doubt.uploadedDocuments && doubt.uploadedDocuments.length > 0 && (
                              <div className="response-documents">
                                <h6>📎 Attached Documents:</h6>
                                <div className="document-list">
                                  {doubt.uploadedDocuments.map((doc, index) => (
                                    <a 
                                      key={index}
                                      href={`http://localhost:5000${doc.filePath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="document-link"
                                    >
                                      <i className="fas fa-file"></i>
                                      {doc.originalName}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <div className="modal-content edit-modal">
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
