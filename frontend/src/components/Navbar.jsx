import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/navbar.css'
import NotificationIcon from './NotificationIcon'
import { logout } from '../utils/auth'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Define all navigation arrays at the top
  const studentNavigation = [
    { name: 'Dashboard', href: '/student' },
  ];

  const mentorNavigation = [
    { name: 'Dashboard', href: '/mentor' },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin' },
  ];

  const baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Study Material', href: '/study-material' },
    { name: 'Contact Us', href: '/contact' },
  ];

  // Combine base navigation with role-specific navigation
  const navigationItems = [
    ...baseNavigation,
    ...(user?.role === 'student' ? studentNavigation : []),
    ...(user?.role === 'mentor' ? mentorNavigation : []),
    ...(user?.role === 'admin' ? adminNavigation : [])
  ];

  // Get ordered items for rendering
  let orderedItems;
  if (!isAuthenticated) {
    orderedItems = [
      navigationItems.find(item => item.name === 'Home'),
      navigationItems.find(item => item.name === 'Contact Us')
    ].filter(item => item);
  } else {
    orderedItems = [
      navigationItems.find(item => item.name === 'Home'),
      navigationItems.find(item => item.name === 'Dashboard'),
      navigationItems.find(item => item.name === 'Study Material'),
      navigationItems.find(item => item.name === 'Contact Us')
    ].filter(item => item);
  }

  useEffect(() => {
    // Check authentication state
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsAuthenticated(true);
        const userData = localStorage.getItem('user');
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Initial check
    checkAuth();

    // Listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    // Listen for custom auth change events (same tab)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [])

  const handleLogout = async () => {
    await logout();
  }

  const handleMobileLogout = () => {
    handleLogout()
    setIsOpen(false) // Ensure mobile menu closes
  }

  useEffect(() => {
    // Redirect to Home if no path is specified
    if (location.pathname === '') {
      window.location.href = '/';
    }
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    // Handle root path specially
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={(e) => {
        e.preventDefault();
        navigate('/');
      }}>
        <span>KIRAN</span>
      </Link>
      <div className="nav-links">
        {orderedItems.map((item) => (
          <Link 
            key={item.href} 
            to={item.href} 
            className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="nav-actions">
        {isAuthenticated ? (
          <div className="profile-container">
            {/* Only show NotificationIcon for admin users */}
            {user?.role === 'admin' && <NotificationIcon />}
            <div className="user-info">
              <span className="user-name">
                {user?.name || user?.username || 'User'}
              </span>
              <span className="user-role">
                {user?.role ? capitalizeFirstLetter(user.role) : 'Member'}
              </span>
            </div>
            <button className="action-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="action-button" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>
      <button 
        className={`mobile-menu-button ${isOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span className="menu-icon">☰</span>
      </button>
    </nav>
  )
}

export default Navbar;