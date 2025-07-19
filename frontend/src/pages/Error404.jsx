import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import errorImg from '../assets/404.jpg';
import '../styles/Error404.css';

const getDashboardRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role === 'admin') return '/admin';
  if (user?.role === 'mentor') return '/mentor';
  if (user?.role === 'student') return '/student';
  return '/';
};

const Error404 = () => {
  return (
    <div className="error404-container">
      <img src={errorImg} alt="404 Not Found" className="error404-bg-img" />
      <div className="error404-overlay" />
      <div className="error404-content-wrapper">
        <main className="error404-card">
          <p className="error404-code">404</p>
          <h1 className="error404-title">Page not found</h1>
          <p className="error404-message">Please check the URL in the address bar and try again.</p>
          <div className="error404-btn-group">
            <Link
              to={getDashboardRoute()}
              className="error404-btn error404-btn-primary"
            >
              <HomeIcon className="error404-homeicon" aria-hidden="true" />
              Go to Dashboard
            </Link>
            <Link
              to="/contact"
              className="error404-btn error404-btn-secondary"
            >
              Contact support
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Error404;