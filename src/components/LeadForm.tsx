
import React, { useState } from 'react';
import { Lead, LeadStatus, Operator, ServiceType } from '../types';
import { CITIES, DTH_OPERATORS, BROADBAND_OPERATORS } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple ID generator instead of adding a dependency

// Simple UUID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface LeadFormProps {
  onSubmit: (lead: Lead) => void;
  hideHeader?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, hideHeader = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    location: CITIES[0],
    serviceType: ServiceType.DTH,
    operator: DTH_OPERATORS[0] as Operator
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'serviceType') {
      // Reset operator when service changes to avoid mismatch
      const newService = value as ServiceType;
      const defaultOp = newService === ServiceType.DTH ? DTH_OPERATORS[0] : BROADBAND_OPERATORS[0];
      setFormData(prev => ({ ...prev, serviceType: newService, operator: defaultOp }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLead: Lead = {
      id: generateId(),
      ...formData,
      status: LeadStatus.NEW,
      source: 'Website',
      createdAt: Date.now()
    };

    // Determine if prop returns promise
    const result = onSubmit(newLead);
    if (result instanceof Promise) {
      await result;
    }

    setIsSubmitting(false);
    setSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        name: '',
        mobile: '',
        location: CITIES[0],
        serviceType: ServiceType.DTH,
        operator: DTH_OPERATORS[0]
      });
    }, 3000);
  };

  const currentOperators = formData.serviceType === ServiceType.DTH ? DTH_OPERATORS : BROADBAND_OPERATORS;

  return (
    <div className={`bg-white rounded-xl ${hideHeader ? '' : 'shadow-xl p-6 md:p-8'}`}>
      {success ? (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
          <p className="text-gray-600">Our expert will call you shortly on {formData.mobile}.</p>
        </div>
      ) : (
        <>
          {!hideHeader && (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Get Best Deal Today</h3>
              <p className="text-gray-500 text-center mb-6">Fill form to get a callback within 5 mins</p>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                required
                pattern="[0-9]{10}"
                title="10 digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="9876543210"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value={ServiceType.DTH}>DTH TV</option>
                  <option value={ServiceType.BROADBAND}>WiFi / Fiber</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Operator</label>
              <select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {currentOperators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md transition duration-300 transform hover:-translate-y-1 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Request Callback'}
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              Authorized Partner. Your data is secure.
            </p>
          </form>
        </>
      )}
    </div>
  );
};

export default LeadForm;
