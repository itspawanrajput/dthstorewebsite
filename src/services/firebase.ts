/**
 * Firebase Configuration
 * 
 * Configuration is loaded from environment variables.
 * Set these in your .env file (see .env.example for reference).
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.apiKey !== 'your_firebase_api_key' &&
        !firebaseConfig.apiKey.includes('YOUR_')
    );
};

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();

        // Configure Google provider
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error);
    }
} else {
    console.log('ℹ️ Firebase not configured. Using demo mode for authentication.');
}

// Export auth instance (may be null if not configured)
export { auth, db, googleProvider };

// Re-export Firebase auth functions
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
};

export type { FirebaseUser };
