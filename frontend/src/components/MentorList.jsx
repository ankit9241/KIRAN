import React, { useState } from 'react';
import '../styles/mentor-list-premium.css';

const MentorList = ({ mentors }) => {
  const [selectedMentors, setSelectedMentors] = useState(new Set());
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('experience');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (!mentors || mentors.length === 0) {
    return (
      <div className="mentors-premium-section">
        <div className="section-header-premium">
          <h2 className="enhanced-heading">Available Mentors</h2>
          <p>Connect with our expert mentors for guidance and support</p>
        </div>
        <div className="empty-state-premium">
          <div className="empty-state-icon-premium">👨‍🏫</div>
          <h3>No Mentors Available</h3>
          <p>There are no mentors available at the moment. Please check back later.</p>
        </div>
      </div>
    );
  }

  // Get unique specializations for filter
  const specializations = [...new Set(mentors.map(mentor => mentor.specialization))];

  // Filter and sort mentors
  const filteredAndSortedMentors = mentors
    .filter(mentor => filterSpecialization === 'all' || mentor.specialization === filterSpecialization)
    .sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'specialization':
          return a.specialization.localeCompare(b.specialization);
        default:
          return 0;
      }
    });

  // Enhanced filter stats - accurate real-time filtering
  const getFilterStats = () => {
    const mentorCount = filteredAndSortedMentors.length;
    let specializationCount;
    
    if (filterSpecialization === 'all') {
      specializationCount = specializations.length;
    } else {
      specializationCount = filteredAndSortedMentors.some(m => m.specialization === filterSpecialization) ? 1 : 0;
    }
    
    return { mentorCount, specializationCount };
  };

  // Multiple selection helper functions
  const toggleMentorSelection = (mentorId) => {
    const newSelectedMentors = new Set(selectedMentors);
    if (newSelectedMentors.has(mentorId)) {
      newSelectedMentors.delete(mentorId);
    } else {
      newSelectedMentors.add(mentorId);
    }
    setSelectedMentors(newSelectedMentors);
  };

  const isMentorSelected = (mentorId) => {
    return selectedMentors.has(mentorId);
  };

  const showAllDetails = () => {
    const allMentorIds = new Set(filteredAndSortedMentors.map(mentor => mentor._id));
    setSelectedMentors(allMentorIds);
  };

  const hideAllDetails = () => {
    setSelectedMentors(new Set());
  };

  const areAllMentorsSelected = () => {
    return filteredAndSortedMentors.length > 0 && 
           filteredAndSortedMentors.every(mentor => selectedMentors.has(mentor._id));
  };

  const getNoResultsMessage = () => {
    if (filterSpecialization === 'all') {
      return "No mentors found. Please check back later.";
    } else {
      return `No mentors found for "${filterSpecialization}". Try selecting "All Specializations" or a different specialization.`;
    }
  };

  const handleContactClick = (contactType, value, mentorName) => {
    if (!value) return;
    
    switch (contactType) {
      case 'email':
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(value)}&su=KIRAN%20Mentorship%20Request&body=Hello%20${mentorName},%0A%0AI%20found%20your%20profile%20on%20KIRAN%20and%20would%20like%20to%20connect%20with%20you%20for%20mentorship.%0A%0APlease%20let%20me%20know%20if%20you%20are%20available.%0A%0ABest%20regards`;
        window.open(gmailUrl, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`, '_blank');
        break;
      case 'whatsapp':
        const whatsappMessage = `Hello ${mentorName}, I found your profile on KIRAN and would like to connect with you for mentorship. Please let me know if you are available.`;
        const whatsappUrl = `https://wa.me/${value.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'telegram':
        const telegramMessage = `Hello ${mentorName}, I found your profile on KIRAN and would like to connect with you for mentorship. Please let me know if you are available.`;
        const telegramUrl = `https://t.me/${value.replace('@', '')}?text=${encodeURIComponent(telegramMessage)}`;
        window.open(telegramUrl, '_blank');
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

  const getExperienceLevel = (years) => {
    if (years >= 10) return { level: 'Expert', color: '#10B981', icon: '🏆' };
    if (years >= 5) return { level: 'Senior', color: '#3B82F6', icon: '⭐' };
    if (years >= 2) return { level: 'Intermediate', color: '#F59E0B', icon: '🌟' };
    return { level: 'Junior', color: '#6B7280', icon: '🌱' };
  };

  

  const filterStats = getFilterStats();

  return (
    <div className="mentors-premium-section">
      <div className="section-header-premium">
        <div className="header-content">
          <h2 className="enhanced-heading">Available Mentors</h2>
          <p>Connect with our expert mentors for personalized guidance and support</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{filterStats.mentorCount}</span>
            <span className="stat-label">Mentors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filterStats.specializationCount}</span>
            <span className="stat-label">Specializations</span>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="mentor-controls">
        <div className="filter-group">
          <label htmlFor="specialization-filter">
            Specialization: 
            {filterSpecialization !== 'all' && (
              <span className="current-filter"> ({filterSpecialization})</span>
            )}
          </label>
          <select 
            id="specialization-filter"
            value={filterSpecialization} 
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">
            Sort by: 
            <span className="current-sort">
              {sortBy === 'experience' && ' (Experience)'}
              {sortBy === 'name' && ' (Name)'}
              {sortBy === 'specialization' && ' (Specialization)'}
            </span>
          </label>
          <select 
            id="sort-by"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="experience">Experience (High to Low)</option>
            <option value="name">Name (A-Z)</option>
            <option value="specialization">Specialization</option>
          </select>
        </div>

        {/* New Bulk Action Buttons */}
        <div className="bulk-actions">
          <button 
            className="bulk-btn view-all-btn"
            onClick={showAllDetails}
            disabled={filteredAndSortedMentors.length === 0 || areAllMentorsSelected()}
            title="View all mentor details"
          >
            <i className="fas fa-eye"></i>
            View All Details
          </button>
          <button 
            className="bulk-btn hide-all-btn"
            onClick={hideAllDetails}
            disabled={selectedMentors.size === 0}
            title="Hide all mentor details"
          >
            <i className="fas fa-eye-slash"></i>
            Hide All Details
          </button>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <i className="fas fa-th"></i>
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Mentors Grid/List */}
      <div className={`mentors-container ${viewMode}`}>
        {filteredAndSortedMentors.map(mentor => {
          const experienceLevel = getExperienceLevel(mentor.experience);
          
          const isSelected = isMentorSelected(mentor._id);
          
          return (
            <div key={mentor._id} className={`mentor-card-premium ${isSelected ? 'selected' : ''}`}>
              {/* Premium Header */}
              <div className="mentor-header-premium">
                <div className="mentor-avatar-premium">
                  {mentor.profilePicture ? (
                    <img src={mentor.profilePicture} alt={mentor.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="mentor-info-premium">
                  <h3 className="mentor-name-premium">{mentor.name}</h3>
                  <p className="mentor-specialization-premium">{mentor.specialization}</p>
                  
                  <div className="experience-level">
                    <span className="level-text" style={{ color: experienceLevel.color }}>
                      {experienceLevel.level}
                    </span>
                    <span className="experience-years">({mentor.experience} years)</span>
                  </div>
                </div>

                <div className="mentor-actions">
                  <button 
                    className={`action-btn primary ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMentorSelection(mentor._id)}
                  >
                    {isSelected ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Mentor Details - Now with smooth animation */}
              <div className={`mentor-details-premium ${isSelected ? 'expanded' : ''}`}>
                {mentor.bio && (
                  <div className="mentor-bio-section">
                    <h4>About</h4>
                    <p>{mentor.bio}</p>
                  </div>
                )}

                {mentor.qualifications && (
                  <div className="qualifications-section">
                    <h4>Qualifications</h4>
                    <p>{mentor.qualifications}</p>
                  </div>
                )}

                {mentor.teachingStyle && (
                  <div className="teaching-style-section">
                    <h4>Teaching Style</h4>
                    <p>{mentor.teachingStyle}</p>
                  </div>
                )}

                {mentor.subjectsTaught && mentor.subjectsTaught.length > 0 && (
                  <div className="subjects-section">
                    <h4>Subjects Taught</h4>
                    <div className="subjects-grid">
                      {mentor.subjectsTaught.map((subject, index) => (
                        <span key={index} className="subject-badge">{subject}</span>
                      ))}
                    </div>
                  </div>
                )}

                {mentor.achievements && mentor.achievements.length > 0 && (
                  <div className="achievements-section">
                    <h4>Achievements</h4>
                    <div className="achievements-list">
                      {mentor.achievements.map((achievement, index) => (
                        <div key={index} className="achievement-item">
                          <span className="achievement-icon">🏆</span>
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="contact-section-premium">
                <h4>Get in Touch</h4>
                <div className="contact-grid-premium">
                  {mentor.email && (
                    <button 
                      className="contact-btn-premium email"
                      onClick={() => handleContactClick('email', mentor.email, mentor.name)}
                      title="Send Email"
                    >
                      <i className="fas fa-envelope"></i>
                      <span>Email</span>
                    </button>
                  )}
                  
                  {mentor.phone && (
                    <button 
                      className="contact-btn-premium phone"
                      onClick={() => handleContactClick('phone', mentor.phone, mentor.name)}
                      title="Call Phone"
                    >
                      <i className="fas fa-phone"></i>
                      <span>Call</span>
                    </button>
                  )}
                  
                  {mentor.whatsapp && (
                    <button 
                      className="contact-btn-premium whatsapp"
                      onClick={() => handleContactClick('whatsapp', mentor.whatsapp, mentor.name)}
                      title="Send WhatsApp Message"
                    >
                      <i className="fab fa-whatsapp"></i>
                      <span>WhatsApp</span>
                    </button>
                  )}
                  
                  {mentor.telegramId && (
                    <button 
                      className="contact-btn-premium telegram"
                      onClick={() => handleContactClick('telegram', mentor.telegramId, mentor.name)}
                      title="Send Telegram Message"
                    >
                      <i className="fab fa-telegram"></i>
                      <span>Telegram</span>
                    </button>
                  )}
                  
                  {mentor.linkedin && (
                    <button 
                      className="contact-btn-premium linkedin"
                      onClick={() => handleContactClick('linkedin', mentor.linkedin, mentor.name)}
                      title="View LinkedIn Profile"
                    >
                      <i className="fab fa-linkedin"></i>
                      <span>LinkedIn</span>
                    </button>
                  )}
                  
                  {mentor.website && (
                    <button 
                      className="contact-btn-premium website"
                      onClick={() => handleContactClick('website', mentor.website, mentor.name)}
                      title="Visit Website"
                    >
                      <i className="fas fa-globe"></i>
                      <span>Website</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced No Results Message */}
      {filteredAndSortedMentors.length === 0 && (
        <div className="no-results-premium">
          <div className="no-results-icon">🔍</div>
          <h3>No mentors found</h3>
          <p>{getNoResultsMessage()}</p>
          <button 
            className="reset-filters-btn"
            onClick={() => {
              setFilterSpecialization('all');
              setSortBy('experience');
              setSelectedMentors(new Set());
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorList;
