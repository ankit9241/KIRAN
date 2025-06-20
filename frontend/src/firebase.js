// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCoZyrcRwrV38i4kl9QZau5-D0_s25Pp-w",
  authDomain: "kiran-mentorship.firebaseapp.com",
  projectId: "kiran-mentorship",
  storageBucket: "kiran-mentorship.firebasestorage.app",
  messagingSenderId: "386001983528",
  appId: "1:386001983528:web:92d86f88caad93f8523d1d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider }; 