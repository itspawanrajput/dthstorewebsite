
import React, { useState } from 'react';
import { X, Lock, User as UserIcon } from 'lucide-react';
import { loginUser } from '../services/storageService';
import { User } from '../types';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = loginUser(username, password);
        if (user) {
            onLoginSuccess(user);
            onClose();
        } else {
            setError('Invalid credentials. Try "admin" / "123"');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center">
                        <Lock className="mr-2" size={20} /> Staff Login
                    </h2>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <UserIcon size={18} />
                            </div>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter username"
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

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200"
                    >
                        Access Dashboard
                    </button>

                    <div className="text-center text-xs text-gray-400 mt-4">
                        <p>Demo Credentials:</p>
                        <p>Admin: admin / 123</p>
                        <p>Staff: staff / 123</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
