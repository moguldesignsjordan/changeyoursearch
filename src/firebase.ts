import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  User,
  GoogleAuthProvider
} from "firebase/auth";

// Firebase config using environment variables
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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth helper functions
const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    // Firebase auto-signs in after registration
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

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

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
  auth, 
  googleProvider, 
  onAuthStateChanged,
  signInWithEmail, 
  signUpWithEmail, 
  signOut,
  resendVerificationEmail
};

export type { User };
