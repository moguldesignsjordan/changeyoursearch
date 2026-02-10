// firebase.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  User
} from "firebase/auth";

// Firebase config - replace with your actual values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth helper functions that match the API your App.tsx expects
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
  onAuthStateChanged,
  signInWithEmail, 
  signUpWithEmail, 
  signOut,
  resendVerificationEmail
};

export type { User };