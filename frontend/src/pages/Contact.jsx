import React, { useState } from 'react';
import '../styles/contact.css';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import API_ENDPOINTS from '../config/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    try {
      const res = await axios.post(API_ENDPOINTS.CONTACT, formData);
      setSubmitStatus({ success: true, message: res.data.message || 'Message sent successfully!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitStatus({ success: false, message: err.response?.data?.message || 'Failed to send message.' });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions or need support? Get in touch with us.</p>
      </div>
      <div className="contact-container">
        {/* Contact Information */}
        <div className="contact-info">
          <div className="info-card">
            <h3>Get in Touch</h3>
            <p>Our support team is here to help you with any questions or concerns.</p>
            <p className="mt-2">
              <strong>Email:</strong> adityasinghofficial296@gmail.com
            </p>
            <p>
              <strong>Telegram:</strong> <a href="https://t.me/Aditya22906" target="_blank" rel="noopener noreferrer">@Aditya22906</a>
            </p>
          </div>

          <div className="info-card">
            <h3>Address</h3>
            <p>Jamshedpur, Jharkhand, India</p>
          </div>

          <div className="info-card">
            <h3>Quick Links</h3>
            <p>Find answers to common questions in our help center.</p>
            <p className="mt-2">
              <a href="/faq" className="text-primary hover:text-primary-dark">
                FAQ
              </a>
            </p>
            <p>
              <a href="/support" className="text-primary hover:text-primary-dark">
                Support Center
              </a>
            </p>
            <p>
              <a href="/terms" className="text-primary hover:text-primary-dark">
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form">
          <div className="form-section">
            <h3>Contact Form</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
              >
                Send Message
              </button>

              {submitStatus && (
                <div className={`mt-4 p-4 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
