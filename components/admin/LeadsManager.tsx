import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, User } from '../../types';
import { getLeads, updateLead, deleteLead } from '../../services/storageService';
import { generateSalesScript } from '../../services/geminiService';
import { Search, Filter, Phone, MessageCircle, CheckCircle, Clock, Trash2, Wand2, RefreshCw } from 'lucide-react';

interface LeadsManagerProps {
    user: User;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ user }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<{ whatsapp: string, script: string } | null>(null);

    useEffect(() => {
        refreshLeads();
    }, []);

    const refreshLeads = async () => {
        const leads = await getLeads();
        setLeads(leads);
    };

    const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
        const updated = { ...lead, status: newStatus };
        if (newStatus === LeadStatus.INSTALLED && !updated.orderId) {
            updated.orderId = `ORD-${Date.now().toString().substr(-6)}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
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
                        <button onClick={refreshLeads} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-md"><RefreshCw size={18} /></button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                            <li key={lead.id} onClick={() => setSelectedLead(lead)} className={`cursor-pointer hover:bg-gray-50 ${selectedLead?.id === lead.id ? 'bg-blue-50' : ''}`}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600">{lead.name}</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>{lead.status}</span>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between text-sm text-gray-500">
                                        <p>{lead.serviceType} - {lead.operator}</p>
                                        <p className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(lead.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-1">
                {selectedLead ? (
                    <div className="bg-white shadow rounded-lg sticky top-36">
                        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Details</h3>
                            {user.role === 'ADMIN' && (
                                <button onClick={() => handleDeleteLead(selectedLead.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button>
                            )}
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{selectedLead.name}</p>
                                <p className="text-gray-500">{selectedLead.location}</p>
                                <div className="flex space-x-3 mt-3">
                                    <a href={`tel:${selectedLead.mobile}`} className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm hover:bg-blue-100"><Phone size={14} className="mr-2" /> Call</a>
                                    <a href={`https://wa.me/91${selectedLead.mobile}`} target="_blank" className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm hover:bg-green-100"><MessageCircle size={14} className="mr-2" /> WhatsApp</a>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Pipeline Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(LeadStatus).map((status) => (
                                        <button key={status} onClick={() => handleStatusChange(selectedLead, status)} className={`px-3 py-1 rounded-full text-xs border ${selectedLead.status === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
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
                    <div className="bg-white rounded-lg p-8 text-center text-gray-400 shadow">Select a lead to view details</div>
                )}
            </div>
        </div>
    );
};

export default LeadsManager;
