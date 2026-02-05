
import { Lead, LeadStatus, Operator, ServiceType, SiteConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'
];

export const DTH_OPERATORS = [
  Operator.TATA_PLAY,
  Operator.AIRTEL_DTH,
  Operator.DISH_TV,
  Operator.VIDEOCON_D2H
];

export const BROADBAND_OPERATORS = [
  Operator.JIO_FIBER,
  Operator.AIRTEL_XSTREAM,
  Operator.ACT_FIBERNET,
  Operator.OTHER
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    location: 'Mumbai',
    serviceType: ServiceType.DTH,
    operator: Operator.TATA_PLAY,
    status: LeadStatus.NEW,
    source: 'Website',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'lead-2',
    name: 'Priya Verma',
    mobile: '9988776655',
    location: 'Delhi',
    serviceType: ServiceType.BROADBAND,
    operator: Operator.JIO_FIBER,
    status: LeadStatus.CONTACTED,
    source: 'WhatsApp',
    createdAt: Date.now() - 5000000
  },
  {
    id: 'lead-3',
    name: 'Amit Kumar',
    mobile: '8877665544',
    location: 'Bangalore',
    serviceType: ServiceType.BROADBAND,
    operator: Operator.AIRTEL_XSTREAM,
    status: LeadStatus.INSTALLED,
    source: 'Website',
    createdAt: Date.now() - 20000000,
    orderId: 'ORD-2024-001'
  }
];

export const PRODUCTS = [
  {
    id: 'p1',
    title: 'Tata Play HD Set Top Box',
    price: '₹1,499',
    originalPrice: '₹2,500',
    type: 'DTH',
    features: ['1 Month Pack Free', 'Free Installation', '1 Year Warranty', 'Full HD 1080p'],
    image: '/products/tata-play-hd.png',
    color: 'bg-pink-600',
    isBestSeller: true
  },
  {
    id: 'p2',
    title: 'Airtel Digital TV HD Box',
    price: '₹1,299',
    originalPrice: '₹2,100',
    type: 'DTH',
    features: ['Free Installation', 'Standard Definition', 'Dolby Digital Sound', 'Record Support'],
    image: '/products/airtel-dtv-hd.png',
    color: 'bg-red-600'
  },
  {
    id: 'p3',
    title: 'Dish TV HD Connection',
    price: '₹1,190',
    originalPrice: '₹1,999',
    type: 'DTH',
    features: ['Lifetime Warranty', '50+ HD Channels', 'Stereo Sound', 'Next Day Installation'],
    image: '/products/dish-tv-hd.png',
    color: 'bg-green-600'
  },
  {
    id: 'p4',
    title: 'Jio Fiber Postpaid',
    price: '₹399/mo',
    originalPrice: '₹699',
    type: 'Broadband',
    features: ['30 Mbps Speed', 'Free 4K Set Top Box', 'Unlimited Data', 'Free Voice Calls'],
    image: '/products/jio-fiber.png',
    color: 'bg-blue-600',
    isBestSeller: true
  },
  {
    id: 'p5',
    title: 'Airtel Xstream Fiber',
    price: '₹499/mo',
    originalPrice: '₹799',
    type: 'Broadband',
    features: ['40 Mbps Speed', 'Xstream Box Included', 'Unlimited Calls', 'WiFi Router Free'],
    image: '/products/airtel-xstream.png',
    color: 'bg-red-700'
  },
  {
    id: 'p6',
    title: 'Videocon d2h HD',
    price: '₹1,350',
    originalPrice: '₹2,200',
    type: 'DTH',
    features: ['Gold Pack Free', 'Radio Channels', 'Mosaic Function', 'Active Services'],
    image: '/products/videocon-d2h.png',
    color: 'bg-purple-600'
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  logoText: "DTH Store",
  logoColorClass: "text-blue-600",
  logoImage: "",
  navLinks: [
    { id: 'n1', label: 'Home', target: 'home' },
    { id: 'n2', label: 'Plans', target: 'products' },
    { id: 'n3', label: 'Special Offers', target: 'offers', isSpecial: true },
    { id: 'n4', label: 'Contact', target: 'book-now' }
  ],
  heroSlides: [
    {
      id: 's1',
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop",
      title: "India's #1 DTH Service Provider",
      subtitle: "Get Tata Play, Airtel, Dish TV with Exclusive Offers.",
      cta: "Book Free Installation"
    },
    {
      id: 's2',
      image: "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=2071&auto=format&fit=crop",
      title: "Super Fast WiFi Broadband",
      subtitle: "Fiber connection starting at just ₹399/month.",
      cta: "Check Availability"
    },
    {
      id: 's3',
      image: "https://images.unsplash.com/photo-1621944626154-7128148b8159?q=80&w=2070&auto=format&fit=crop",
      title: "Watch 4K & HD Channels",
      subtitle: "Upgrade your entertainment experience today.",
      cta: "Get Best Deal"
    }
  ],
  specialOfferImages: {
    heroBackground: "https://images.unsplash.com/photo-1593305841991-05c29736f87e?q=80&w=2070&auto=format&fit=crop",
    sideImage: "https://images.unsplash.com/photo-1595935736128-db1f0a261963?q=80&w=2070&auto=format&fit=crop"
  }
};
