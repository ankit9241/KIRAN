import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import styles
import './styles/custom.css';
import './styles/study-material.css';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentProfile from './pages/StudentProfile';
import MentorProfile from './pages/MentorProfile';
import UserProfile from './pages/UserProfile';
import StudyMaterial from './pages/StudyMaterial';
import Contact from './pages/Contact';
import Enroll from './pages/Enroll';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';
import FAQ from './pages/FAQ';
import AboutUs from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student-profile/:studentId" element={<StudentProfile />} />
            <Route path="/mentor-profile/:mentorId" element={<MentorProfile />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />
            <Route path="/study-material" element={<StudyMaterial />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/enroll/:type" element={<Enroll />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
