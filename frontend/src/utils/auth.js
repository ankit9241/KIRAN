import axios from 'axios';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export async function verifyToken(token) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/auth/verify`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.user; // { id, name, email, role }
  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('initialLoginRedirect');
    localStorage.removeItem('mentorApprovalMessageDismissed');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Set flag to prevent automatic login
    sessionStorage.setItem('recentlyLoggedOut', 'true');
    
    // Dispatch custom event to notify navbar of auth state change
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force page reload to clear any cached state
    window.location.reload();
  } catch (error) {
    console.error('Logout error:', error);
    // Even if Firebase logout fails, clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('initialLoginRedirect');
    localStorage.removeItem('mentorApprovalMessageDismissed');
    sessionStorage.clear();
    sessionStorage.setItem('recentlyLoggedOut', 'true');
    window.location.reload();
  }
} 