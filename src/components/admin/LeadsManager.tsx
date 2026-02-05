import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, User, ServiceType, Operator, LeadNote } from '../../types';
import { getLeads, updateLead, deleteLead } from '../../services/storageService';
import { generateSalesScript } from '../../services/geminiService';
import { CITIES, DTH_OPERATORS, BROADBAND_OPERATORS } from '../../constants';
import {
    Search, Filter, Phone, MessageCircle, CheckCircle, Clock, Trash2, Wand2, RefreshCw,
    Download, Edit2, Bell, Calendar, PlusCircle, X, Save, FileText, BarChart3, TrendingUp,
    Users, AlertCircle, ChevronDown, ChevronUp, StickyNote
} from 'lucide-react';

interface LeadsManagerProps {
    user: User;
}

// Analytics Component
const LeadAnalytics: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === LeadStatus.NEW).length,
        contacted: leads.filter(l => l.status === LeadStatus.CONTACTED).length,
        interested: leads.filter(l => l.status === LeadStatus.INTERESTED).length,
        installed: leads.filter(l => l.status === LeadStatus.INSTALLED).length,
        cancelled: leads.filter(l => l.status === LeadStatus.CANCELLED).length,
        dth: leads.filter(l => l.serviceType === ServiceType.DTH).length,
        broadband: leads.filter(l => l.serviceType === ServiceType.BROADBAND).length,
        todayLeads: leads.filter(l => {
            const today = new Date();
            const leadDate = new Date(l.createdAt);
            return leadDate.toDateString() === today.toDateString();
        }).length,
        weekLeads: leads.filter(l => {
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return l.createdAt > weekAgo;
        }).length,
        conversionRate: leads.length > 0
            ? Math.round((leads.filter(l => l.status === LeadStatus.INSTALLED).length / leads.length) * 100)
            : 0
    };

    const followUpsToday = leads.filter(l => {
        if (!l.followUpDate) return false;
        const today = new Date();
        const followUp = new Date(l.followUpDate);
        return followUp.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <BarChart3 size={20} className="mr-2 text-blue-600" /> Lead Analytics
                </h3>
                <span className="text-sm text-gray-500">Last 30 days</span>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <Users size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-sm opacity-80">Total Leads</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <TrendingUp size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                    <p className="text-sm opacity-80">Conversion Rate</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <Calendar size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{stats.todayLeads}</p>
                    <p className="text-sm opacity-80">Today's Leads</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <Bell size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{followUpsToday}</p>
                    <p className="text-sm opacity-80">Follow-ups Today</p>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
                    <p className="text-xs text-blue-600">New</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700">{stats.contacted}</p>
                    <p className="text-xs text-yellow-600">Contacted</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">{stats.interested}</p>
                    <p className="text-xs text-purple-600">Interested</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{stats.installed}</p>
                    <p className="text-xs text-green-600">Installed</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                    <p className="text-xs text-red-600">Cancelled</p>
                </div>
            </div>

            {/* Service Type Breakdown */}
            <div className="mt-4 flex space-x-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">DTH Connections</span>
                        <span className="font-bold text-gray-900">{stats.dth}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-pink-500 rounded-full"
                            style={{ width: `${stats.total > 0 ? (stats.dth / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Broadband</span>
                        <span className="font-bold text-gray-900">{stats.broadband}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${stats.total > 0 ? (stats.broadband / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Lead Modal
interface EditLeadModalProps {
    lead: Lead;
    onSave: (lead: Lead) => void;
    onClose: () => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, onSave, onClose }) => {
    const [formData, setFormData] = useState(lead);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const currentOperators = formData.serviceType === ServiceType.DTH ? DTH_OPERATORS : BROADBAND_OPERATORS;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center"><Edit2 size={18} className="mr-2" /> Edit Lead</h3>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            pattern="[0-9]{10}"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => {
                                    const newType = e.target.value as ServiceType;
                                    const newOp = newType === ServiceType.DTH ? DTH_OPERATORS[0] : BROADBAND_OPERATORS[0];
                                    setFormData({ ...formData, serviceType: newType, operator: newOp });
                                }}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value={ServiceType.DTH}>DTH TV</option>
                                <option value={ServiceType.BROADBAND}>WiFi / Fiber</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                        <select
                            value={formData.operator}
                            onChange={(e) => setFormData({ ...formData, operator: e.target.value as Operator })}
                            className="w-full p-2 border rounded-lg"
                        >
                            {currentOperators.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value as Lead['source'] })}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="Website">Website</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                            <Save size={16} className="mr-2" /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LeadsManager: React.FC<LeadsManagerProps> = ({ user }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<{ whatsapp: string, script: string } | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    useEffect(() => {
        refreshLeads();
        // Check for follow-up reminders
        checkFollowUpReminders();
    }, []);

    const refreshLeads = async () => {
        const leads = await getLeads();
        setLeads(leads);
    };

    const checkFollowUpReminders = () => {
        const today = new Date().toDateString();
        const todayFollowUps = leads.filter(l => {
            if (!l.followUpDate) return false;
            return new Date(l.followUpDate).toDateString() === today;
        });

        if (todayFollowUps.length > 0 && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('DTH Store - Follow-up Reminder', {
                        body: `You have ${todayFollowUps.length} follow-up(s) scheduled for today!`,
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    };

    const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
        const updated = { ...lead, status: newStatus };
        if (newStatus === LeadStatus.INSTALLED && !updated.orderId) {
            updated.orderId = `ORD-${Date.now().toString().slice(-6)}`;
        }
        const newList = await updateLead(updated);
        setLeads(newList);
        if (selectedLead?.id === lead.id) {
            setSelectedLead(updated);
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (window.confirm('Delete this lead?')) {
            const newList = await deleteLead(id);
            setLeads(newList);
            if (selectedLead?.id === id) setSelectedLead(null);
        }
    };

    const handleGenerateScript = async (lead: Lead) => {
        setIsGeneratingScript(true);
        setGeneratedScript(null);
        const result = await generateSalesScript(lead);
        if (result) setGeneratedScript(result);
        setIsGeneratingScript(false);
    };

    const handleEditLead = async (updatedLead: Lead) => {
        const newList = await updateLead(updatedLead);
        setLeads(newList);
        setSelectedLead(updatedLead);
        setShowEditModal(false);
    };

    const handleAddNote = async () => {
        if (!selectedLead || !newNote.trim()) return;

        const note: LeadNote = {
            id: Date.now().toString(),
            text: newNote.trim(),
            createdAt: Date.now(),
            createdBy: user.name
        };

        const updatedLead = {
            ...selectedLead,
            notes: [...(selectedLead.notes || []), note]
        };

        const newList = await updateLead(updatedLead);
        setLeads(newList);
        setSelectedLead(updatedLead);
        setNewNote('');
    };

    const handleSetFollowUp = async () => {
        if (!selectedLead || !followUpDate) return;

        const updatedLead = {
            ...selectedLead,
            followUpDate: new Date(followUpDate).getTime()
        };

        const newList = await updateLead(updatedLead);
        setLeads(newList);
        setSelectedLead(updatedLead);
        setFollowUpDate('');
    };

    const handleClearFollowUp = async () => {
        if (!selectedLead) return;

        const updatedLead = {
            ...selectedLead,
            followUpDate: undefined
        };

        const newList = await updateLead(updatedLead);
        setLeads(newList);
        setSelectedLead(updatedLead);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Mobile', 'Location', 'Service Type', 'Operator', 'Status', 'Source', 'Created At', 'Order ID', 'Follow-up Date'];
        const csvData = leads.map(lead => [
            lead.name,
            lead.mobile,
            lead.location,
            lead.serviceType,
            lead.operator,
            lead.status,
            lead.source,
            new Date(lead.createdAt).toLocaleString(),
            lead.orderId || '',
            lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredLeads = leads.filter(lead => {
        const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.mobile.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: LeadStatus) => {
        switch (status) {
            case LeadStatus.NEW: return 'bg-blue-100 text-blue-800';
            case LeadStatus.CONTACTED: return 'bg-yellow-100 text-yellow-800';
            case LeadStatus.INTERESTED: return 'bg-purple-100 text-purple-800';
            case LeadStatus.INSTALLED: return 'bg-green-100 text-green-800';
            case LeadStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Analytics Section */}
            <div>
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-2"
                >
                    {showAnalytics ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
                {showAnalytics && <LeadAnalytics leads={leads} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Filter size={18} className="text-gray-500" />
                            <select
                                className="block w-full border-gray-300 rounded-md py-2 px-3 focus:outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={refreshLeads} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-md" title="Refresh">
                                <RefreshCw size={18} />
                            </button>
                            <button onClick={exportToCSV} className="p-2 text-gray-500 hover:text-green-600 bg-gray-50 rounded-md" title="Export to CSV">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {filteredLeads.length === 0 ? (
                                <li className="px-4 py-8 text-center text-gray-500">
                                    <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                                    No leads found
                                </li>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <li
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`cursor-pointer hover:bg-gray-50 ${selectedLead?.id === lead.id ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <p className="text-sm font-medium text-blue-600">{lead.name}</p>
                                                    {lead.followUpDate && new Date(lead.followUpDate).toDateString() === new Date().toDateString() && (
                                                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center">
                                                            <Bell size={10} className="mr-1" /> Follow-up Today
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                                    {lead.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between text-sm text-gray-500">
                                                <p>{lead.serviceType} - {lead.operator}</p>
                                                <p className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(lead.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-1">
                    {selectedLead ? (
                        <div className="bg-white shadow rounded-lg sticky top-36">
                            <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Details</h3>
                                <div className="flex space-x-2">
                                    <button onClick={() => setShowEditModal(true)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full" title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    {user.role === 'ADMIN' && (
                                        <button onClick={() => handleDeleteLead(selectedLead.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{selectedLead.name}</p>
                                    <p className="text-gray-500">{selectedLead.location}</p>
                                    <div className="flex space-x-3 mt-3">
                                        <a href={`tel:${selectedLead.mobile}`} className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm hover:bg-blue-100">
                                            <Phone size={14} className="mr-2" /> Call
                                        </a>
                                        <a href={`https://wa.me/91${selectedLead.mobile}`} target="_blank" className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm hover:bg-green-100">
                                            <MessageCircle size={14} className="mr-2" /> WhatsApp
                                        </a>
                                    </div>
                                </div>

                                {/* Status Pipeline */}
                                <div className="border-t pt-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pipeline Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.values(LeadStatus).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedLead, status)}
                                                className={`px-3 py-1 rounded-full text-xs border ${selectedLead.status === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedLead.status === LeadStatus.INSTALLED && (
                                    <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-start">
                                        <CheckCircle className="text-green-600 mt-0.5 mr-2" size={16} />
                                        <div>
                                            <p className="text-sm font-bold text-green-800">Installation Completed</p>
                                            <p className="text-xs text-green-700">Order ID: {selectedLead.orderId}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up Reminder */}
                                <div className="border-t pt-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                        <Calendar size={14} className="mr-1" /> Follow-up Reminder
                                    </h4>
                                    {selectedLead.followUpDate ? (
                                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-orange-800">
                                                    {new Date(selectedLead.followUpDate).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                                <p className="text-xs text-orange-600">Scheduled Follow-up</p>
                                            </div>
                                            <button
                                                onClick={handleClearFollowUp}
                                                className="text-orange-600 hover:text-orange-800"
                                                title="Clear reminder"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <input
                                                type="date"
                                                value={followUpDate}
                                                onChange={(e) => setFollowUpDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="flex-1 p-2 border rounded-lg text-sm"
                                            />
                                            <button
                                                onClick={handleSetFollowUp}
                                                disabled={!followUpDate}
                                                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
                                            >
                                                Set
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div className="border-t pt-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                        <StickyNote size={14} className="mr-1" /> Notes ({selectedLead.notes?.length || 0})
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                                        {selectedLead.notes?.map(note => (
                                            <div key={note.id} className="bg-gray-50 p-2 rounded text-sm">
                                                <p className="text-gray-800">{note.text}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {note.createdBy} • {new Date(note.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                        {(!selectedLead.notes || selectedLead.notes.length === 0) && (
                                            <p className="text-sm text-gray-400 italic">No notes yet</p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add a note..."
                                            className="flex-1 p-2 border rounded-lg text-sm"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim()}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Assistant */}
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-purple-900 flex items-center"><Wand2 size={16} className="mr-2" /> AI Sales Assistant</h4>
                                    </div>
                                    {!generatedScript ? (
                                        <button onClick={() => handleGenerateScript(selectedLead)} disabled={isGeneratingScript} className="w-full py-2 bg-white text-purple-700 border border-purple-200 rounded-md text-sm font-medium hover:bg-purple-100">
                                            {isGeneratingScript ? "Thinking..." : "Generate Pitch"}
                                        </button>
                                    ) : (
                                        <div className="space-y-3 text-sm">
                                            <div className="bg-white p-2 rounded border border-purple-100">
                                                <p className="text-xs font-bold text-gray-400 mb-1">WHATSAPP</p>
                                                <p className="text-gray-800">{generatedScript.whatsapp}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-purple-100">
                                                <p className="text-xs font-bold text-gray-400 mb-1">CALL SCRIPT</p>
                                                <p className="text-gray-800">{generatedScript.script}</p>
                                            </div>
                                            <button onClick={() => setGeneratedScript(null)} className="text-xs text-purple-600 underline w-full text-center">Reset</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-8 text-center text-gray-400 shadow">
                            <Users size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>Select a lead to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedLead && (
                <EditLeadModal
                    lead={selectedLead}
                    onSave={handleEditLead}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};

export default LeadsManager;
