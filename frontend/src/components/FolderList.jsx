import React, { useState } from 'react';
import { FaFolder, FaArrowRight, FaInbox } from 'react-icons/fa';

const FolderList = ({ folders, activeFolder, onFolderClick }) => {
  return (
    <div className="folder-list">
      <div className="folder-header">
        <h2>Study Material</h2>
      </div>
      <div className="folder-items">
        {folders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaInbox />
            </div>
            <h3>No Study Material Yet</h3>
            <p>Your mentor will create study material folders here.</p>
          </div>
        ) : (
          folders.map((folder) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default FolderList;
