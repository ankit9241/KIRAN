import React, { useState } from 'react';

const MentorList = ({ mentors }) => {
  const [selectedMentor, setSelectedMentor] = useState(null);

  if (!mentors || mentors.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👨‍🏫</div>
        <h3>No Mentors Available</h3>
        <p>There are no mentors available at the moment. Please check back later.</p>
      </div>
    );
  }

  const handleContactClick = (contactType, value) => {
    if (!value) return;
    
    switch (contactType) {
      case 'email':
        // Open Gmail compose window instead of default mailto
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(value)}`;
        window.open(gmailUrl, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${value.replace(/\D/g, '')}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/${value.replace('@', '')}`, '_blank');
        break;
      case 'linkedin':
        window.open(value, '_blank');
        break;
      case 'website':
        window.open(value, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="mentors-section">
      <div className="section-header">
        <h2>Available Mentors</h2>
        <p>Connect with our expert mentors for guidance and support</p>
      </div>
      
      <div className="mentors-grid">
        {mentors.map(mentor => (
          <div key={mentor._id} className="mentor-card">
            <div className="mentor-header">
              <div className="mentor-avatar">
                {mentor.name.charAt(0).toUpperCase()}
              </div>
              <div className="mentor-info">
                <h3 className="mentor-name">{mentor.name}</h3>
                <p className="mentor-specialization">{mentor.specialization}</p>
                <div className="mentor-subjects">
                  {mentor.subjectsTaught && mentor.subjectsTaught.map((subject, index) => (
                    <span key={index} className="subject-tag">{subject}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mentor-details">
              {mentor.bio && (
                <p className="mentor-bio">{mentor.bio}</p>
              )}
              
              <div className="mentor-experience">
                <span className="experience-badge">
                  <i className="fas fa-clock"></i>
                  {mentor.experience} years experience
                </span>
                {mentor.qualifications && (
                  <span className="qualification-badge">
                    <i className="fas fa-graduation-cap"></i>
                    {mentor.qualifications}
                  </span>
                )}
              </div>
            </div>

            <div className="mentor-contact">
              <h4>Contact Information</h4>
              <div className="contact-grid">
                {mentor.email && (
                  <button 
                    className="contact-btn email"
                    onClick={() => handleContactClick('email', mentor.email)}
                    title="Send Email"
                  >
                    <i className="fas fa-envelope"></i>
                    <span>{mentor.email}</span>
                  </button>
                )}
                
                {mentor.phone && (
                  <button 
                    className="contact-btn phone"
                    onClick={() => handleContactClick('phone', mentor.phone)}
                    title="Call Phone"
                  >
                    <i className="fas fa-phone"></i>
                    <span>{mentor.phone}</span>
                  </button>
                )}
                
                {mentor.whatsapp && (
                  <button 
                    className="contact-btn whatsapp"
                    onClick={() => handleContactClick('whatsapp', mentor.whatsapp)}
                    title="Send WhatsApp Message"
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span>{mentor.whatsapp}</span>
                  </button>
                )}
                
                {mentor.telegramId && (
                  <button 
                    className="contact-btn telegram"
                    onClick={() => handleContactClick('telegram', mentor.telegramId)}
                    title="Send Telegram Message"
                  >
                    <i className="fab fa-telegram"></i>
                    <span>@{mentor.telegramId}</span>
                  </button>
                )}
                
                {mentor.linkedin && (
                  <button 
                    className="contact-btn linkedin"
                    onClick={() => handleContactClick('linkedin', mentor.linkedin)}
                    title="View LinkedIn Profile"
                  >
                    <i className="fab fa-linkedin"></i>
                    <span>LinkedIn Profile</span>
                  </button>
                )}
                
                {mentor.website && (
                  <button 
                    className="contact-btn website"
                    onClick={() => handleContactClick('website', mentor.website)}
                    title="Visit Website"
                  >
                    <i className="fas fa-globe"></i>
                    <span>Visit Website</span>
                  </button>
                )}
              </div>
            </div>

            {mentor.teachingStyle && (
              <div className="mentor-teaching-style">
                <h4>Teaching Style</h4>
                <p>{mentor.teachingStyle}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorList;
