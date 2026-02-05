import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import { loginUser } from '../services/storageService';
import {
    loginWithEmail,
    loginWithGoogle,
    resetPassword,
    signUpWithEmail
} from '../services/authService';
import { User } from '../types';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

type ViewMode = 'login' | 'signup' | 'forgot-password' | 'reset-sent';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('login');

    // Check if Firebase is configured (not using placeholder)
    const isFirebaseConfigured = (): boolean => {
        try {
            // This check will pass even with placeholder values
            // In production, Firebase will throw an error on first auth attempt
            return true;
        } catch {
            return false;
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Try Firebase auth first
            const user = await loginWithEmail(email, password);
            onLoginSuccess(user);
            onClose();
        } catch (firebaseError: any) {
            // Fallback to demo credentials for local testing
            const demoUser = loginUser(email.split('@')[0], password);
            if (demoUser) {
                onLoginSuccess(demoUser);
                onClose();
            } else {
                setError(firebaseError.message || 'Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const user = await loginWithGoogle();
            onLoginSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signUpWithEmail(email, password, name);
            onLoginSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setViewMode('reset-sent');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        const titles: Record<ViewMode, string> = {
            'login': 'Staff Login',
            'signup': 'Create Account',
            'forgot-password': 'Reset Password',
            'reset-sent': 'Email Sent'
        };

        return (
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold flex items-center">
                    {viewMode !== 'login' && (
                        <button
                            onClick={() => setViewMode('login')}
                            className="mr-2 p-1 hover:bg-blue-700 rounded-full transition"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <Lock className="mr-2" size={20} />
                    {titles[viewMode]}
                </h2>
                <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition">
                    <X size={24} />
                </button>
            </div>
        );
    };

    const renderLoginForm = () => (
        <div className="p-8 space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                    {error}
                </div>
            )}

            {/* Google Sign In Button */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-sm transition duration-200 disabled:opacity-50"
            >
                <GoogleIcon />
                Continue with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or sign in with email</span>
                </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => { setViewMode('forgot-password'); setError(''); }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="text-center">
                <span className="text-sm text-gray-500">Don't have an account? </span>
                <button
                    type="button"
                    onClick={() => { setViewMode('signup'); setError(''); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Create one
                </button>
            </div>

            <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t">
                <p>Demo Credentials (for testing):</p>
                <p>Admin: admin@demo.com / 123</p>
                <p>Staff: staff@demo.com / 123</p>
            </div>
        </div>
    );

    const renderSignUpForm = () => (
        <div className="p-8 space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                    {error}
                </div>
            )}

            {/* Google Sign Up Button */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-sm transition duration-200 disabled:opacity-50"
            >
                <GoogleIcon />
                Sign up with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or sign up with email</span>
                </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <UserIcon size={18} />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Min. 6 characters"
                            minLength={6}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="text-center">
                <span className="text-sm text-gray-500">Already have an account? </span>
                <button
                    type="button"
                    onClick={() => { setViewMode('login'); setError(''); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Sign in
                </button>
            </div>
        </div>
    );

    const renderForgotPasswordForm = () => (
        <div className="p-8 space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                    {error}
                </div>
            )}

            <div className="text-center text-gray-600 mb-4">
                <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => { setViewMode('login'); setError(''); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Back to Sign In
                </button>
            </div>
        </div>
    );

    const renderResetSentConfirmation = () => (
        <div className="p-8 text-center space-y-5">
            <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600">
                    We've sent a password reset link to:
                </p>
                <p className="font-medium text-gray-900 mt-1">{email}</p>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p>Didn't receive the email? Check your spam folder or</p>
                <button
                    type="button"
                    onClick={() => setViewMode('forgot-password')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    try again
                </button>
            </div>

            <button
                onClick={() => { setViewMode('login'); setError(''); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200"
            >
                Back to Sign In
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {renderHeader()}

                {viewMode === 'login' && renderLoginForm()}
                {viewMode === 'signup' && renderSignUpForm()}
                {viewMode === 'forgot-password' && renderForgotPasswordForm()}
                {viewMode === 'reset-sent' && renderResetSentConfirmation()}
            </div>
        </div>
    );
};

export default LoginModal;
