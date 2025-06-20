import { API_BASE_URL } from './environment.js';

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
  STUDENT_DOUBTS: `${API_BASE_URL}/api/doubts/student`,
  STUDENT_DOUBTS_BY_ID: (studentId) => `${API_BASE_URL}/api/doubts/student/${studentId}`,

  // Feedback endpoints
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  STUDENT_FEEDBACK: (studentId) => `${API_BASE_URL}/api/feedback/student/${studentId}`,

  // Study Material endpoints
  STUDY_MATERIAL: `${API_BASE_URL}/api/study-material`,
  PUBLIC_MATERIALS: `${API_BASE_URL}/api/study-material/public/all`,
  STUDENT_MATERIALS: (studentId) => `${API_BASE_URL}/api/study-material/student/${studentId}`,
  DOWNLOAD_MATERIAL: (materialId) => `${API_BASE_URL}/api/study-material/download/${materialId}`,

  // Meeting endpoints
  MEETINGS: `${API_BASE_URL}/api/meetings`,
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

  // File paths
  FILE_PATH: (filePath) => `${API_BASE_URL}${filePath}`,
};

export default API_ENDPOINTS; 