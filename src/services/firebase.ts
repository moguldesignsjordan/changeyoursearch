// firebase.ts - Firebase Authentication with Google Sign-In
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config - uses environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Email/Password Sign In
const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

// Email/Password Sign Up
const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    return { 
      data: { 
        user: userCredential.user, 
        session: userCredential.user
      }, 
      error: null 
    };
  } catch (error: any) {
    return { data: { user: null, session: null }, error: { message: error.message } };
  }
};

// Google Sign In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { data: { user: result.user }, error: null };
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      return { data: null, error: { message: 'Sign-in popup was closed' } };
    }
    if (error.code === 'auth/popup-blocked') {
      return { data: null, error: { message: 'Popup was blocked. Please allow popups for this site.' } };
    }
    return { data: null, error: { message: error.message } };
  }
};

// Sign Out
const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

// Resend Verification Email
const resendVerificationEmail = async (email: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === email) {
      await sendEmailVerification(currentUser);
      return { error: null };
    }
    return { error: { message: "User not found or not logged in" } };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

export { 
  app,
  auth,
  db,
  onAuthStateChanged,
  signInWithEmail, 
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  resendVerificationEmail
};

export type { User };