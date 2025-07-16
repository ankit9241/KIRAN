import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFolder, FaPlus, FaBook, FaDownload, FaTrash, FaEdit, FaFile, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { useToast } from '../components/Toast.jsx';

const StudyMaterial = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isMentor, setIsMentor] = useState(null);
  const [mentorApprovalStatus, setMentorApprovalStatus] = useState(null);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Form states
  const [folderForm, setFolderForm] = useState({
    title: '',
    description: ''
  });
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    folderId: ''
  });
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: '',
    subject: '',
    folderId: '',
    file: null
  });

  const { showToast } = useToast();

  useEffect(() => {
    // Check user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        console.log('User role:', user.role);
        setIsAdmin(user.role === 'admin');
        setIsMentor(user.role === 'mentor');
        console.log('isAdmin set to:', user.role === 'admin');
        console.log('isMentor set to:', user.role === 'mentor');
        
        // If user is a mentor, check approval status
        if (user.role === 'mentor') {
          checkMentorApprovalStatus();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.log('No user data found in localStorage');
    }
  }, []);

  useEffect(() => {
    // Fetch data when user role is determined
    if (isAdmin !== null || isMentor !== null) {
      fetchAllFolders();
      fetchAllSubjects();
    }
  }, [isAdmin, isMentor]);

  useEffect(() => {
    // Refetch data when mentor approval status changes
    if (isMentor && mentorApprovalStatus !== null) {
      fetchAllFolders();
      fetchAllSubjects();
    }
  }, [mentorApprovalStatus]);

  useEffect(() => {
    if (selectedFolder && selectedSubject) {
      fetchSubjectMaterials(selectedFolder, selectedSubject);
    } else if (selectedFolder) {
      setMaterials([]);
    }
  }, [selectedFolder, selectedSubject]);

  // Debug useEffect to log data changes
  useEffect(() => {
    console.log('=== DATA DEBUG ===');
    console.log('Folders:', folders);
    console.log('All subjects:', allSubjects);
    console.log('Selected folder:', selectedFolder);
    console.log('Selected subject:', selectedSubject);
    console.log('Materials:', materials);
  }, [folders, allSubjects, selectedFolder, selectedSubject, materials]);

  const fetchAllFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      // Check if mentor is approved
      if (isMentor && mentorApprovalStatus !== 'approved') {
        console.log('Mentor not approved, showing limited access');
        setFolders([]);
        setLoading(false);
        return;
      }
      
      if (isAdmin || (isMentor && mentorApprovalStatus === 'approved')) {
        // Admin/Mentor can see all folders (only if mentor is approved)
        response = await axios.get(`${API_BASE_URL}/study-material/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter only folders and ensure it's an array
        const foldersArray = Array.isArray(response.data) 
          ? response.data.filter(item => item.type === 'folder')
          : [];
        setFolders(foldersArray);
        setLoading(false);
      } else {
        // Students see only public folders
        response = await axios.get(`${API_BASE_URL}/study-material/public/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Student folders response:', response.data);
        
        // For students, the response has a different structure
        const foldersArray = response.data.folders || [];
        console.log('Folders for students:', foldersArray);
        setFolders(foldersArray);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Failed to fetch folders');
      setFolders([]);
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      // Check if mentor is approved
      if (isMentor && mentorApprovalStatus !== 'approved') {
        console.log('Mentor not approved, showing limited access');
        setAllSubjects([]);
        return;
      }
      
      if (isAdmin || (isMentor && mentorApprovalStatus === 'approved')) {
        // Admin/Mentor can see all subjects (only if mentor is approved)
        response = await axios.get(`${API_BASE_URL}/study-material/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter only subjects and ensure it's an array
        const subjectsArray = Array.isArray(response.data) 
          ? response.data.filter(item => item.type === 'subject')
          : [];
        setAllSubjects(subjectsArray);
      } else {
        // Students see only public subjects
        response = await axios.get(`${API_BASE_URL}/study-material/public/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Student response:', response.data);
        
        // For students, the response has a different structure
        const subjectsArray = response.data.subjects || [];
        console.log('Subjects for students:', subjectsArray);
        setAllSubjects(subjectsArray);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setAllSubjects([]);
    }
  };

  const fetchSubjectMaterials = async (folderId, subject) => {
    try {
      console.log('Fetching materials for folder:', folderId, 'subject:', subject);
      const token = localStorage.getItem('token');
      let response;
      
      // Check if mentor is approved
      if (isMentor && mentorApprovalStatus !== 'approved') {
        console.log('Mentor not approved, showing limited access');
        setMaterials([]);
        return;
      }
      
      if (isAdmin || (isMentor && mentorApprovalStatus === 'approved')) {
        // Admin/Mentor can see all materials (only if mentor is approved)
        response = await axios.get(`${API_BASE_URL}/study-material/folder/${folderId}/subject/${encodeURIComponent(subject)}/materials`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Students see only public materials
        response = await axios.get(`${API_BASE_URL}/study-material/public/folder/${folderId}/subject/${encodeURIComponent(subject)}/materials`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      console.log('Materials received:', response.data);
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to fetch subject materials:', error);
      setMaterials([]);
    }
  };

  const getSubjectsForFolder = (folderId) => {
    // Get subjects for a specific folder from the allSubjects array
    console.log('Getting subjects for folder:', folderId);
    console.log('All subjects:', allSubjects);
    
    const subjectsForFolder = allSubjects.filter(subject => {
      console.log('Checking subject:', subject.title, 'folder:', subject.folder, 'against folderId:', folderId);
      console.log('Subject folder type:', typeof subject.folder, 'FolderId type:', typeof folderId);
      console.log('Are they equal?', subject.folder === folderId);
      console.log('String comparison:', String(subject.folder) === String(folderId));
      
      // Compare as strings to handle ObjectId comparison
      return String(subject.folder) === String(folderId);
    });
    
    console.log('Subjects for folder', folderId, ':', subjectsForFolder);
    return subjectsForFolder;
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Add subject field (same as title) to satisfy backend
      const folderData = {
        title: folderForm.title,
        description: folderForm.description,
        subject: folderForm.title
      };
      const response = await axios.post(`${API_BASE_URL}/study-material/folders`, folderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders([...folders, response.data]);
      setShowAddFolderModal(false);
      setFolderForm({ title: '', description: '' });
      showToast('Series created successfully', 'success');
    } catch (error) {
      console.error('Failed to create folder:', error);
      showToast('Failed to create folder', 'error');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const subjectData = {
        name: subjectForm.name,
        description: subjectForm.description,
        folderId: subjectForm.folderId
      };
      
      console.log('Sending subject data:', subjectData);
      
      const response = await axios.post(`${API_BASE_URL}/study-material/subjects`, subjectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Subject created successfully:', response.data);
      
      setShowAddSubjectModal(false);
      setSubjectForm({ name: '', description: '', folderId: '' });
      
      // Refresh both folders and subjects to show the new subject
      await fetchAllFolders();
      await fetchAllSubjects();
      showToast('Subject added successfully', 'success');
    } catch (error) {
      console.error('Failed to add subject:', error);
      console.error('Error response:', error.response?.data);
      showToast(`Failed to add subject: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      console.log('=== UPLOADING MATERIAL ===');
      console.log('Material form data:', materialForm);
      console.log('Selected folder:', selectedFolder);
      console.log('Selected subject:', selectedSubject);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', materialForm.title);
      formData.append('description', materialForm.description);
      formData.append('type', materialForm.type);
      formData.append('subject', materialForm.subject);
      formData.append('folderId', materialForm.folderId);
      if (materialForm.file) {
        formData.append('file', materialForm.file);
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      const response = await axios.post(`${API_BASE_URL}/study-material/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      setMaterials([...materials, response.data]);
      setShowAddMaterialModal(false);
      setMaterialForm({ title: '', description: '', type: '', subject: '', folderId: '', file: null });
      showToast('Material added successfully', 'success');
    } catch (error) {
      console.error('Failed to upload material:', error);
      showToast('Failed to upload material', 'error');
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/study-material/download/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
      showToast('Failed to download file', 'error');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    console.log('Attempting to delete material with ID:', materialId);
    
    if (!window.confirm('Are you sure you want to delete this material?')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Sending delete request for material:', materialId);
      console.log('API URL:', `${API_BASE_URL}/study-material/${materialId}`);
      console.log('Token exists:', !!token);
      
      const response = await axios.delete(`${API_BASE_URL}/study-material/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      
      // Remove the material from the local state
      const updatedMaterials = materials.filter(m => m._id !== materialId);
      console.log('Updated materials count:', updatedMaterials.length);
      setMaterials(updatedMaterials);
      
      console.log('Material deleted successfully');
    } catch (error) {
      console.error('Failed to delete material:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      showToast(`Failed to delete material: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its contents?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/study-material/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFolders(folders.filter(f => f._id !== folderId));
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
        setSelectedSubject(null);
        setMaterials([]);
      }
      showToast('Folder deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      showToast('Failed to delete folder', 'error');
    }
  };

  const toggleFolderExpansion = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const checkMentorApprovalStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users/mentor/approval-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMentorApprovalStatus(response.data.mentorApprovalStatus);
      console.log('Mentor approval status:', response.data.mentorApprovalStatus);
    } catch (error) {
      console.error('Error checking mentor approval status:', error);
      setMentorApprovalStatus('pending'); // Default to pending if error
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchAllFolders} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="study-material-page">
      {/* Show approval status message for unapproved mentors */}
      {isMentor && mentorApprovalStatus && mentorApprovalStatus !== 'approved' && (
        <div className={`approval-status ${mentorApprovalStatus}`}>
          {mentorApprovalStatus === 'pending' && (
            <div className="status-message pending">
              <i className="fas fa-clock"></i>
              <div>
                <h3>Account Pending Approval</h3>
                <p>Your mentor account is currently under review. You can view study materials but cannot create, upload, or manage content until your account is approved.</p>
              </div>
            </div>
          )}
          
          {mentorApprovalStatus === 'rejected' && (
            <div className="status-message rejected">
              <i className="fas fa-times-circle"></i>
              <div>
                <h3>Account Rejected</h3>
                <p>Your mentor application has been rejected. You can view study materials but cannot create, upload, or manage content.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="study-material-header">
        <h1>Study Materials</h1>
        <p className="study-material-description">
          Access comprehensive study materials organized by series and subjects
        </p>
        {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) && (
          <div className="admin-controls">
            <button className="admin-button" onClick={() => setShowAddFolderModal(true)}>
              <FaFolder className="button-icon" />
              Create New Series
            </button>
          </div>
        )}
      </div>

      <div className="study-material-grid">
        <div className="resource-container">
          <div className="subject-list">
            <div className="subject-header">
              <h3>Series & Subjects</h3>
            </div>
            <div className="subject-items">
              {folders && folders.length > 0 ? (
                folders.map((folder) => {
                  const isExpanded = expandedFolders.has(folder._id);
                  const subjects = getSubjectsForFolder(folder._id);
                  
                  return (
                    <div key={folder._id} className="folder-container">
                      <div
                        className={`subject-item ${selectedFolder === folder._id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedFolder(folder._id);
                          setSelectedSubject(null);
                          if (!isExpanded) {
                            toggleFolderExpansion(folder._id);
                          }
                        }}
                      >
                        <FaFolder className="subject-icon" />
                        <div className="folder-item-content">
                          <span className="folder-name">{folder.title}</span>
                          <small className="folder-subject">
                            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                          </small>
                        </div>
                        <div className="folder-actions">
                          <button
                            className="expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFolderExpansion(folder._id);
                            }}
                          >
                            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                          </button>
                          {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) && (
                            <button
                              className="delete-folder-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder._id);
                              }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="subjects-list">
                          {subjects.map((subject, index) => (
                            <div
                              key={subject._id || index}
                              className={`subject-sub-item ${selectedSubject === subject.subject ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedSubject(subject.subject);
                                setSelectedFolder(folder._id);
                              }}
                            >
                              <FaBook className="subject-sub-icon" />
                              <span>{subject.title}</span>
                            </div>
                          ))}
                          {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) && (
                            <div
                              className="add-subject-item"
                              onClick={() => {
                                setSubjectForm({ ...subjectForm, folderId: folder._id });
                                setShowAddSubjectModal(true);
                              }}
                            >
                              <FaPlus className="add-subject-icon" />
                              <span>Add Subject</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FaFolder className="folder-icon" />
                  </div>
                  <h3>No Series Yet</h3>
                  <p>{(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) ? 'Create series to organize your study materials.' : 'No study materials are available yet.'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="resources-section">
            {selectedFolder && selectedSubject ? (
              <div className="resources-content">
                <div className="resources-header">
                  <div className="folder-info">
                    <h2>{folders.find(f => f._id === selectedFolder)?.title}</h2>
                    <p className="folder-subject">
                      Subject: {selectedSubject}
                    </p>
                    <p className="folder-description">
                      {folders.find(f => f._id === selectedFolder)?.description}
                    </p>
                  </div>
                  {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) && (
                    <button 
                      className="add-material-btn"
                      style={{
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 1000
                      }}
                      onClick={() => {
                        console.log('=== ADD MATERIAL BUTTON CLICKED ===');
                        console.log('Selected folder:', selectedFolder);
                        console.log('Selected subject:', selectedSubject);
                        setMaterialForm({ 
                          ...materialForm, 
                          folderId: selectedFolder,
                          subject: selectedSubject
                        });
                        setShowAddMaterialModal(true);
                      }}
                      onMouseDown={(e) => {
                        console.log('Add Material button mouse down');
                      }}
                      onMouseUp={(e) => {
                        console.log('Add Material button mouse up');
                      }}
                    >
                      <FaPlus /> Add Material
                    </button>
                  )}
                </div>

                {/* Materials */}
                <div className="materials-section">
                  <h3>Materials for {selectedSubject}</h3>
                  {materials && materials.length > 0 ? (
                    <div className="materials-grid">
                      {materials.map((material) => (
                        <div key={material._id} className="material-card">
                          <div className="material-icon">
                            <FaFile />
                          </div>
                          <div className="material-info">
                            <h4>{material.title}</h4>
                            <p>{material.description}</p>
                            <small>By: {material.uploadedBy?.name || material.uploadedBy?.email || 'Unknown'}</small>
                            <small>Type: {material.type}</small>
                          </div>
                          <div className="material-actions">
                            {material.filePath && (
                              <button
                                className="download-btn"
                                onClick={() => handleDownload(material._id, material.originalName)}
                              >
                                <FaDownload />
                              </button>
                            )}
                            {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) && (
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteMaterial(material._id);
                                }}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-materials">
                      <p>No materials available for {selectedSubject}.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedFolder ? (
              <div className="no-resources-message">
                <div className="empty-state-content">
                  <div className="empty-state-icon">
                    <FaBook className="folder-icon" />
                  </div>
                  <h2>Select a Subject</h2>
                  <p className="empty-state-text">
                    Choose a subject from the left to view available study materials
                  </p>
                </div>
              </div>
            ) : (
              <div className="no-resources-message">
                <div className="empty-state-content">
                  <div className="empty-state-icon">
                    <FaFolder className="folder-icon" />
                  </div>
                  <h2>Welcome to Study Materials</h2>
                  <p className="empty-state-text">
                    {(isAdmin || (isMentor && mentorApprovalStatus === 'approved')) 
                      ? 'Select a series and subject from the left to view available study materials'
                      : 'Select a series and subject from the left to access study materials'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Series</h2>
            <form className="folder-form" onSubmit={handleAddFolder}>
              <div className="form-group">
                <label htmlFor="folderName">Series Name</label>
                <input
                  type="text"
                  id="folderName"
                  value={folderForm.title}
                  onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
                  placeholder="Enter series name (e.g., Scratch Series)"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="folderDescription">Description</label>
                <textarea
                  id="folderDescription"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  placeholder="Enter series description"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddFolderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Subject</h2>
            <form className="subject-form" onSubmit={handleAddSubject}>
              <div className="form-group">
                <label htmlFor="subjectName">Subject Name</label>
                <input
                  type="text"
                  id="subjectName"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="Enter subject name (e.g., Physics)"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subjectDescription">Description</label>
                <textarea
                  id="subjectDescription"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Enter subject description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="subjectFolder">Series</label>
                <select 
                  id="subjectFolder"
                  value={subjectForm.folderId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, folderId: e.target.value })}
                  required
                >
                  <option value="">Select series</option>
                  {folders && folders.map(folder => (
                    <option key={folder._id} value={folder._id}>{folder.title}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddSubjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Study Material</h2>
            <form className="material-form" onSubmit={handleAddMaterial}>
              <div className="form-group">
                <label htmlFor="materialTitle">Title</label>
                <input
                  type="text"
                  id="materialTitle"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="Enter material title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="materialType">Type</label>
                <select 
                  id="materialType" 
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="notes">Notes</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="materialSubject">Subject</label>
                <input
                  type="text"
                  id="materialSubject"
                  value={materialForm.subject}
                  onChange={(e) => setMaterialForm({ ...materialForm, subject: e.target.value })}
                  placeholder="Enter subject name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="materialFolder">Series</label>
                <select 
                  id="materialFolder"
                  value={materialForm.folderId}
                  onChange={(e) => setMaterialForm({ ...materialForm, folderId: e.target.value })}
                  required
                >
                  <option value="">Select series</option>
                  {folders && folders.map(folder => (
                    <option key={folder._id} value={folder._id}>{folder.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="materialDescription">Description</label>
                <textarea
                  id="materialDescription"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Enter material description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="materialFile">Upload File</label>
                <input
                  type="file"
                  id="materialFile"
                  onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                  accept=".pdf,.mp4,.doc,.docx,.txt"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddMaterialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;
