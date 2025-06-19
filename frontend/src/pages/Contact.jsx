import React, { useState } from 'react';
import '../styles/contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would submit the form data
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
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
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </div>

          <div className="info-card">
            <h3>Address</h3>
            <p>123 Education Street</p>
            <p>School District, City</p>
            <p>Country, Postal Code</p>
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

              {isSubmitted && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                  Thank you for your message! We will get back to you soon.
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
