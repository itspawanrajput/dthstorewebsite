import React, { useState, useEffect } from 'react';
import { User, Lead } from '../types';
import { getUserLeads, logoutUser } from '../services/storageService';
import { Package, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface CustomerDashboardProps {
    user: User;
    onLogout: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user.id) {
                const userLeads = await getUserLeads(user.id);
                // Sort by newest first
                setLeads(userLeads.sort((a, b) => b.createdAt - a.createdAt));
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Contacted': return 'bg-yellow-100 text-yellow-800';
            case 'Interested': return 'bg-purple-100 text-purple-800';
            case 'Installed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">My Account</h1>
                                <p className="text-sm text-gray-500">{user.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
                    <p className="text-gray-600">Track status of your installation requests</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-500 mb-6">You haven't placed any installation requests yet.</p>
                        <a href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Browse Plans
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {leads.map((lead) => (
                            <div key={lead.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{lead.serviceType}</h3>
                                    <p className="text-gray-600 text-sm mb-4">Operator: {lead.operator}</p>

                                    <div className="space-y-2 text-sm text-gray-500 border-t pt-4">
                                        <div className="flex justify-between">
                                            <span>Request ID:</span>
                                            <span className="font-mono text-gray-700">#{lead.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>City:</span>
                                            <span className="text-gray-700">{lead.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 flex justify-between items-center">
                                    {lead.status === 'Installed' ? (
                                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> Completed</span>
                                    ) : lead.status === 'Cancelled' ? (
                                        <span className="flex items-center gap-1 text-red-600"><XCircle size={14} /> Cancelled</span>
                                    ) : (
                                        <span className="text-blue-600">In Progress</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerDashboard;
