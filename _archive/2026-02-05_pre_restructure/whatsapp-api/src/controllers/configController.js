const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure settings file exists
if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
        facebookVerifyToken: 'dthstore_fb_token',
        facebookPageAccessToken: ''
    }, null, 2));
}

const getSettings = (req, res) => {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(data);
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSettings = (req, res) => {
    try {
        const updates = req.body;
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        const currentSettings = JSON.parse(data);

        const newSettings = { ...currentSettings, ...updates };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));

        res.json({ success: true, settings: newSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Internal Helper to read settings synchronously
const getSettingsSync = () => {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
    } catch (e) { console.error('Error reading settings', e); }
    return {};
}

module.exports = {
    getSettings,
    updateSettings,
    getSettingsSync
};
