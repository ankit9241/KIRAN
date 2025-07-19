import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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
import { LoadingProvider, useLoading } from './context/LoadingContext';
import ToastProvider from './components/Toast.jsx';
import MyStudentProfile from './pages/MyStudentProfile';
import MyMentorProfile from './pages/MyMentorProfile';
import AdminProfile from './pages/AdminProfile';
import Error404 from './pages/Error404';
import ScrollToTop from './components/ScrollToTop';
import { ModalProvider } from './components/ModalProvider';
import Notifications from './pages/Notifications';


function AppContent() {
  const { isLoading } = useLoading();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className={"flex-grow transition-all duration-200 " + (isLoading ? "filter blur-sm pointer-events-none" : "")}>
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
          <Route path="/my-student-profile" element={<MyStudentProfile />} />
          <Route path="/my-mentor-profile" element={<MyMentorProfile />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <ModalProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </ModalProvider>
    </ToastProvider>
  );
}

export default App;
