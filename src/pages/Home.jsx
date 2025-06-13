import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home-page.css'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-heading">
            <span>Connecting Students</span>
            <span>with the Right Mentors</span>
          </h1>
          <p className="hero-text">
            Join our mentorship program and get personalized guidance for your academic journey. Whether you're a student looking for guidance or a mentor ready to make a difference, we have a place for you.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/enroll/student" className="hero-button primary">Enroll as Student</Link>
            <Link to="/enroll/mentor" className="hero-button secondary">Become a Mentor</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2>
              <span>Why Choose</span> <span className="brand-text">KIRAN</span>?
            </h2>
            <p>
              Our mentorship program is designed to help you achieve your academic goals through personalized guidance and support.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" style={{ '--i': 0 }}>
              <div className="feature-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Personalized Guidance</h3>
              <p>
                Get one-on-one mentorship tailored to your needs and learning style.
              </p>
            </div>
            
            <div className="feature-card" style={{ '--i': 1 }}>
              <div className="feature-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>Expert Mentors</h3>
              <p>
                Learn from experienced professionals who have been in your shoes.
              </p>
            </div>
            
            <div className="feature-card" style={{ '--i': 2 }}>
              <div className="feature-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <h3>Resource Access</h3>
              <p>
                Access exclusive study materials and resources to enhance your learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;