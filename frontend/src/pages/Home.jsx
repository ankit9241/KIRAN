import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/home-page.css'

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Handle redirection to dashboard
  const redirectToDashboard = () => {
    if (token) {
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'mentor':
          navigate('/mentor');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    }
  };

  // Only redirect if coming from a different path
  useEffect(() => {
    if (token && window.location.pathname !== '/') {
      redirectToDashboard();
    }
  }, [token, user, navigate]);

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
            {!token && (
              <>
                <Link to="/enroll/student" className="hero-button primary">Enroll as Student</Link>
                <Link to="/enroll/mentor" className="hero-button secondary">Become a Mentor</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* What is KIRAN Section */}
      <section className="what-is-kiran-section">
        <div className="container">
          <div className="section-header">
            <h2><span>What is</span> <span className="brand-text">KIRAN</span>?</h2>
            <p className="description">
              KIRAN is a personalized mentorship program designed to guide students of Classes 11, 12, and droppers through their academic journey as well as emotional and mental stress. More than just doubt solving, it's a 24x7 companion for motivation, emotional guidance, and academic clarity.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="feature-title">Academic Mentorship</h3>
              <p className="feature-description">Personalized guidance for academic excellence</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="feature-title">Emotional & Mental Support</h3>
              <p className="feature-description">24x7 support for emotional well-being</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="feature-title">24x7 Doubt Assistance</h3>
              <p className="feature-description">Instant help whenever you need it</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="feature-title">Personalized Study Planning</h3>
              <p className="feature-description">Customized study schedules for success</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon red">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="feature-title">Career & Future Guidance</h3>
              <p className="feature-description">Pathway to your dream career</p>
            </div>
          </div>
        </div>
      </section>

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