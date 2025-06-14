import React, { useState } from 'react';
import { FaFolder, FaArrowRight } from 'react-icons/fa';

const FolderList = ({ folders, activeFolder, onFolderClick }) => {
  return (
    <div className="folder-list">
      <div className="folder-header">
        <h2>Study Material</h2>
      </div>
      <div className="folder-items">
        {folders.map((folder) => (
          <div key={folder.id} className="folder-item">
            <button
              onClick={() => onFolderClick(folder.id)}
              className={`folder-button ${activeFolder === folder.id ? 'active' : ''}`}
            >
              <div className="folder-content">
                <div className="folder-icon">
                  <FaFolder />
                </div>
                <span className="folder-name">{folder.name}</span>
              </div>
              <div className="folder-arrow">
                <FaArrowRight className="folder-arrow-icon" />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
