import React, { useState } from 'react';
import { User } from '../types';
import { Users, ShoppingBag, Settings, Bell } from 'lucide-react';
import LeadsManager from './admin/LeadsManager';
import ProductManager from './admin/ProductManager';
import SiteSettings from './admin/SiteSettings';
import NotificationSettings from './admin/NotificationSettings';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'leads' | 'products' | 'settings' | 'notifications'>('leads');

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* Header */}
            <div className="bg-white shadow px-4 py-5 sm:px-6 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="text-sm text-gray-500">Welcome, {user.name} ({user.role})</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'leads' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center"><Users size={16} className="mr-2" /> Leads</div>
                        </button>
                        {user.role === 'ADMIN' && (
                            <>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center"><ShoppingBag size={16} className="mr-2" /> Products</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'notifications' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center"><Bell size={16} className="mr-2" /> Notifications</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <div className="flex items-center"><Settings size={16} className="mr-2" /> Settings</div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

                {/* LEADS TAB */}
                {activeTab === 'leads' && (
                    <LeadsManager user={user} />
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && user.role === 'ADMIN' && (
                    <ProductManager user={user} />
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && user.role === 'ADMIN' && (
                    <NotificationSettings />
                )}

                {/* SETTINGS TAB (CMS) */}
                {activeTab === 'settings' && user.role === 'ADMIN' && (
                    <SiteSettings user={user} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
