// Environment Configuration
const getApiUrl = () => {
  // Check if we're in production (Netlify)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production - you'll need to replace this with your actual backend URL
    return 'https://your-backend-domain.com'; // Replace with your deployed backend URL
  }
  
  // Development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();

// Log the API URL for debugging (remove in production)
console.log('API Base URL:', API_BASE_URL); 