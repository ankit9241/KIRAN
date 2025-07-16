import React from 'react';
import '../styles/custom.css';

const AboutUs = () => (
  <div className="about-page container">
    <h1>About Us</h1>
    <p className="about-mission">
      <strong>Our Mission:</strong> To empower students and mentors with a collaborative, resource-rich platform for personalized learning and growth.
    </p>
    <p className="about-vision">
      <strong>Our Vision:</strong> To make quality education accessible, interactive, and engaging for everyone, everywhere.
    </p>
    <div className="about-team">
      <h2>Meet the Team</h2>
      <ul>
        <li><strong>Aditya Singh</strong> – Founder & Organiser (manages and leads the KIRAN mentorship program)</li>
        <li><strong>Ankit Kumar</strong> – Tech Support Lead (developed and maintains the website, handles all technical support)</li>
        <li><strong>KIRAN Team</strong> – Mentors, Admins, and Contributors</li>
      </ul>
    </div>
    <div className="about-contact">
      <h2>Contact</h2>
      <p><strong>Email:</strong> <a href="mailto:adityasinghofficial296@gmail.com">adityasinghofficial296@gmail.com</a></p>
      <p><strong>Telegram:</strong> <a href="https://t.me/Aditya22906" target="_blank" rel="noopener noreferrer">@Aditya22906</a></p>
      <p><strong>Instagram:</strong> <a href="https://www.instagram.com/kiran_mentorship?igsh=MXR2aHNpenF5cXFpeA==" target="_blank" rel="noopener noreferrer">@kiran_mentorship</a></p>
    </div>
  </div>
);

export default AboutUs; 