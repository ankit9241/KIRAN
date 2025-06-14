import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FolderList from '../components/FolderList';
import SubjectList from '../components/SubjectList';
import ResourceList from '../components/ResourceList';
import { FaFolder } from 'react-icons/fa';

const folderData = [
  {
    id: 1,
    name: 'Scratch Series',
    subjects: [
      {
        id: 1,
        name: 'Physics',
        resources: [
          {
            id: 1,
            title: 'Basic Concepts of Physics',
            type: 'PDF',
            description: 'Introduction to physics concepts',
            url: '#'
          },
          {
            id: 2,
            title: 'Physics Video Lectures',
            type: 'Video',
            description: 'Video explanations of physics topics',
            url: '#'
          }
        ]
      },
      {
        id: 2,
        name: 'Chemistry',
        resources: [
          {
            id: 1,
            title: 'Chemistry Study Material',
            type: 'PDF',
            description: 'Detailed chemistry study guide',
            url: '#'
          },
          {
            id: 2,
            title: 'Chemistry Lab Videos',
            type: 'Video',
            description: 'Laboratory experiment demonstrations',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'NCERT Booster',
    subjects: [
      {
        id: 3,
        name: 'Math',
        resources: [
          {
            id: 1,
            title: 'NCERT Math Solutions',
            type: 'PDF',
            description: 'Solutions for NCERT exercises',
            url: '#'
          },
          {
            id: 2,
            title: 'Math Practice Tests',
            type: 'PDF',
            description: 'Practice tests with solutions',
            url: '#'
          }
        ]
      },
      {
        id: 4,
        name: 'Biology',
        resources: [
          {
            id: 1,
            title: 'Biology Notes',
            type: 'Notes',
            description: 'Detailed biology concepts',
            url: '#'
          },
          {
            id: 2,
            title: 'Biology Animations',
            type: 'Video',
            description: '3D animations of biological processes',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Boards Special',
    subjects: [
      {
        id: 5,
        name: 'Physics',
        resources: [
          {
            id: 1,
            title: 'Boards Physics Guide',
            type: 'PDF',
            description: 'Board exam preparation guide',
            url: '#'
          },
          {
            id: 2,
            title: 'Physics Practice Papers',
            type: 'PDF',
            description: 'Previous year papers with solutions',
            url: '#'
          }
        ]
      },
      {
        id: 6,
        name: 'Chemistry',
        resources: [
          {
            id: 1,
            title: 'Chemistry Board Guide',
            type: 'PDF',
            description: 'Board exam preparation guide',
            url: '#'
          },
          {
            id: 2,
            title: 'Chemistry Practice Papers',
            type: 'PDF',
            description: 'Previous year papers with solutions',
            url: '#'
          }
        ]
      }
    ]
  }
];

const StudyMaterial = () => {
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);

  // Get current folder and subject
  const currentFolder = folderData.find(folder => folder.id === activeFolder);
  const currentSubject = currentFolder?.subjects.find(subject => subject.id === activeSubject);

  return (
    <div className="study-material-page">
      <div className="study-material-header">
        <h1>Study Materials</h1>
        <p className="study-material-description">
          Access comprehensive study materials organized by folders and subjects
        </p>
      </div>
      <div className="study-material-grid">
        <div className="folder-list-container">
          <FolderList
            folders={folderData}
            activeFolder={activeFolder}
            onFolderClick={setActiveFolder}
          />
        </div>
        <div className="resource-container">
          <div className="subject-list">
            {activeFolder && (
              <div className="subject-header">
                <h3>Subjects</h3>
              </div>
            )}
            {activeFolder && (
              <div className="subject-items">
                {currentFolder?.subjects.map(subject => (
                  <button
                    key={subject.id}
                    className={`subject-item ${activeSubject === subject.id ? 'active' : ''}`}
                    onClick={() => setActiveSubject(subject.id)}
                  >
                    <FaFolder className="subject-icon" />
                    <span className="subject-name">{subject.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {activeSubject && currentSubject && (
            <div className="resources-section">
              <ResourceList
                resources={currentSubject.resources}
                subjectName={currentSubject.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterial;
