import React from 'react';
import '../styles/footer.css';
import { FaInstagram, FaYoutube, FaTelegram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>KIRAN Education</h3>
          <p>Your trusted partner in education excellence</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Support Center</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: adityasinghofficial296@gmail.com</p>
          <p>Telegram: <a href="https://t.me/Aditya22906" target="_blank" rel="noopener noreferrer">@Aditya22906</a></p>
          <p>Address: Jamshedpur, Jharkhand, India</p>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="https://www.youtube.com/@AdityaSingh22906" className="social-icon youtube" data-tooltip="YouTube">
              <FaYoutube />
            </a>
            <a href="#" className="social-icon instagram" data-tooltip="Instagram">
              <FaInstagram />
            </a>
            
            <a href="https://t.me/Adi_2296" className="social-icon telegram" data-tooltip="Telegram">
              <FaTelegram />
            </a>
            <a href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=adityasinghofficial296@gmail.com&tf=1" className="social-icon gmail" data-tooltip="Gmail">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} KIRAN Education. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
