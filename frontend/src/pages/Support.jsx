import React, { useState } from 'react';
import '../styles/custom.css';

const supportTopics = [
  {
    title: 'Account Issues',
    description: 'Problems with login, registration, or account settings.'
  },
  {
    title: 'Resource Access',
    description: 'Trouble accessing study materials or personal resources.'
  },
  {
    title: 'Mentor Communication',
    description: 'Difficulties contacting or receiving responses from mentors.'
  },
  {
    title: 'Technical Support',
    description: 'Report bugs, errors, or technical issues.'
  }
];

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', issue: '', details: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send to backend or support email
  };

  return (
    <div className="support-page container">
      <h1>Support Center</h1>
      <p>Need help? Submit a support request or check our <a href="/faq">FAQ</a> and <a href="/contact">Contact</a> pages.</p>
      <div className="support-content">
        <div className="support-form-section">
          <h2>Submit a Support Request</h2>
          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Issue</label>
              <input type="text" name="issue" value={form.issue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Details</label>
              <textarea name="details" value={form.details} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-button">Submit</button>
            {submitted && <div className="support-success">Thank you! Your request has been received.</div>}
          </form>
        </div>
        <div className="support-topics-section">
          <h2>Common Support Topics</h2>
          <ul className="support-topics-list">
            {supportTopics.map((topic, idx) => (
              <li key={idx} className="support-topic">
                <strong>{topic.title}</strong>: {topic.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Support; 