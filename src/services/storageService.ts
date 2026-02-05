import { Lead, Product, User, MediaItem, SiteConfig, NotificationConfig } from '../types';
import { INITIAL_LEADS, PRODUCTS as INITIAL_PRODUCTS, DEFAULT_SITE_CONFIG } from '../constants';

const API_URL = '/api';

// Fallback Keys
const LEADS_KEY = 'dthstore_leads_v2';
const PRODUCTS_KEY = 'dthstore_products_v1';
const USER_SESSION_KEY = 'dthstore_user_session';
const SITE_CONFIG_KEY = 'dthstore_site_config_v1';
const NOTIFICATION_CONFIG_KEY = 'dthstore_notification_config_v1';

// Default Notification Config
const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
    emailEnabled: false,
    web3formsKey: '',
    adminEmail: '',
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    whatsappEnabled: false,
    whatsappApiUrl: import.meta.env.VITE_WHATSAPP_API_URL || '',
    whatsappApiKey: '',
    whatsappSessionId: 'DTHSTORE',
    whatsappAdminNumber: '',
    browserNotificationsEnabled: true
};

// Check if demo mode is enabled
const isDemoMode = (): boolean => {
    const demoMode = import.meta.env.VITE_DEMO_MODE;
    return demoMode === 'true' || demoMode === true || demoMode === undefined;
};

// Demo credentials (only used in demo mode)
interface DemoUser extends User {
    password: string;
}

const DEMO_USERS: Record<string, DemoUser> = {
    'admin': { id: 'demo-admin', username: 'admin', password: 'admin123', name: 'Demo Admin', role: 'ADMIN' },
    'staff': { id: 'demo-staff', username: 'staff', password: 'staff123', name: 'Demo Staff', role: 'STAFF' },
    'admin@demo.com': { id: 'demo-admin', username: 'admin@demo.com', password: 'admin123', name: 'Demo Admin', role: 'ADMIN' },
    'staff@demo.com': { id: 'demo-staff', username: 'staff@demo.com', password: 'staff123', name: 'Demo Staff', role: 'STAFF' }
};

// Helpers for LocalStorage Fallback
const getLocal = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};
const setLocal = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

// --- Auth Operations --- 

/**
 * Login user with username/email and password
 * Only works in demo mode for testing purposes
 */
export const loginUser = (usernameOrEmail: string, password: string): User | null => {
    if (!isDemoMode()) {
        console.warn('Demo login is disabled. Use Firebase authentication.');
        return null;
    }

    // Normalize input
    const normalizedInput = usernameOrEmail.toLowerCase().trim();

    // Try direct lookup first
    let demoUser = DEMO_USERS[normalizedInput];

    // If not found and looks like email, try extracting username
    if (!demoUser && normalizedInput.includes('@')) {
        const usernameFromEmail = normalizedInput.split('@')[0];
        demoUser = DEMO_USERS[usernameFromEmail];
    }

    if (demoUser && demoUser.password === password) {
        const { password: _, ...safeUser } = demoUser;
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(safeUser));
        return safeUser;
    }
    return null;
};

export const logoutUser = () => localStorage.removeItem(USER_SESSION_KEY);

export const getCurrentUser = (): User | null => {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
};

// --- API Helpers ---
async function apiCall<T>(p: Promise<Response>, fallback: () => T): Promise<T> {
    try {
        const res = await p;
        if (!res.ok) throw new Error('API Error');
        return await res.json();
    } catch (e) {
        console.warn("API Unreachable, using LocalStorage fallback", e);
        return fallback();
    }
}

// --- Leads Operations ---

// Helper to get remote config
const getRemote = () => {
    const c = getNotificationConfig();
    if (c.whatsappEnabled && c.whatsappApiUrl) {
        return {
            url: c.whatsappApiUrl.replace(/\/$/, ''), // Remove trailing slash
            headers: {
                'Content-Type': 'application/json',
                ...(c.whatsappApiKey ? { 'x-api-key': c.whatsappApiKey } : {})
            }
        };
    }
    return null;
}

export const getLeads = async (): Promise<Lead[]> => {
    const remote = getRemote();
    if (remote) {
        try {
            const res = await fetch(`${remote.url}/leads`, { headers: remote.headers });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.leads)) return data.leads;
            }
        } catch (e) {
            console.warn("Remote leads fetch failing, falling back to local", e);
        }
    }
    // Fallback to local
    return getLocal(LEADS_KEY, INITIAL_LEADS);
};

