
export enum ServiceType {
  DTH = 'DTH Connection',
  BROADBAND = 'WiFi / Broadband'
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  INTERESTED = 'Interested',
  INSTALLED = 'Installed',
  CANCELLED = 'Cancelled'
}

export enum Operator {
  TATA_PLAY = 'Tata Play',
  AIRTEL_DTH = 'Airtel Digital TV',
  DISH_TV = 'Dish TV',
  VIDEOCON_D2H = 'Videocon d2h',
  JIO_FIBER = 'Jio Fiber',
  AIRTEL_XSTREAM = 'Airtel Xstream',
  ACT_FIBERNET = 'ACT Fibernet',
  OTHER = 'Other'
}

export interface LeadNote {
  id: string;
  text: string;
  createdAt: number;
  createdBy: string;
}

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  location: string;
  serviceType: ServiceType;
  operator: Operator;
  status: LeadStatus;
  source: 'Website' | 'WhatsApp' | 'Manual';
  createdAt: number;
  notes?: LeadNote[];
  followUpDate?: number;
  orderId?: string;
}

export interface SalesScriptResponse {
  whatsappMessage: string;
  callScript: string;
}

// --- New Types for Product & Auth ---

export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice: string;
  type: 'DTH' | 'Broadband';
  features: string[];
  image: string;
  color: string; // Tailwind class for bottom border
  isBestSeller?: boolean;
}

// --- CMS / Site Config Types ---

export interface MediaItem {
  id: string;
  data: string; // Base64 string or URL
  name: string;
  createdAt: number;
}

export interface NavLink {
  id: string;
  label: string;
  target: string; // View name or ID
  isSpecial?: boolean; // For highlighted buttons
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}

export interface SiteConfig {
  logoText: string;
  logoColorClass: string;
  logoImage?: string;
  navLinks: NavLink[];
  heroSlides: HeroSlide[];
  specialOfferImages: {
    heroBackground: string;
    sideImage: string;
  };
}
