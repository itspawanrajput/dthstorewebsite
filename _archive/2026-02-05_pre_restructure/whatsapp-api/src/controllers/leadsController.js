const fs = require('fs');
const path = require('path');
const { sessions } = require('../sessions');

const DATA_DIR = path.join(__dirname, '../../data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure leads file exists
if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

const getLeads = (req, res) => {
    try {
        const data = fs.readFileSync(LEADS_FILE, 'utf8');
        const leads = JSON.parse(data);
        res.json({ success: true, leads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addLead = async (req, res) => {
    try {
        const lead = req.body;

        // Simple validation
        if (!lead.name || !lead.mobile) {
            return res.status(400).json({ success: false, message: 'Name and mobile are required' });
        }

        const data = fs.readFileSync(LEADS_FILE, 'utf8');
        const leads = JSON.parse(data);

        // Add timestamp and ID if missing
        if (!lead.id) lead.id = 'lead_' + Date.now();
        if (!lead.createdAt) lead.createdAt = Date.now();
        if (!lead.source) lead.source = 'Manual';

        leads.unshift(lead); // Add to top

        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

        // NOTE: We do NOT notifyAdmin here for manual leads, because the Frontend 
        // (App.tsx) handles notifications (Email, Telegram, and WhatsApp via client API).
        // This avoids double notifications.

        res.json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const axios = require('axios');
const { getSettingsSync } = require('./configController');

const facebookWebhookVerification = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const settings = getSettingsSync();
    const VERIFY_TOKEN = settings.facebookVerifyToken || 'dthstore_fb_token';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

const facebookWebhook = async (req, res) => {
    try {
        const body = req.body;
        console.log('Received webhook:', JSON.stringify(body, null, 2));

        if (body.object === 'page') {
            res.status(200).send('EVENT_RECEIVED'); // Acknowledge quickly

            const settings = getSettingsSync();
            const accessToken = settings.facebookPageAccessToken;

            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'leadgen') {
                        const leadGenId = change.value.leadgen_id;
                        let leadData = {
                            id: 'fb_' + leadGenId,
                            name: 'Facebook Lead (' + leadGenId + ')',
                            mobile: 'Check FB',
                            serviceType: 'Unknown',
                            operator: 'Unknown',
                            status: 'New',
                            source: 'Facebook',
                            createdAt: Date.now(),
                            raw: change.value
                        };

                        // 🚀 Fetch Details from Graph API if Token exists
                        if (accessToken) {
                            try {
                                const fbRes = await axios.get(`https://graph.facebook.com/v19.0/${leadGenId}?access_token=${accessToken}`);
                                const fbData = fbRes.data;

                                // Map Fields (Standard Graph API logic)
                                // fbData.field_data is array: [{ name: "full_name", values: ["John"] }, ...]
                                if (fbData.field_data) {
                                    fbData.field_data.forEach(field => {
                                        if (field.name.includes('name')) leadData.name = field.values[0];
                                        if (field.name.includes('phone') || field.name.includes('number')) leadData.mobile = field.values[0];
                                        if (field.name.includes('city') || field.name.includes('location')) leadData.location = field.values[0];
                                        if (field.name.includes('service') || field.name.includes('plan')) leadData.serviceType = field.values[0];
                                    });
                                }
                            } catch (apiErr) {
                                console.error('FB Graph API Error:', apiErr.response?.data || apiErr.message);
                                leadData.name += ' [Fetch Failed]';
                            }
                        }

                        // Save
                        const data = fs.readFileSync(LEADS_FILE, 'utf8');
                        const leads = JSON.parse(data);
                        // Verify uniqueness
                        if (!leads.find(l => l.id === leadData.id)) {
                            leads.unshift(leadData);
                            fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
                            notifyAdmin(leadData);
                        }
                    }
                }
            }
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        if (!res.headersSent) res.sendStatus(500);
    }
};

const notifyAdmin = async (lead) => {
    try {
        // Config - Hardcoded for simplicity or env vars
        const SESSION_ID = 'DTHSTORE';
        const ADMIN_NUMBER = '919311252564'; // Your number

        const client = sessions.get(SESSION_ID);
        if (!client) {
            console.log('WhatsApp Notification Skipped: Session not active');
            return;
        }

        const chatId = `${ADMIN_NUMBER}@c.us`;
        const message = `🔔 *New Lead Received*\n\n` +
            `👤 Name: ${lead.name}\n` +
            `📱 Mobile: ${lead.mobile}\n` +
            `🌐 Source: ${lead.source}\n` +
            `📅 Time: ${new Date(lead.createdAt).toLocaleString()}\n\n` +
            `Check dashboard for details.`;

        await client.sendMessage(chatId, message);
        console.log('WhatsApp Notification Sent');
    } catch (err) {
        console.error('Failed to send WhatsApp notification', err);
    }
};

const updateLead = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const data = fs.readFileSync(LEADS_FILE, 'utf8');
        let leads = JSON.parse(data);

        const index = leads.findIndex(l => l.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        leads[index] = { ...leads[index], ...updates };
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

        res.json({ success: true, lead: leads[index] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteLead = (req, res) => {
    try {
        const { id } = req.params;

        const data = fs.readFileSync(LEADS_FILE, 'utf8');
        let leads = JSON.parse(data);

        const newLeads = leads.filter(l => l.id !== id);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(newLeads, null, 2));

        res.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getLeads,
    addLead,
    updateLead,
    deleteLead,
    facebookWebhookVerification,
    facebookWebhook
};
