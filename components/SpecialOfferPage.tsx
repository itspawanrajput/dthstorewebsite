
import React from 'react';
import LeadForm from './LeadForm';
import { Lead, SiteConfig } from '../types';
import { ShieldCheck, Clock, CheckCircle, Gift, Info } from 'lucide-react';

interface SpecialOfferPageProps {
  config: SiteConfig;
  onLeadSubmit: (lead: Lead) => void;
}

const SpecialOfferPage: React.FC<SpecialOfferPageProps> = ({ config, onLeadSubmit }) => {
  return (
    <div className="bg-white">
      {/* Hero Section with Form */}
      <div className="relative bg-gray-900 min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={config.specialOfferImages.heroBackground}
            alt="TV Entertainment" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 grid md:grid-cols-2 gap-12 items-center py-12">
          {/* Text Content */}
          <div className="text-white space-y-6">
            <div className="inline-block bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm animate-pulse shadow-lg">
              Limited Time Deal
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              HD Services With <span className="text-orange-500">{config.logoText}</span><br/>
              Hassle Free,<br/>
              Har Ghar Tak
            </h1>
            <p className="text-2xl font-light text-gray-300 border-l-4 border-orange-500 pl-4">
              ₹3600 Cashback | Free Installation | Book Now
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                 <ShieldCheck className="text-green-400" /> Authorized Partner
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                 <Clock className="text-blue-400" /> 24hr Installation
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-2xl max-w-md mx-auto w-full">
             <div className="bg-white rounded-xl overflow-hidden">
                <div className="bg-orange-600 text-white p-4 text-center">
                   <h3 className="text-xl font-bold">Register & Get Cashback ₹3600</h3>
                   <p className="text-sm opacity-90">Fill form to unlock this special offer</p>
                </div>
                <div className="p-6">
                    <LeadForm onSubmit={onLeadSubmit} hideHeader={true} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Offer Details Section */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl font-bold text-gray-800 mb-4">About <span className="text-orange-500">Special Cashback Offer</span></h2>
             <p className="text-gray-600 text-lg">
               Enjoy premium entertainment with {config.logoText} — Pay & Enjoy. Why wait? Connect with us today!
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
             <div className="order-2 md:order-1 space-y-8">
                 <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-orange-500 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                       <Gift size={100} className="text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                       <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3"><Gift /></span>
                       The ₹3600 Dhamaka Offer
                    </h3>
                    <ul className="space-y-4 text-gray-700">
                       <li className="flex items-start">
                          <CheckCircle className="text-green-500 mr-3 mt-1 shrink-0" size={20}/>
                          <span><strong>₹3600 Balance:</strong> Get account balance worth ₹3600 instantly.</span>
                       </li>
                       <li className="flex items-start">
                          <CheckCircle className="text-green-500 mr-3 mt-1 shrink-0" size={20}/>
                          <span><strong>Pay Only ₹3300:</strong> Save ₹300 instantly + Free HD Set Top Box.</span>
                       </li>
                       <li className="flex items-start">
                          <CheckCircle className="text-green-500 mr-3 mt-1 shrink-0" size={20}/>
                          <span><strong>Complete Kit:</strong> Includes Remote, Adaptor, 10m Wire & Installation.</span>
                       </li>
                       <li className="flex items-start">
                          <CheckCircle className="text-green-500 mr-3 mt-1 shrink-0" size={20}/>
                          <span><strong>1 Year Warranty:</strong> Full onsite warranty & 24/7 Support included.</span>
                       </li>
                    </ul>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100 hover:shadow-md transition">
                       <h4 className="font-bold text-blue-900 text-lg mb-2">Vision</h4>
                       <p className="text-sm text-blue-700">To be the most trusted DTH partner in India delivering innovative solutions.</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100 hover:shadow-md transition">
                       <h4 className="font-bold text-green-900 text-lg mb-2">Mission</h4>
                       <p className="text-sm text-green-700">Provide reliable, affordable services with exceptional support.</p>
                    </div>
                 </div>
             </div>

             <div className="order-1 md:order-2">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl rotate-3 opacity-20 transform group-hover:rotate-1 transition duration-500"></div>
                    <img 
                      src={config.specialOfferImages.sideImage}
                      alt="DTH Setup" 
                      className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]" 
                    />
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-xl shadow-lg border border-white/50">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effective Price</p>
                             <div className="flex items-baseline">
                                <span className="text-3xl font-extrabold text-gray-900">₹3,300</span>
                                <span className="ml-2 text-sm text-red-500 line-through">₹5,000</span>
                             </div>
                          </div>
                          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition shadow-lg">
                             Claim Now
                          </button>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
               {/* Connector Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-0"></div>

               <div className="relative text-center z-10 bg-white p-4">
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600 shadow-sm border border-orange-100">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">1. Book Online</h3>
                  <p className="text-gray-500">Fill the simple form above with your basic details.</p>
               </div>
               
               <div className="relative text-center z-10 bg-white p-4">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm border border-blue-100">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">2. Technician Visits</h3>
                  <p className="text-gray-500">Our expert technician installs the setup at your home.</p>
               </div>
               
               <div className="relative text-center z-10 bg-white p-4">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm border border-green-100">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">3. Receive Cashback</h3>
                  <p className="text-gray-500">Get the full cashback amount credited to your account.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
export default SpecialOfferPage;
