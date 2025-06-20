import React, { useState } from 'react';
import '../styles/custom.css';

const faqs = [
  {
    question: 'How do I enroll as a student?',
    answer: 'Click on the Enroll link in the navigation bar and fill out the registration form. You can sign up manually or with Google.'
  },
  {
    question: 'How do I contact my mentor?',
    answer: 'You can find your assigned mentors in your dashboard and contact them via the provided contact methods.'
  },
  {
    question: 'How do I access study materials?',
    answer: 'Go to the Study Material page from the navigation bar to view all available resources.'
  },
  {
    question: 'How do I submit a doubt?',
    answer: 'Use the Doubt section in your dashboard to submit your questions. Mentors will respond as soon as possible.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click on Forgot Password on the login page and follow the instructions to reset your password.'
  },
  {
    question: 'How do I get support?',
    answer: 'Use the Support Center page or the Contact Us form to reach out to our team.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-page container">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}> 
            <div className="faq-question" onClick={() => toggleFAQ(idx)}>
              {faq.question}
              <span className="faq-toggle">{openIndex === idx ? '-' : '+'}</span>
            </div>
            {openIndex === idx && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 