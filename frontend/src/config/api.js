// API Configuration
// Use Vite's environment variables to get the API URL.
// VITE_API_URL should be set in your Netlify settings for production.
// It will fall back to localhost for local development if not set.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/login/google`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  CREATE_ADMIN: `${API_BASE_URL}/api/auth/create-admin`,

  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_PROFILE: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  MENTORS: `${API_BASE_URL}/api/users/mentors`,
  PENDING_MENTORS: `${API_BASE_URL}/api/users/mentors/pending`,
  ALL_MENTORS: `${API_BASE_URL}/api/users/mentors/all`,
  APPROVE_MENTOR: (mentorId) => `${API_BASE_URL}/api/users/mentors/${mentorId}/approve`,
  REJECT_MENTOR: (mentorId) => `${API_BASE_URL}/api/users/mentors/${mentorId}/reject`,
  CONTACT: `${API_BASE_URL}/api/users/contact`,

  // Doubts endpoints
  DOUBTS: `${API_BASE_URL}/api/doubts`,
  DOUBT_BY_ID: (doubtId) => `${API_BASE_URL}/api/doubts/${doubtId}`,
  ALL_DOUBTS: `${API_BASE_URL}/api/doubts/all`,
  STUDENT_DOUBTS: `${API_BASE_URL}/api/doubts/student`,
  STUDENT_DOUBTS_BY_ID: (studentId) => `${API_BASE_URL}/api/doubts/student/${studentId}`,
  DOUBT_STATUS: (doubtId) => `${API_BASE_URL}/api/doubts/${doubtId}/status`,

  // Feedback endpoints
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  STUDENT_FEEDBACK: (studentId) => `${API_BASE_URL}/api/feedback/student/${studentId}`,

  // Study Material / Resources endpoints
  RESOURCES: `${API_BASE_URL}/api/study-material`,
  ALL_RESOURCES: `${API_BASE_URL}/api/study-material/all`,
  PUBLIC_MATERIALS: `${API_BASE_URL}/api/study-material/public/all`,
  STUDENT_MATERIALS: (studentId) => `${API_BASE_URL}/api/study-material/student/${studentId}`,
  DOWNLOAD_MATERIAL: (materialId) => `${API_BASE_URL}/api/study-material/download/${materialId}`,
  UPLOAD_STUDENT_RESOURCE: `${API_BASE_URL}/api/study-material/upload-student`,

  // Meeting endpoints
  MEETINGS: `${API_BASE_URL}/api/meetings`,
  ALL_MEETINGS: `${API_BASE_URL}/api/meetings/all`,
  MEETING_BY_ID: (meetingId) => `${API_BASE_URL}/api/meetings/${meetingId}`,
  STUDENT_MEETINGS: `${API_BASE_URL}/api/meetings/student`,
  MENTOR_MEETINGS: `${API_BASE_URL}/api/meetings/mentor`,
  MEETING_STUDENTS: `${API_BASE_URL}/api/meetings/students`,

  // Notification endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  UNREAD_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/unread-count`,
  MARK_ALL_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
  MARK_READ: (notificationId) => `${API_BASE_URL}/api/notifications/${notificationId}/read`,

  // Announcement endpoints
  ANNOUNCEMENTS: `${API_BASE_URL}/api/announcements`,
  ALL_ANNOUNCEMENTS: `${API_BASE_URL}/api/announcements/all`,
  TOGGLE_ANNOUNCEMENT: (announcementId) => `${API_BASE_URL}/api/announcements/${announcementId}/toggle`,

  // File paths
  FILE_PATH: (filePath) => `${API_BASE_URL}${filePath}`,
};

export default API_ENDPOINTS; 