import React, { useState } from 'react';
import '../styles/resources.css';

const Resources = () => {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: 'Physics',
      resources: [
        {
          id: 1,
          title: 'Physics Notes - Part 1',
          type: 'PDF',
          url: '#',
          description: 'Comprehensive notes for physics concepts',
        },
        {
          id: 2,
          title: 'Physics Video Lectures',
          type: 'Video',
          url: '#',
          description: 'Video explanations of physics topics',
        },
      ],
    },
    {
      id: 2,
      name: 'Chemistry',
      resources: [
        {
          id: 1,
          title: 'Chemistry Study Material',
          type: 'PDF',
          url: '#',
          description: 'Detailed chemistry study guide',
        },
        {
          id: 2,
          title: 'Chemistry Lab Videos',
          type: 'Video',
          url: '#',
          description: 'Practical chemistry experiments',
        },
      ],
    },
    {
      id: 3,
      name: 'Mathematics',
      resources: [
        {
          id: 1,
          title: 'Math Formulas Handbook',
          type: 'PDF',
          url: '#',
          description: 'Collection of important math formulas',
        },
        {
          id: 2,
          title: 'Math Problem Solving',
          type: 'Video',
          url: '#',
          description: 'Step-by-step problem solving techniques',
        },
      ],
    },
  ]);

  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleDownload = (url) => {
    // In a real application, this would trigger the download
    console.log(`Downloading resource from ${url}`);
  };

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Study Resources</h1>
        <p>Access our collection of study materials organized by subject</p>
      </div>
      <div className="resources-container">
        <div className="section-header">
          <h3>Subjects</h3>
          <p>Browse resources by subject area</p>
        </div>
        
        {/* Subject Selection */}
        <div className="subject-buttons">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`subject-button ${selectedSubject === subject.id ? 'active' : ''}`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        {/* Resources List */}
        {selectedSubject && (
          <div>
            <div className="section-header">
              <h3>Resources</h3>
              <p>Available study materials</p>
            </div>
            <div className="space-y-4">
              {subjects.find((s) => s.id === selectedSubject).resources.map((resource) => (
                <div key={resource.id} className="resource-card">
                  <h4>{resource.title}</h4>
                  <span className="type">{resource.type}</span>
                  <p className="description">{resource.description}</p>
                  <button
                    onClick={() => handleDownload(resource.url)}
                    className="download-button"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