export const saveLead = async (lead: Lead): Promise<Lead> => {
    const remote = getRemote();
    if (remote) {
        try {
            const res = await fetch(`${remote.url}/leads`, {
                method: 'POST',
                headers: remote.headers,
                body: JSON.stringify(lead)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) return data.lead;
            }
        } catch (e) {
            console.warn("Remote save failed, saving locally", e);
        }
    }

    // Local save (Fallback)
    const leads = getLocal<Lead[]>(LEADS_KEY, INITIAL_LEADS);
    const newLeads = [lead, ...leads];
    setLocal(LEADS_KEY, newLeads);
    return lead;
};

export const updateLead = async (updatedLead: Lead): Promise<Lead[]> => {
    const remote = getRemote();
    if (remote) {
        try {
            const res = await fetch(`${remote.url}/leads/${updatedLead.id}`, {
                method: 'PUT',
                headers: remote.headers,
                body: JSON.stringify(updatedLead)
            });
            if (res.ok) {
                // If remote update success, fetch fresh list
                return getLeads();
            }
        } catch (e) { console.warn("Remote update failed", e); }
    }

    // Local Logic
    const leads = getLocal<Lead[]>(LEADS_KEY, INITIAL_LEADS);
    const newLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
    setLocal(LEADS_KEY, newLeads);
    return newLeads;
};

export const deleteLead = async (leadId: string): Promise<Lead[]> => {
    const remote = getRemote();
    if (remote) {
        try {
            await fetch(`${remote.url}/leads/${leadId}`, {
                method: 'DELETE',
                headers: remote.headers
            });
            // Fetch fresh list
            return getLeads();
        } catch (e) { console.warn("Remote delete failed", e); }
    }

    // Local Logic
    const leads = getLocal<Lead[]>(LEADS_KEY, INITIAL_LEADS);
    const newLeads = leads.filter(l => l.id !== leadId);
    setLocal(LEADS_KEY, newLeads);
    return newLeads;
};


// --- Product Operations ---

export const getProducts = (): Product[] => {
    return getLocal(PRODUCTS_KEY, INITIAL_PRODUCTS as Product[]);
};

export const saveProduct = async (product: Product): Promise<Product[]> => {
    return apiCall(
        fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) }),
        () => {
            const products = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS as Product[]);
            const newProducts = [product, ...products];
            setLocal(PRODUCTS_KEY, newProducts);
            return newProducts;
        }
    );
};

export const deleteProduct = async (id: string): Promise<Product[]> => {
    return apiCall(
        fetch(`${API_URL}/products/${id}`, { method: 'DELETE' }),
        () => {
            const products = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS as Product[]);
            const newProducts = products.filter(p => p.id !== id);
            setLocal(PRODUCTS_KEY, newProducts);
            return newProducts;
        }
    );
};

// --- Site Config operations ---
export const getSiteConfig = async (): Promise<SiteConfig> => {
    return apiCall(fetch(`${API_URL}/config`), () => getLocal(SITE_CONFIG_KEY, DEFAULT_SITE_CONFIG));
}

export const saveSiteConfig = async (config: SiteConfig): Promise<SiteConfig> => {
    return apiCall(
        fetch(`${API_URL}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) }),
        () => {
            setLocal(SITE_CONFIG_KEY, config);
            return config;
        }
    );
}

// --- Notification Config operations ---
export const getNotificationConfig = (): NotificationConfig => {
    return getLocal(NOTIFICATION_CONFIG_KEY, DEFAULT_NOTIFICATION_CONFIG);
};

export const saveNotificationConfig = (config: NotificationConfig): NotificationConfig => {
    setLocal(NOTIFICATION_CONFIG_KEY, config);
    return config;
};

// Media operations (stub - primarily using external image URLs)
export const getMediaCatalog = (): MediaItem[] => {
    return getLocal<MediaItem[]>('dthstore_media', []);
};

export const saveMediaItem = (item: MediaItem): MediaItem[] => {
    const media = getMediaCatalog();
    const newMedia = [item, ...media];
    setLocal('dthstore_media', newMedia);
    return newMedia;
};

export const deleteMediaItem = (id: string): MediaItem[] => {
    const media = getMediaCatalog();
    const newMedia = media.filter(m => m.id !== id);
    setLocal('dthstore_media', newMedia);
    return newMedia;
};
