import React from 'react';

const UserProfile = ({ user }) => {
  if (!user) return null;

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="profile-section">
      <h2>Profile Information</h2>
      <div className="profile-details">
        <p><strong>Class:</strong> {capitalizeFirstLetter(user.class)}</p>
        <p><strong>Stream:</strong> {capitalizeFirstLetter(user.stream)}</p>
        <p><strong>Target Exam:</strong> {user.targetExam?.toUpperCase()}</p>
        <p><strong>Preferred Subjects:</strong> {user.preferredSubjects.map(capitalizeFirstLetter).join(', ')}</p>
        {user.bio && <p><strong>Bio:</strong> {capitalizeFirstLetter(user.bio)}</p>}
        {user.achievements && user.achievements.length > 0 && (
          <div>
            <strong>Achievements:</strong>
            <ul>
              {user.achievements.map((achievement, index) => (
                <li key={index}>{capitalizeFirstLetter(achievement)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
