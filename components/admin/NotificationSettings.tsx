import React, { useState, useEffect, useCallback } from 'react';
import { NotificationConfig } from '../../types';
import { getNotificationConfig, saveNotificationConfig } from '../../services/storageService';
import {
    Bell, Mail, MessageCircle, Send, Save, CheckCircle, AlertCircle,
    ExternalLink, Eye, EyeOff, Info, TestTube, Server, RefreshCw,
    Power, PowerOff, Smartphone, Loader2, QrCode
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
    const [config, setConfig] = useState<NotificationConfig>({
        emailEnabled: false,
        web3formsKey: '',
        adminEmail: '',
        telegramEnabled: false,
        telegramBotToken: '',
        telegramChatId: '',
        whatsappEnabled: false,
        whatsappApiUrl: '',
        whatsappApiKey: '',
        whatsappSessionId: 'DTHSTORE',
        whatsappAdminNumber: '',
        browserNotificationsEnabled: true
    });

    const [saved, setSaved] = useState(false);
    const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);

    // WhatsApp Session State
    const [whatsappStatus, setWhatsappStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'checking' | 'initializing'>('unknown');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [sessionAction, setSessionAction] = useState<string | null>(null);

    useEffect(() => {
        const savedConfig = getNotificationConfig();
        setConfig(savedConfig);
    }, []);

    // Auto-check WhatsApp status when API URL changes
    useEffect(() => {
        if (config.whatsappApiUrl && config.whatsappEnabled) {
            checkWhatsAppStatus();
        }
    }, [config.whatsappApiUrl, config.whatsappEnabled]);

    const handleSave = () => {
        saveNotificationConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggleShowToken = (field: string) => {
        setShowTokens(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const getApiHeaders = useCallback(() => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (config.whatsappApiKey) {
            headers['x-api-key'] = config.whatsappApiKey;
        }
        return headers;
    }, [config.whatsappApiKey]);

    const checkWhatsAppStatus = async () => {
        if (!config.whatsappApiUrl) return;

        setWhatsappStatus('checking');
        try {
            const response = await fetch(
                `${config.whatsappApiUrl}/session/status/${config.whatsappSessionId}`,
                { headers: getApiHeaders() }
            );
            const data = await response.json();

            if (data.success && data.state === 'CONNECTED') {
                setWhatsappStatus('connected');
                setQrCode(null);
            } else {
                setWhatsappStatus('disconnected');
            }
        } catch (error) {
            console.error('Status check failed:', error);
            setWhatsappStatus('disconnected');
        }
    };

    const startWhatsAppSession = async () => {
        if (!config.whatsappApiUrl) return;

        setSessionAction('starting');
        setWhatsappStatus('initializing');

        try {
            const response = await fetch(
                `${config.whatsappApiUrl}/session/start/${config.whatsappSessionId}`,
                { method: 'GET', headers: getApiHeaders() }
            );
            const data = await response.json();

            if (data.success) {
                // Wait a moment then fetch QR code
                setTimeout(() => fetchQRCode(), 2000);
            } else {
                setTestResult({ channel: 'whatsapp', success: false, message: data.message || 'Failed to start session' });
            }
        } catch (error: any) {
            setTestResult({ channel: 'whatsapp', success: false, message: error.message });
        }
        setSessionAction(null);
    };

    const stopWhatsAppSession = async () => {
        if (!config.whatsappApiUrl) return;

        setSessionAction('stopping');
        try {
            const response = await fetch(
                `${config.whatsappApiUrl}/session/terminate/${config.whatsappSessionId}`,
                { method: 'GET', headers: getApiHeaders() }
            );
            const data = await response.json();

            if (data.success) {
                setWhatsappStatus('disconnected');
                setQrCode(null);
                setTestResult({ channel: 'whatsapp', success: true, message: 'Session terminated' });
            }
        } catch (error: any) {
            setTestResult({ channel: 'whatsapp', success: false, message: error.message });
        }
        setSessionAction(null);
    };

    const fetchQRCode = async () => {
        if (!config.whatsappApiUrl) return;

        setQrLoading(true);
        try {
            // Get QR as base64
            const response = await fetch(
                `${config.whatsappApiUrl}/session/qr/${config.whatsappSessionId}`,
                { headers: getApiHeaders() }
            );
            const data = await response.json();

            if (data.success && data.qr) {
                setQrCode(data.qr);
                setWhatsappStatus('disconnected');
            } else {
                // Try image endpoint
                const imgUrl = `${config.whatsappApiUrl}/session/qr/${config.whatsappSessionId}/image`;
                setQrCode(imgUrl);
            }
        } catch (error) {
            console.error('QR fetch failed:', error);
            // Fallback to image URL
            const imgUrl = `${config.whatsappApiUrl}/session/qr/${config.whatsappSessionId}/image`;
            setQrCode(imgUrl);
        }
        setQrLoading(false);
    };

    const testNotification = async (channel: 'email' | 'telegram' | 'whatsapp') => {
        setTesting(channel);
        setTestResult(null);

        try {
            if (channel === 'email' && config.emailEnabled && config.web3formsKey) {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: config.web3formsKey,
                        subject: '🔔 Test Notification - DTH Store',
                        from_name: 'DTH Store Website',
                        message: 'This is a test notification. Your email integration is working!'
                    })
                });
                const data = await response.json();
                setTestResult({
                    channel,
                    success: data.success,
                    message: data.success ? 'Email sent successfully!' : data.message
                });
            } else if (channel === 'telegram' && config.telegramEnabled && config.telegramBotToken && config.telegramChatId) {
                const message = `🔔 *Test Notification*\n\nYour Telegram integration is working!\n\n_From DTH Store CMS_`;
                const response = await fetch(
                    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: config.telegramChatId,
                            text: message,
                            parse_mode: 'Markdown'
                        })
                    }
                );
                const data = await response.json();
                setTestResult({
                    channel,
                    success: data.ok,
                    message: data.ok ? 'Telegram message sent!' : data.description
                });
            } else if (channel === 'whatsapp' && config.whatsappEnabled && config.whatsappApiUrl && config.whatsappAdminNumber) {
                const response = await fetch(
                    `${config.whatsappApiUrl}/client/sendMessage/${config.whatsappSessionId}`,
                    {
                        method: 'POST',
                        headers: getApiHeaders(),
                        body: JSON.stringify({
                            chatId: `${config.whatsappAdminNumber}@c.us`,
                            message: '🔔 *Test Notification*\n\nYour WhatsApp integration is working!\n\n_From DTH Store CMS_'
                        })
                    }
                );
                const data = await response.json();
                setTestResult({
                    channel,
                    success: response.ok,
                    message: response.ok ? 'WhatsApp message sent!' : (data.message || 'Failed to send')
                });
            } else {
                setTestResult({
                    channel,
                    success: false,
                    message: 'Please enable and configure this channel first'
                });
            }
        } catch (error: any) {
            setTestResult({
                channel,
                success: false,
                message: error.message || 'Test failed'
            });
        }

        setTesting(null);
    };

    const requestBrowserNotification = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('DTH Store Notifications Enabled!', {
                        body: 'You will now receive alerts for new leads.',
                        icon: '/favicon.ico'
                    });
                    setTestResult({
                        channel: 'browser',
                        success: true,
                        message: 'Browser notifications enabled!'
                    });
                } else {
                    setTestResult({
                        channel: 'browser',
                        success: false,
                        message: 'Permission denied'
                    });
                }
            });
        }
    };

    const StatusBadge = ({ status }: { status: typeof whatsappStatus }) => {
        const styles = {
            connected: 'bg-green-100 text-green-800 border-green-200',
            disconnected: 'bg-red-100 text-red-800 border-red-200',
            checking: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            initializing: 'bg-blue-100 text-blue-800 border-blue-200',
            unknown: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        const labels = {
            connected: '● Connected',
            disconnected: '● Disconnected',
            checking: '● Checking...',
            initializing: '● Initializing...',
            unknown: '● Unknown'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            <Bell className="mr-3" size={28} /> Notification Settings
                        </h2>
                        <p className="mt-2 opacity-90">
                            Configure how you receive alerts when new leads are submitted
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center transition ${saved
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-blue-600 hover:bg-blue-50'
                            }`}
                    >
                        {saved ? (
                            <><CheckCircle size={20} className="mr-2" /> Saved!</>
                        ) : (
                            <><Save size={20} className="mr-2" /> Save Settings</>
                        )}
                    </button>
                </div>
            </div>

            {/* Test Result Banner */}
            {testResult && (
                <div className={`p-4 rounded-xl flex items-center ${testResult.success
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {testResult.success ? <CheckCircle size={20} className="mr-3" /> : <AlertCircle size={20} className="mr-3" />}
                    <span className="font-medium">{testResult.channel.toUpperCase()}:</span>
                    <span className="ml-2">{testResult.message}</span>
                    <button onClick={() => setTestResult(null)} className="ml-auto text-gray-500 hover:text-gray-700 text-xl">×</button>
                </div>
            )}

            {/* WhatsApp Section - Self-Hosted API with Full Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                <MessageCircle className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">WhatsApp Business</h3>
                                <p className="text-sm text-gray-500">Self-hosted WhatsApp API on AWS EC2</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={whatsappStatus} />
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.whatsappEnabled}
                                    onChange={(e) => setConfig({ ...config, whatsappEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {config.whatsappEnabled && (
                    <div className="p-6 space-y-6">
                        {/* Server Configuration */}
                        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                            <h4 className="font-semibold text-gray-700 flex items-center">
                                <Server size={18} className="mr-2" /> Server Configuration
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Server URL</label>
                                    <input
                                        type="text"
                                        value={config.whatsappApiUrl}
                                        onChange={(e) => setConfig({ ...config, whatsappApiUrl: e.target.value })}
                                        placeholder="http://ec2-13-221-113-50.compute-1.amazonaws.com:3000"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <div className="relative">
                                        <input
                                            type={showTokens.whatsapp ? 'text' : 'password'}
                                            value={config.whatsappApiKey}
                                            onChange={(e) => setConfig({ ...config, whatsappApiKey: e.target.value })}
                                            placeholder="dthstore2024secure"
                                            className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                        <button
                                            onClick={() => toggleShowToken('whatsapp')}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showTokens.whatsapp ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                                    <input
                                        type="text"
                                        value={config.whatsappSessionId}
                                        onChange={(e) => setConfig({ ...config, whatsappSessionId: e.target.value })}
                                        placeholder="DTHSTORE"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin WhatsApp Number</label>
                                    <input
                                        type="text"
                                        value={config.whatsappAdminNumber}
                                        onChange={(e) => setConfig({ ...config, whatsappAdminNumber: e.target.value })}
                                        placeholder="919311252564"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Include country code (91 for India)</p>
                                </div>
                            </div>
                        </div>

                        {/* Session Management */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 space-y-4">
                            <h4 className="font-semibold text-gray-700 flex items-center">
                                <Smartphone size={18} className="mr-2" /> Session Management
                            </h4>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={checkWhatsAppStatus}
                                    disabled={!config.whatsappApiUrl || whatsappStatus === 'checking'}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                                >
                                    {whatsappStatus === 'checking' ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw size={16} className="mr-2" />
                                    )}
                                    Check Status
                                </button>

                                <button
                                    onClick={startWhatsAppSession}
                                    disabled={!config.whatsappApiUrl || sessionAction === 'starting'}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                                >
                                    {sessionAction === 'starting' ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <Power size={16} className="mr-2" />
                                    )}
                                    Start Session
                                </button>

                                <button
                                    onClick={stopWhatsAppSession}
                                    disabled={!config.whatsappApiUrl || sessionAction === 'stopping'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {sessionAction === 'stopping' ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <PowerOff size={16} className="mr-2" />
                                    )}
                                    Stop Session
                                </button>

                                <button
                                    onClick={fetchQRCode}
                                    disabled={!config.whatsappApiUrl || qrLoading}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                                >
                                    {qrLoading ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <QrCode size={16} className="mr-2" />
                                    )}
                                    Get QR Code
                                </button>
                            </div>

                            {/* QR Code Display */}
                            {qrCode && whatsappStatus !== 'connected' && (
                                <div className="mt-4 p-6 bg-white rounded-xl border-2 border-dashed border-green-300 text-center">
                                    <h5 className="font-semibold text-gray-700 mb-4">Scan QR Code with WhatsApp</h5>
                                    <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
                                        {qrCode.startsWith('http') ? (
                                            <img
                                                src={`${qrCode}?t=${Date.now()}`}
                                                alt="WhatsApp QR Code"
                                                className="w-64 h-64 object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCode)}`}
                                                alt="WhatsApp QR Code"
                                                className="w-64 h-64"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p>1. Open WhatsApp on your phone</p>
                                        <p>2. Go to Settings → Linked Devices</p>
                                        <p>3. Tap "Link a Device" and scan this QR code</p>
                                    </div>
                                    <button
                                        onClick={fetchQRCode}
                                        className="mt-4 text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center mx-auto"
                                    >
                                        <RefreshCw size={14} className="mr-1" /> Refresh QR Code
                                    </button>
                                </div>
                            )}

                            {/* Connected State */}
                            {whatsappStatus === 'connected' && (
                                <div className="mt-4 p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-white" size={32} />
                                    </div>
                                    <h5 className="font-semibold text-green-800 text-lg">WhatsApp Connected!</h5>
                                    <p className="text-green-600 mt-2">Your WhatsApp session is active and ready to send notifications.</p>
                                </div>
                            )}
                        </div>

                        {/* Test Message */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => testNotification('whatsapp')}
                                disabled={testing === 'whatsapp' || !config.whatsappApiUrl || !config.whatsappAdminNumber || whatsappStatus !== 'connected'}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-medium"
                            >
                                <TestTube size={18} className="mr-2" />
                                {testing === 'whatsapp' ? 'Sending...' : 'Send Test Message'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Email Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                <Mail className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Notifications</h3>
                                <p className="text-sm text-gray-500">Receive leads via email using Web3Forms</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.emailEnabled}
                                onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {config.emailEnabled && (
                    <div className="p-6 bg-gray-50 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                            <Info size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">How to get Web3Forms Access Key:</p>
                                <ol className="mt-2 list-decimal list-inside space-y-1">
                                    <li>Go to <a href="https://web3forms.com" target="_blank" className="underline">web3forms.com</a></li>
                                    <li>Enter your email address</li>
                                    <li>Copy the Access Key sent to your email</li>
                                </ol>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Web3Forms Access Key</label>
                                <div className="relative">
                                    <input
                                        type={showTokens.web3forms ? 'text' : 'password'}
                                        value={config.web3formsKey}
                                        onChange={(e) => setConfig({ ...config, web3formsKey: e.target.value })}
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => toggleShowToken('web3forms')}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showTokens.web3forms ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email Address</label>
                                <input
                                    type="email"
                                    value={config.adminEmail}
                                    onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                                    placeholder="your@email.com"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => testNotification('email')}
                            disabled={testing === 'email' || !config.web3formsKey}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            <TestTube size={16} className="mr-2" />
                            {testing === 'email' ? 'Sending...' : 'Test Email'}
                        </button>
                    </div>
                )}
            </div>

            {/* Telegram Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mr-4">
                                <Send className="text-sky-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Telegram Notifications</h3>
                                <p className="text-sm text-gray-500">Instant alerts via Telegram bot</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.telegramEnabled}
                                onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>
                </div>

                {config.telegramEnabled && (
                    <div className="p-6 bg-gray-50 space-y-4">
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex items-start">
                            <Info size={20} className="text-sky-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-sky-800">
                                <p className="font-medium">How to setup Telegram Bot:</p>
                                <ol className="mt-2 list-decimal list-inside space-y-1">
                                    <li>Message <a href="https://t.me/BotFather" target="_blank" className="underline">@BotFather</a> on Telegram</li>
                                    <li>Send /newbot and follow instructions</li>
                                    <li>Copy the Bot Token</li>
                                    <li>Message your bot, then visit API to get Chat ID</li>
                                </ol>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                                <div className="relative">
                                    <input
                                        type={showTokens.telegram ? 'text' : 'password'}
                                        value={config.telegramBotToken}
                                        onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                        className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-sky-500"
                                    />
                                    <button
                                        onClick={() => toggleShowToken('telegram')}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showTokens.telegram ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                                <input
                                    type="text"
                                    value={config.telegramChatId}
                                    onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                                    placeholder="123456789"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => testNotification('telegram')}
                            disabled={testing === 'telegram' || !config.telegramBotToken || !config.telegramChatId}
                            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 flex items-center"
                        >
                            <TestTube size={16} className="mr-2" />
                            {testing === 'telegram' ? 'Sending...' : 'Test Telegram'}
                        </button>
                    </div>
                )}
            </div>

            {/* Browser Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                                <Bell className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Browser Notifications</h3>
                                <p className="text-sm text-gray-500">Desktop alerts when logged in</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={requestBrowserNotification}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                                Enable
                            </button>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.browserNotificationsEnabled}
                                    onChange={(e) => setConfig({ ...config, browserNotificationsEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Documentation Link */}
            {config.whatsappApiUrl && (
                <div className="text-center text-sm text-gray-500">
                    <a
                        href={`${config.whatsappApiUrl}/api-docs`}
                        target="_blank"
                        className="inline-flex items-center hover:text-blue-600"
                    >
                        <ExternalLink size={14} className="mr-1" /> View WhatsApp API Documentation
                    </a>
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
