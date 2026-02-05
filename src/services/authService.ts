/**
 * Authentication Service
 * Handles Firebase Authentication with Email/Password and Google Sign-In
 * Falls back to demo mode when Firebase is not configured
 */

import {
    auth,
    googleProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    FirebaseUser,
    isFirebaseConfigured
} from './firebase';
import { User, Role } from '../types';

const USER_SESSION_KEY = 'dthstore_user_session';

// Get admin emails from environment or use defaults
const getAdminEmails = (): string[] => {
    const envEmails = import.meta.env.VITE_ADMIN_EMAILS || '';
    const emails = envEmails.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);

    // Default admin emails if none configured
    if (emails.length === 0) {
        return ['admin@dthstore.shop'];
    }
    return emails;
};

// Email/Password Login
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase not configured. Use demo login.');
    }

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUserToUser(result.user);
        saveUserSession(user);
        return user;
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Create new account with Email/Password
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<User> => {
    if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase not configured. Sign up is disabled in demo mode.');
    }

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUserToUser(result.user, name);
        saveUserSession(user);
        return user;
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Google Sign-In
export const loginWithGoogle = async (): Promise<User> => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
        throw new Error('Firebase not configured. Google sign-in is disabled in demo mode.');
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = mapFirebaseUserToUser(result.user);
        saveUserSession(user);
        return user;
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Send Password Reset Email
export const resetPassword = async (email: string): Promise<void> => {
    if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase not configured. Password reset is disabled in demo mode.');
    }

    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Logout
export const logoutFirebase = async (): Promise<void> => {
    try {
        if (auth) {
            await signOut(auth);
        }
        localStorage.removeItem(USER_SESSION_KEY);
    } catch (error: any) {
        throw new Error('Failed to logout. Please try again.');
    }
};

// Auth State Observer
export const subscribeToAuthState = (callback: (user: User | null) => void): (() => void) => {
    if (!auth) {
        // Return a no-op unsubscribe function if auth is not available
        return () => { };
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const user = mapFirebaseUserToUser(firebaseUser);
            saveUserSession(user);
            callback(user);
        } else {
            localStorage.removeItem(USER_SESSION_KEY);
            callback(null);
        }
    });
};

// Get current user from session
export const getCurrentFirebaseUser = (): User | null => {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
};

// Helper: Map Firebase User to App User
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser, displayName?: string): User => {
    // Determine role based on admin email list
    // TODO: Add logic for STAFF role (e.g. check a separate list or database field)
    const role: Role = isAdminEmail(firebaseUser.email || '') ? 'ADMIN' : 'CUSTOMER';

    return {
        id: firebaseUser.uid,
        username: firebaseUser.email || firebaseUser.uid,
        name: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role
    };
};

// Admin check using environment-configured emails
const isAdminEmail = (email: string): boolean => {
    const adminEmails = getAdminEmails();
    return adminEmails.includes(email.toLowerCase());
};

// Save user session to localStorage
const saveUserSession = (user: User): void => {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
};

// User-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed before completing.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled.';
        case 'auth/popup-blocked':
            return 'Pop-up was blocked by your browser. Please allow pop-ups.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is not enabled. Please contact support.';
        default:
            console.error('Auth error code:', errorCode);
            return 'Authentication failed. Please try again.';
    }
};
