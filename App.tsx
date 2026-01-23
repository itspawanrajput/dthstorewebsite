
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import HeroSlider from './components/HeroSlider';
import ProductPage from './components/ProductPage';
import SpecialOfferPage from './components/SpecialOfferPage';
import LoginModal from './components/LoginModal';
import { Lead, User, SiteConfig } from './types';
import { saveLead, getCurrentUser, logoutUser, getSiteConfig } from './services/storageService';
import { sendLeadNotification } from './services/notificationService';
import { PRODUCTS, DEFAULT_SITE_CONFIG } from './constants';
import { ShieldCheck, Check, Star, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // Routing State
  const [view, setView] = useState<'home' | 'admin' | 'products' | 'offers'>('home');
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  // Site Config
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      const config = await getSiteConfig();
      setSiteConfig(config);
    };
    init();
  }, [view]); // Refresh config when view changes (simple way to update after admin save)

  const handleLeadSubmit = async (lead: Lead) => {
    saveLead(lead);
    try {
      await sendLeadNotification(lead);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const handleBookNowScroll = () => {
    // If we are on home page, scroll. If not, go to home then scroll.
    if (view !== 'home') {
      setView('home');
      setTimeout(() => document.getElementById('book-now')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById('book-now')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('admin'); // Redirect to admin immediately on login
    setShowLogin(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <Navbar
        user={user}
        config={siteConfig}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={handleLogout}
        onNavigate={(page) => setView(page as any)}
      />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <main className="flex-grow">
        {view === 'admin' && user ? (
          <AdminDashboard user={user} />
        ) : view === 'products' ? (
          <ProductPage onBookNow={handleBookNowScroll} />
        ) : view === 'offers' ? (
          <SpecialOfferPage config={siteConfig} onLeadSubmit={handleLeadSubmit} />
        ) : (
          /* Public Landing Page */
          <>
            <HeroSlider slides={siteConfig.heroSlides} onLeadSubmit={handleLeadSubmit} />

            {/* Preview Section (Top 3 plans) */}
            <div id="services" className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-gray-900">Best Selling Plans</h2>
                  <p className="mt-4 text-xl text-gray-500">Popular choices from our customers</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {PRODUCTS.slice(0, 3).map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${product.color}`}></div>
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{product.type}</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{product.title}</h3>
                        <div className="flex items-baseline mb-4">
                          <span className="text-2xl font-extrabold text-gray-900">{product.price}</span>
                        </div>
                        <button onClick={handleBookNowScroll} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Book Now</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setView('products')}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 transition"
                  >
                    View All Plans <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Section */}
            <div className="bg-white py-16 border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose Us?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="p-6 rounded-xl bg-blue-50">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck size={24} /></div>
                    <h4 className="text-xl font-bold text-gray-900">5000+</h4>
                    <p className="text-sm text-gray-600">Happy Customers</p>
                  </div>
                  <div className="p-6 rounded-xl bg-orange-50">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Star size={24} /></div>
                    <h4 className="text-xl font-bold text-gray-900">4.8/5</h4>
                    <p className="text-sm text-gray-600">Google Rating</p>
                  </div>
                  <div className="p-6 rounded-xl bg-green-50">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={24} /></div>
                    <h4 className="text-xl font-bold text-gray-900">24h</h4>
                    <p className="text-sm text-gray-600">Fast Installation</p>
                  </div>
                  <div className="p-6 rounded-xl bg-purple-50">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck size={24} /></div>
                    <h4 className="text-xl font-bold text-gray-900">100%</h4>
                    <p className="text-sm text-gray-600">Support Assurance</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-3xl font-bold text-white mb-4">{siteConfig.logoText}</h2>
              <p className="text-gray-400 text-sm max-w-sm">
                India's leading DTH and Broadband service partner.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li onClick={() => setView('home')} className="cursor-pointer hover:text-white">Home</li>
                <li onClick={() => setView('products')} className="cursor-pointer hover:text-white">All Plans</li>
                <li onClick={handleBookNowScroll} className="cursor-pointer hover:text-white">Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Phone: +91 98765 43210</li>
                <li>Email: support@dthstore.shop</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2024 {siteConfig.logoText}. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={() => setShowLogin(true)} className="hover:text-white">Staff Login</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
