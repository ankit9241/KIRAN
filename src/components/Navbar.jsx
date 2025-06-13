import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Student Dashboard', href: '/student' },
    { name: 'Mentor Dashboard', href: '/mentor' },
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Resources', href: '/resources' },
    { name: 'Contact', href: '/contact' },
  ]

  useEffect(() => {
    // Redirect to Home if no path is specified
    if (location.pathname === '') {
      window.location.href = '/';
    }
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>KIRAN</span>
      </Link>
      <div className="nav-links">
        {navigation.map((item) => (
          <Link 
            key={item.href} 
            to={item.href} 
            className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="nav-actions">
        <Link to="/login" className="nav-button">
          Login
        </Link>
      </div>
      <button 
        className="mobile-menu-button" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="menu-icon">☰</span>
      </button>
    </nav>
  )
}

export default Navbar;