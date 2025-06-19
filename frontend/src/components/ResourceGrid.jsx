import React from 'react';

const ResourceGrid = ({ studyMaterials }) => {
  if (!studyMaterials || studyMaterials.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <h3>No Study Materials Available</h3>
        <p>Your mentors haven't uploaded any study materials yet. They will share resources here to help with your learning.</p>
      </div>
    );
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'mp4':
        return '🎥';
      case 'mp3':
        return '🎵';
      default:
        return '📁';
    }
  };

  return (
    <div className="resources-section">
      <h2>Study Materials</h2>
      <div className="resource-grid">
        {studyMaterials.map(material => (
          <div key={material._id} className="resource-card">
            <div className="resource-icon">
              {getFileIcon(material.originalName)}
            </div>
            <div className="resource-details">
              <h3>{material.title}</h3>
              <p className="resource-description">{material.description}</p>
              <p className="resource-file">{material.originalName}</p>
              <p className="resource-mentor">From: {material.uploadedBy.name}</p>
              <p className="resource-date">
                {new Date(material.createdAt).toLocaleDateString()}
              </p>
              <a 
                href={`http://localhost:5000/${material.filePath}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-btn"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceGrid;
