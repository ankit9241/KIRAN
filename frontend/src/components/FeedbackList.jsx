import React from 'react';

const FeedbackList = ({ feedback }) => {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <h3>No Feedback Yet</h3>
        <p>Your mentors haven't provided any feedback yet. They will share their insights here once they review your progress.</p>
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <h2>Mentor Feedback</h2>
      <div className="feedback-list">
        {feedback.map(feedbackItem => (
          <div key={feedbackItem._id} className="feedback-card">
            <div className="feedback-header">
              <div className="mentor-info">
                <h4>{feedbackItem.mentor.name}</h4>
                <span className="feedback-date">
                  {new Date(feedbackItem.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="rating">
                {[...Array(5)].map((_, index) => (
                  <span 
                    key={index} 
                    className={`star ${index < feedbackItem.rating ? 'filled' : 'empty'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-text">({feedbackItem.rating}/5)</span>
              </div>
            </div>
            <div className="feedback-content">
              <p>{feedbackItem.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
