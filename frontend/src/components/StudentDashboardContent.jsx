import React from 'react';

const StudentDashboardContent = ({ user }) => {
  if (!user) return null;

  return (
    <div className="dashboard-content">
      <div className="progress-section">
        <h2>Study Progress</h2>
        {/* Add your progress tracking components here */}
      </div>

      <div className="doubts-section">
        <h2>My Doubts</h2>
        {/* Add your doubts tracking components here */}
      </div>

      <div className="resources-section">
        <h2>Study Resources</h2>
        {/* Add your resources components here */}
      </div>
    </div>
  );
};

export default StudentDashboardContent;
