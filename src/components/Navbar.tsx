
import React from 'react';
import { Menu, Phone, LogIn, LogOut, X, ShoppingBag, Home, Zap, Mail } from 'lucide-react';
import { User, SiteConfig } from '../types';

interface NavbarProps {
    user: User | null;
    config: SiteConfig;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, config, onLoginClick, onLogoutClick, onNavigate }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleNavigation = (targetId: string) => {
        onNavigate(targetId); // Notify parent (App.tsx) to switch view state if necessary

        // Smooth scroll for anchor tags
        if (['home', 'services', 'book-now'].includes(targetId)) {
            setTimeout(() => {
                const element = document.getElementById(targetId);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
        setIsOpen(false);
    };

    const getIcon = (target: string) => {
        switch (target) {
            case 'home': return <Home size={16} className="mr-1" />;
            case 'products': return <ShoppingBag size={16} className="mr-1" />;
            case 'offers': return <Zap size={16} className="mr-1" />;
            case 'book-now': return <Mail size={16} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('home')}>
                        {config.logoImage ? (
                            <img
                                src={config.logoImage}
                                alt={config.logoText}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <>
                                <span className={`text-2xl font-bold ${config.logoColorClass}`}>{config.logoText.split(' ')[0]}</span>
                                {config.logoText.includes(' ') && (
                                    <span className="text-2xl font-bold text-gray-800 ml-1">{config.logoText.split(' ').slice(1).join(' ')}</span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        {config.navLinks.map(link => (
                            <button
                                key={link.id}
                                onClick={() => handleNavigation(link.target)}
                                className={`${link.isSpecial ? 'text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1 rounded-full font-bold' : 'text-gray-600 hover:text-blue-600 font-medium'} flex items-center transition`}
                            >
                                {getIcon(link.target)} {link.label}
                            </button>
                        ))}

                        {user ? (
                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                                <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                                <button
                                    onClick={() => handleNavigation(user.role === 'ADMIN' ? 'admin' : 'account')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition"
                                >
                                    {user.role === 'ADMIN' ? 'Dashboard' : 'My Account'}
                                </button>
                                <button onClick={onLogoutClick} className="text-red-500 hover:text-red-700" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 ml-2">
                                <button
                                    onClick={onLoginClick}
                                    className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition"
                                >
                                    <LogIn size={18} className="mr-2" /> Login
                                </button>
                                <a href="tel:+919311252564" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm">
                                    <Phone size={16} className="mr-2" /> Call Now
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-2 shadow-lg">
                    {config.navLinks.map(link => (
                        <button
                            key={link.id}
                            onClick={() => handleNavigation(link.target)}
                            className={`block w-full text-left px-4 py-3 border-b border-gray-100 ${link.isSpecial ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {link.label}
                        </button>
                    ))}

                    {user ? (
                        <>
                            <button
                                onClick={() => handleNavigation(user.role === 'ADMIN' ? 'admin' : 'account')}
                                className="block w-full text-left px-4 py-3 text-blue-600 font-medium hover:bg-gray-50"
                            >
                                {user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Account'}
                            </button>
                            <button onClick={onLogoutClick} className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-gray-50">Logout ({user.username})</button>
                        </>
                    ) : (
                        <button
                            onClick={() => { setIsOpen(false); onLoginClick(); }}
                            className="block w-full text-left px-4 py-3 text-blue-600 font-bold hover:bg-gray-50"
                        >
                            Login / Sign Up
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
