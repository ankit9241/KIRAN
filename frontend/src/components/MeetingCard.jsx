import React from 'react';

const MeetingCard = ({ nextMeeting }) => {
  if (!nextMeeting) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <h3>No Upcoming Meetings</h3>
        <p>You don't have any scheduled meetings at the moment. Your upcoming meetings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="meetings-section">
      <h2>Upcoming Meeting</h2>
      <div className="meeting-card">
        <div className="meeting-info">
          <div className="meeting-item">
            <span className="meeting-label">Date:</span>
            <span className="meeting-value">{new Date(nextMeeting.date).toLocaleDateString()}</span>
          </div>
          <div className="meeting-item">
            <span className="meeting-label">Time:</span>
            <span className="meeting-value">{nextMeeting.time}</span>
          </div>
          <div className="meeting-item">
            <span className="meeting-label">Mentor:</span>
            <span className="meeting-value">{nextMeeting.mentor}</span>
          </div>
          <div className="meeting-item">
            <span className="meeting-label">Notes:</span>
            <span className="meeting-value">{nextMeeting.notes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
