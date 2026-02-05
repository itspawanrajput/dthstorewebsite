import React, { useState, useEffect } from 'react';
import { NotificationConfig } from '../../types';
import { getNotificationConfig, saveNotificationConfig } from '../../services/storageService';
import {
    Bell, Mail, MessageCircle, Send, Save, CheckCircle, AlertCircle,
    ExternalLink, Eye, EyeOff, Info, TestTube, Server, QrCode
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
    const [whatsappStatus, setWhatsappStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'checking'>('unknown');

    useEffect(() => {
        const savedConfig = getNotificationConfig();
        setConfig(savedConfig);
    }, []);

    const handleSave = () => {
        saveNotificationConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggleShowToken = (field: string) => {
        setShowTokens(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const checkWhatsAppStatus = async () => {
        if (!config.whatsappApiUrl) return;

        setWhatsappStatus('checking');
        try {
            const headers: Record<string, string> = {};
            if (config.whatsappApiKey) {
                headers['x-api-key'] = config.whatsappApiKey;
            }

            const response = await fetch(
                `${config.whatsappApiUrl}/session/status/${config.whatsappSessionId}`,
                { headers }
            );
            const data = await response.json();
            setWhatsappStatus(data.state === 'CONNECTED' ? 'connected' : 'disconnected');
        } catch {
            setWhatsappStatus('disconnected');
        }
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
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };
                if (config.whatsappApiKey) {
                    headers['x-api-key'] = config.whatsappApiKey;
                }

                const response = await fetch(
                    `${config.whatsappApiUrl}/client/sendMessage/${config.whatsappSessionId}`,
                    {
                        method: 'POST',
                        headers,
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

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
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
                    <button onClick={() => setTestResult(null)} className="ml-auto text-gray-500 hover:text-gray-700">×</button>
                </div>
            )}

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
                                    <li>Message your bot, then visit: api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</li>
                                    <li>Find your Chat ID in the response</li>
                                </ol>
                            </div>
                        </div>
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

            {/* WhatsApp Section - Self-Hosted API */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                <MessageCircle className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">WhatsApp Notifications</h3>
                                <p className="text-sm text-gray-500">Self-hosted WhatsApp API (whatsapp-web.js)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {whatsappStatus !== 'unknown' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${whatsappStatus === 'connected' ? 'bg-green-100 text-green-800' :
                                        whatsappStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {whatsappStatus === 'connected' ? '● Connected' :
                                        whatsappStatus === 'checking' ? '● Checking...' :
                                            '● Disconnected'}
                                </span>
                            )}
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
                    <div className="p-6 bg-gray-50 space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                            <Server size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-green-800">
                                <p className="font-medium">Self-hosted WhatsApp API:</p>
                                <p className="mt-1">Your WhatsApp API is running on AWS EC2. Enter the server details below.</p>
                                <a
                                    href={config.whatsappApiUrl ? `${config.whatsappApiUrl}/api-docs` : '#'}
                                    target="_blank"
                                    className="inline-flex items-center mt-2 underline"
                                >
                                    View API Documentation <ExternalLink size={14} className="ml-1" />
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Server URL</label>
                                <input
                                    type="text"
                                    value={config.whatsappApiUrl}
                                    onChange={(e) => setConfig({ ...config, whatsappApiUrl: e.target.value })}
                                    placeholder="http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:3000"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key (optional)</label>
                                <div className="relative">
                                    <input
                                        type={showTokens.whatsapp ? 'text' : 'password'}
                                        value={config.whatsappApiKey}
                                        onChange={(e) => setConfig({ ...config, whatsappApiKey: e.target.value })}
                                        placeholder="Your API key"
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={config.whatsappAdminNumber}
                                    onChange={(e) => setConfig({ ...config, whatsappAdminNumber: e.target.value })}
                                    placeholder="919311252564"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Include country code without + (e.g., 91 for India)</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={checkWhatsAppStatus}
                                disabled={!config.whatsappApiUrl}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                            >
                                <Server size={16} className="mr-2" />
                                Check Status
                            </button>
                            <a
                                href={config.whatsappApiUrl ? `${config.whatsappApiUrl}/session/qr/${config.whatsappSessionId}/image` : '#'}
                                target="_blank"
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                            >
                                <QrCode size={16} className="mr-2" />
                                View QR Code
                            </a>
                            <button
                                onClick={() => testNotification('whatsapp')}
                                disabled={testing === 'whatsapp' || !config.whatsappApiUrl || !config.whatsappAdminNumber}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                                <TestTube size={16} className="mr-2" />
                                {testing === 'whatsapp' ? 'Sending...' : 'Test WhatsApp'}
                            </button>
                        </div>
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
        </div>
    );
};

export default NotificationSettings;
