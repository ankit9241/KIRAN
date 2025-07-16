import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import '../styles/navbar.css';

// Add icons for hamburger and close (X)
const HamburgerIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
const CloseIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const AnimatedHamburger = ({ open }) => (
  <div className={`hamburger-animated${open ? ' open' : ''}`}>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const Navbar = () => {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const profileIconRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();

    // Listen for auth state changes
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };
    // Listen for custom auth event (same-tab login/logout)
    const handleAuthStateChanged = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChanged);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => setIsProfileDropdownOpen((open) => !open);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileIconRef.current && !profileIconRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname === path;
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  // Function to trigger mentor edit profile modal from Navbar (mobile only)
  const openEditProfile = () => {
    localStorage.setItem('openMentorEditProfile', 'true');
    setIsMenuOpen(false);
    navigate('/mentor');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo-link">
            <img src={logo} alt="KIRAN Logo" className="navbar-logo-img" />
            <span className="navbar-brand-text"><b>KIRAN</b></span>
          </Link>
          {/* Desktop Nav */}
          <div className="navbar-links desktop-only">
            <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
            <Link to={user?.role === 'student' ? '/student' : user?.role === 'mentor' ? '/mentor' : user?.role === 'admin' ? '/admin' : '/dashboard'} className={`nav-link${isActive(user?.role === 'student' ? '/student' : user?.role === 'mentor' ? '/mentor' : user?.role === 'admin' ? '/admin' : '/dashboard') ? ' active' : ''}`}>Dashboard</Link>
            <Link to="/study-material" className={`nav-link${isActive('/study-material') ? ' active' : ''}`}>Study Material</Link>
            <Link to="/contact" className={`nav-link${isActive('/contact') ? ' active' : ''}`}>Contact Us</Link>
          </div>
          {/* Desktop Actions */}
          <div className="navbar-actions desktop-only">
            {!isAuthenticated ? (
              <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
            ) : (
              <div className="profile-dropdown-container" ref={profileIconRef}>
                <button className="profile-toggle" onClick={toggleProfileDropdown} aria-label="Toggle profile menu">
                  <svg className="profile-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" />
                  </svg>
                </button>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <span className="profile-dropdown-name">{user?.name || user?.username || 'User'}</span><br />
                      <span className="profile-dropdown-role">{user?.role ? capitalizeFirstLetter(user.role) : 'Member'}</span>
                    </div>
                    <div className="profile-dropdown-email">Email: {user?.email || 'N/A'}</div>
                    <button
                      className="profile-dropdown-view-profile"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        if (user?.role === 'student') navigate('/my-student-profile');
                        else if (user?.role === 'mentor') navigate('/my-mentor-profile');
                        else if (user?.role === 'admin') navigate('/admin-profile');
                        else navigate('/');
                      }}
                    >
                      View Profile
                    </button>
                    <button className="profile-dropdown-logout" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Mobile Hamburger or Login (mobile-only) */}
          <div className="mobile-only">
            {!isAuthenticated ? (
              <button
                className="login-btn"
                style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', borderRadius: '6px', fontWeight: 600 }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            ) : (
              <button
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className="hamburger-btn"
              >
                <AnimatedHamburger open={isMenuOpen} />
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Mobile Dropdown (pushes content down) */}
      {isMenuOpen && (
        <div className="sidebar-drawer mobile-only">
          <div className="sidebar-profile">
            {isAuthenticated ? (
              <>
                <span className="sidebar-profile-name">{user?.name || user?.username || 'User'}</span>
                <span className="sidebar-profile-role">{user?.role ? capitalizeFirstLetter(user.role) : 'Member'}</span>
                <span className="sidebar-profile-email">{user?.email || 'N/A'}</span>
                <button
                  className="sidebar-view-profile-btn"
                  style={{ marginTop: '10px', width: '100%', textAlign: 'left', padding: '4px 0', background: 'none', border: 'none', color: '#666', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (user?.role === 'student') navigate('/my-student-profile');
                    else if (user?.role === 'mentor') navigate('/my-mentor-profile');
                    else if (user?.role === 'admin') navigate('/admin-profile');
                    else navigate('/');
                  }}
                >
                  <span style={{ fontSize: '1.1em', color: '#4F46E5', fontWeight: 600 }}><i className="fas fa-user-circle"></i></span>
                  <span style={{ fontSize: '0.97em', color: '#4F46E5', fontWeight: 500 }}><b>View Profile</b></span>
                </button>
                {/* Mentor: Edit Profile button in sidebar (mobile only) */}
              </>
            ) : (
              <span className="sidebar-profile-name">Welcome!</span>
            )}
          </div>
          <div className="sidebar-links">
            <Link to="/" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            {isAuthenticated && (
              <>
                <Link to={user?.role === 'student' ? '/student' : user?.role === 'mentor' ? '/mentor' : user?.role === 'admin' ? '/admin' : '/dashboard'} className="sidebar-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/study-material" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>Study Material</Link>
              </>
            )}
            <Link to="/contact" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
          </div>
          <div className="sidebar-actions">
            {!isAuthenticated ? (
              <button className="sidebar-login-btn" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>Login</button>
            ) : (
              <button className="sidebar-logout-btn" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Logout</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 