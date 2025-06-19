import React from 'react';
import { FaFilePdf, FaVideo, FaFile, FaDownload } from 'react-icons/fa';

const ResourceList = ({ resources, subjectName }) => {
  const getResourceIcon = (type) => {
    const iconMap = {
      PDF: FaFilePdf,
      Video: FaVideo,
      Notes: FaFile
    };
    
    const Icon = iconMap[type] || FaFile;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="resource-grid">
      {resources.map((resource) => (
        <div key={resource.id} className="resource-card">
          <div className="resource-card-content">
            <div className="resource-icon">
              {getResourceIcon(resource.type)}
            </div>
            <div className="resource-details">
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
            </div>
          </div>
          <div className="resource-actions">
            <button className="download-button">
              <FaDownload className="download-icon" />
              <span>Download</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;
