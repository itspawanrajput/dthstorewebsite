
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import HeroSlider from './components/HeroSlider';
import ProductPage from './components/ProductPage';
import SpecialOfferPage from './components/SpecialOfferPage';
import LoginModal from './components/LoginModal';
import { Lead, User, SiteConfig } from './types';
import { saveLead, getCurrentUser, logoutUser, getSiteConfig } from './services/storageService';
import { sendLeadNotification } from './services/notificationService';
import { PRODUCTS, DEFAULT_SITE_CONFIG } from './constants';
import { ShieldCheck, Check, Star, ArrowRight, MessageCircle, Facebook, Instagram, Youtube, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const App: React.FC = () => {
  // Routing State
  const [view, setView] = useState<'home' | 'admin' | 'account' | 'products' | 'offers'>('home');
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
    // If user is logged in, attach their ID to the lead
    if (user && user.id) {
      lead.userId = user.id;
    }

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
    // Redirect based on role
    if (loggedInUser.role === 'ADMIN') {
      setView('admin');
    } else {
      setView('account');
    }
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
        {view === 'admin' && user?.role === 'ADMIN' ? (
          <AdminDashboard user={user} />
        ) : view === 'account' && user ? (
          <CustomerDashboard user={user} onLogout={handleLogout} />
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
                  {PRODUCTS.slice(0, 3).map((product, index) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 card-hover"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative h-48 img-zoom bg-gray-100">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${product.color}`}></div>
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{product.type}</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{product.title}</h3>
                        <div className="flex items-baseline mb-4">
                          <span className="text-2xl font-extrabold text-gray-900">{product.price}</span>
                        </div>
                        <button onClick={handleBookNowScroll} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 btn-premium">Book Now</button>
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

            {/* Customer Testimonials */}
            <div className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-white">What Our Customers Say</h2>
                  <p className="mt-4 text-xl text-blue-100">Join 5000+ happy customers across India</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      name: "Rahul Sharma",
                      location: "Mumbai",
                      rating: 5,
                      review: "Excellent service! Got my Tata Play installed within 24 hours. The technician was professional and the picture quality is amazing.",
                      avatar: "RS"
                    },
                    {
                      name: "Priya Verma",
                      location: "Delhi",
                      rating: 5,
                      review: "Best prices for Jio Fiber! The team was very helpful and the installation was seamless. Highly recommend DTH Store!",
                      avatar: "PV"
                    },
                    {
                      name: "Amit Kumar",
                      location: "Bangalore",
                      rating: 5,
                      review: "Great experience! The ₹3600 cashback offer was genuine. Now enjoying HD channels with my family. Thank you DTH Store!",
                      avatar: "AK"
                    }
                  ].map((testimonial, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 card-hover"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.avatar}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold text-white">{testimonial.name}</h4>
                          <p className="text-sm text-blue-200">{testimonial.location}</p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-blue-100 text-sm leading-relaxed">"{testimonial.review}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-3xl font-bold text-white mb-4">{siteConfig.logoText}</h2>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                India's leading DTH and Broadband service partner. Bringing entertainment and connectivity to every home since 2020.
              </p>
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 rounded-full flex items-center justify-center transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                  <Youtube size={18} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-sky-500 rounded-full flex items-center justify-center transition-colors">
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Quick Links</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li onClick={() => setView('home')} className="cursor-pointer hover:text-white flex items-center"><ArrowRight size={14} className="mr-2 text-orange-500" />Home</li>
                <li onClick={() => setView('products')} className="cursor-pointer hover:text-white flex items-center"><ArrowRight size={14} className="mr-2 text-orange-500" />All Plans</li>
                <li onClick={() => setView('offers')} className="cursor-pointer hover:text-white flex items-center"><ArrowRight size={14} className="mr-2 text-orange-500" />Special Offers</li>
                <li onClick={handleBookNowScroll} className="cursor-pointer hover:text-white flex items-center"><ArrowRight size={14} className="mr-2 text-orange-500" />Contact Us</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center">
                  <Phone size={16} className="mr-3 text-blue-400" />
                  <a href="tel:+919311252564" className="hover:text-white">+91 93112 52564</a>
                </li>
                <li className="flex items-center">
                  <Mail size={16} className="mr-3 text-blue-400" />
                  <a href="mailto:support@dthstore.shop" className="hover:text-white">support@dthstore.shop</a>
                </li>
                <li className="flex items-start">
                  <MapPin size={16} className="mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Mumbai, Delhi, Bangalore & 10+ cities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {siteConfig.logoText}. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="hover:text-white transition">Privacy Policy</button>
              <button className="hover:text-white transition">Terms of Service</button>
              <button onClick={() => setShowLogin(true)} className="hover:text-white transition">Staff Login</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919311252564?text=Hi! I'm interested in DTH/Broadband connection."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} strokeWidth={2} />
      </a>
    </div>
  );
};

export default App;
