import { Lead, Product, User, MediaItem, SiteConfig } from '../types';
import { INITIAL_LEADS, PRODUCTS as INITIAL_PRODUCTS, DEFAULT_SITE_CONFIG } from '../constants';

const API_URL = '/api';

// Fallback Keys
const LEADS_KEY = 'dthstore_leads_v2';
const PRODUCTS_KEY = 'dthstore_products_v1';
const USER_SESSION_KEY = 'dthstore_user_session';
const SITE_CONFIG_KEY = 'dthstore_site_config_v1';

// Helpers for LocalStorage Fallback
const getLocal = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};
const setLocal = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

// --- Auth Operations --- 
const USERS: Record<string, User & { password: string }> = {
    'admin': { id: 'u1', username: 'admin', password: '123', name: 'Super Admin', role: 'ADMIN' },
    'staff': { id: 'u2', username: 'staff', password: '123', name: 'Sales Executive', role: 'STAFF' }
};

export const loginUser = (username: string, password: string): User | null => {
    const user = USERS[username];
    if (user && user.password === password) {
        const { password, ...safeUser } = user;
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

export const getLeads = async (): Promise<Lead[]> => {
    return apiCall(fetch(`${API_URL}/leads`), () => getLocal(LEADS_KEY, INITIAL_LEADS));
};

export const saveLead = async (lead: Lead): Promise<Lead> => {
    return apiCall(
        fetch(`${API_URL}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }),
        () => {
            const leads = getLocal(LEADS_KEY, INITIAL_LEADS);
            const newLeads = [lead, ...leads];
            setLocal(LEADS_KEY, newLeads);
            return lead;
        }
    );
};

export const updateLead = async (updatedLead: Lead): Promise<Lead[]> => {
    return apiCall(
        fetch(`${API_URL}/leads/${updatedLead.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedLead) }),
        () => {
            const leads = getLocal<Lead[]>(LEADS_KEY, INITIAL_LEADS);
            const newLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
            setLocal(LEADS_KEY, newLeads);
            return newLeads;
        }
    );
};

export const deleteLead = async (leadId: string): Promise<Lead[]> => {
    return apiCall(
        fetch(`${API_URL}/leads/${leadId}`, { method: 'DELETE' }),
        () => {
            const leads = getLocal<Lead[]>(LEADS_KEY, INITIAL_LEADS);
            const newLeads = leads.filter(l => l.id !== leadId);
            setLocal(LEADS_KEY, newLeads);
            return newLeads;
        }
    );
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

// --- Config operations ---
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

// Keeping Media mostly local
export const getMediaCatalog = (): MediaItem[] => [];
export const saveMediaItem = (item: MediaItem) => [item];
export const deleteMediaItem = (id: string) => [];
