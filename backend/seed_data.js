require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Offer = require('./models/Offer');
const Agent = require('./models/Agent');
const Lead = require('./models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp-crm';

const SMARTPHONES = [
  {
    productId: 'phone_apple_16pro',
    name: 'Apple iPhone 16 Pro',
    brand: 'Apple',
    category: 'Smartphone',
    price: 119900,
    offerPrice: 114900,
    stock: 8,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo_dp.png',
    colors: [
      { name: 'Desert Titanium', hex: '#d4af37', inStock: true },
      { name: 'Natural Titanium', hex: '#8a8d8f', inStock: true },
      { name: 'Black Titanium', hex: '#232b2b', inStock: true }
    ],
    specs: {
      display: '6.3" Super Retina XDR OLED ProMotion 120Hz',
      processor: 'Apple A18 Pro Bionic Chip',
      ram: '8GB Unified',
      storage: '128GB / 256GB / 512GB',
      rearCamera: '48MP Fusion + 48MP Ultra-wide + 12MP 5x Telephoto',
      frontCamera: '12MP TrueDepth Autofocus',
      battery: '3582 mAh with 25W MagSafe Fast Charge',
      fiveG: true
    },
    scores: { camera: 99, gaming: 97, battery: 90, performance: 99, business: 96 },
    features: ['Grade 5 Titanium Body', 'Camera Control Button', 'Apple Intelligence Ready', 'Action Button']
  },
  {
    productId: 'phone_apple_15',
    name: 'Apple iPhone 15',
    brand: 'Apple',
    category: 'Smartphone',
    price: 69900,
    offerPrice: 59999,
    stock: 12,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo_dp.png',
    colors: [
      { name: 'Black', hex: '#000000', inStock: true },
      { name: 'Blue', hex: '#a2c2e8', inStock: true },
      { name: 'Pink', hex: '#fbd7db', inStock: true }
    ],
    specs: {
      display: '6.1" Super Retina XDR OLED Dynamic Island',
      processor: 'Apple A16 Bionic Hexa-Core',
      ram: '6GB',
      storage: '128GB / 256GB',
      rearCamera: '48MP Main with 2x Telephoto + 12MP Ultra-wide',
      frontCamera: '12MP TrueDepth',
      battery: '3349 mAh All-Day Power with USB-C',
      fiveG: true
    },
    scores: { camera: 93, gaming: 90, battery: 88, performance: 93, business: 92 },
    features: ['Dynamic Island', '48MP High-Res Sensor', 'Color-Infused Back Glass', 'Universal USB-C']
  },
  {
    productId: 'phone_apple_13',
    name: 'Apple iPhone 13',
    brand: 'Apple',
    category: 'Smartphone',
    price: 49900,
    offerPrice: 42999,
    stock: 15,
    specs: {
      display: '6.1" Super Retina XDR OLED',
      processor: 'Apple A15 Bionic',
      ram: '4GB',
      storage: '128GB',
      rearCamera: '12MP Dual with Sensor-Shift OIS',
      frontCamera: '12MP TrueDepth',
      battery: '3240 mAh with 20W Fast Charging',
      fiveG: true
    },
    scores: { camera: 88, gaming: 86, battery: 85, performance: 88, business: 90 },
    features: ['Cinematic Video Mode', 'Ceramic Shield Front', 'IP68 Water Resistance']
  },
  {
    productId: 'phone_sam_s24ultra',
    name: 'Samsung Galaxy S24 Ultra 5G',
    brand: 'Samsung',
    category: 'Smartphone',
    price: 129999,
    offerPrice: 119999,
    stock: 7,
    specs: {
      display: '6.8" QHD+ Dynamic AMOLED 2X 120Hz (2600 nits)',
      processor: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB LPDDR5X',
      storage: '256GB / 512GB',
      rearCamera: '200MP Quad Camera with 5x Optical Periscope OIS',
      frontCamera: '12MP Dual Pixel AF',
      battery: '5000 mAh with 45W Ultra Fast Charging',
      fiveG: true
    },
    scores: { camera: 99, gaming: 98, battery: 96, performance: 99, business: 99 },
    features: ['Galaxy AI (Live Translate, Circle to Search)', 'Integrated S-Pen Stylus', 'Titanium Frame', 'Gorilla Armor Anti-Reflective Glass']
  },
  {
    productId: 'phone_sam_a55',
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    category: 'Smartphone',
    price: 39999,
    offerPrice: 34999,
    stock: 14,
    specs: {
      display: '6.6" FHD+ Super AMOLED 120Hz (Vision Booster)',
      processor: 'Samsung Exynos 1480 with AMD Xclipse GPU',
      ram: '8GB',
      storage: '128GB / 256GB',
      rearCamera: '50MP OIS + 12MP Ultra-wide + 5MP Macro',
      frontCamera: '32MP High-Res Selfie',
      battery: '5000 mAh with 25W Charging',
      fiveG: true
    },
    scores: { camera: 88, gaming: 84, battery: 94, performance: 86, business: 90 },
    features: ['Premium Metal Flat Frame', 'IP67 Water & Dust Resistance', 'Samsung Knox Vault', '4 OS Upgrades']
  },
  {
    productId: 'phone_sam_m35',
    name: 'Samsung Galaxy M35 5G',
    brand: 'Samsung',
    category: 'Smartphone',
    price: 21999,
    offerPrice: 17999,
    stock: 20,
    specs: {
      display: '6.6" FHD+ Super AMOLED 120Hz Display',
      processor: 'Exynos 1380 Octa-Core',
      ram: '6GB / 8GB',
      storage: '128GB',
      rearCamera: '50MP OIS No-Shake Camera',
      frontCamera: '13MP',
      battery: '6000 mAh Monster Battery',
      fiveG: true
    },
    scores: { camera: 83, gaming: 81, battery: 99, performance: 82, business: 84 },
    features: ['Massive 6000mAh Battery', 'Vapor Cooling Chamber', 'Knox Security']
  },
  {
    productId: 'phone_op_12',
    name: 'OnePlus 12 5G',
    brand: 'OnePlus',
    category: 'Smartphone',
    price: 64999,
    offerPrice: 59999,
    stock: 10,
    specs: {
      display: '6.82" 2K 120Hz ProXDR 4th Gen LTPO (4500 nits)',
      processor: 'Snapdragon 8 Gen 3 Flagship',
      ram: '12GB / 16GB LPDDR5X',
      storage: '256GB / 512GB',
      rearCamera: '50MP Sony LYT-808 + 64MP 3x Periscope Hasselblad',
      frontCamera: '32MP 4K Video',
      battery: '5400 mAh with 100W SuperVOOC & 50W AIRVOOC',
      fiveG: true
    },
    scores: { camera: 95, gaming: 98, battery: 97, performance: 98, business: 92 },
    features: ['Hasselblad 4th Gen Camera', 'Dual Cryo-velocity VC Liquid Cooling', 'Aqua Touch Display', '100W Turbo Charger Included']
  },
  {
    productId: 'phone_op_nord4',
    name: 'OnePlus Nord 4 5G',
    brand: 'OnePlus',
    category: 'Smartphone',
    price: 32999,
    offerPrice: 28999,
    stock: 18,
    specs: {
      display: '6.74" 1.5K AMOLED 120Hz Ultra-Bright',
      processor: 'Snapdragon 7+ Gen 3 Mobile Platform',
      ram: '8GB / 12GB',
      storage: '128GB / 256GB',
      rearCamera: '50MP Sony LYT-600 with OIS',
      frontCamera: '16MP',
      battery: '5500 mAh with 100W Flash Charge (0 to 100% in 28 mins)',
      fiveG: true
    },
    scores: { camera: 86, gaming: 93, battery: 98, performance: 92, business: 88 },
    features: ['Slim All-Metal Unibody Design', '4 Years Android OS Support', 'AI Best Face & AI Eraser']
  },
  {
    productId: 'phone_vivo_v40pro',
    name: 'Vivo V40 Pro 5G',
    brand: 'Vivo',
    category: 'Smartphone',
    price: 54999,
    offerPrice: 48999,
    stock: 9,
    specs: {
      display: '6.78" 1.5K 3D Curved AMOLED 120Hz (4500 nits)',
      processor: 'MediaTek Dimensity 9200+ 4nm Flagship',
      ram: '8GB / 12GB',
      storage: '256GB / 512GB',
      rearCamera: 'ZEISS All 50MP (50MP Main OIS + 50MP Telephoto 50x + 50MP Ultra-wide)',
      frontCamera: '50MP ZEISS Group Selfie AF',
      battery: '5500 mAh BlueVolt Battery with 80W FlashCharge',
      fiveG: true
    },
    scores: { camera: 99, gaming: 91, battery: 95, performance: 93, business: 88 },
    features: ['ZEISS Multifocal Professional Portrait', 'Aura Light Studio Flash', 'IP68 Water Resistance']
  },
  {
    productId: 'phone_vivo_t3x',
    name: 'Vivo T3x 5G',
    brand: 'Vivo',
    category: 'Smartphone',
    price: 15499,
    offerPrice: 12999,
    stock: 25,
    specs: {
      display: '6.72" 120Hz Ultra-Smooth FHD+ Display',
      processor: 'Snapdragon 6 Gen 1 (4nm)',
      ram: '4GB / 6GB / 8GB',
      storage: '128GB',
      rearCamera: '50MP HD Primary Camera',
      frontCamera: '8MP',
      battery: '6000 mAh Turbo Battery with 44W FlashCharge',
      fiveG: true
    },
    scores: { camera: 79, gaming: 84, battery: 99, performance: 81, business: 80 },
    features: ['Segment-Best 6000mAh Battery', 'Dual Stereo 300% Audio Boost', 'Slim 7.99mm Body']
  },
  {
    productId: 'phone_oppo_reno12pro',
    name: 'Oppo Reno 12 Pro 5G',
    brand: 'Oppo',
    category: 'Smartphone',
    price: 39999,
    offerPrice: 34999,
    stock: 11,
    specs: {
      display: '6.7" Infinite View Quad-Curved AMOLED 120Hz',
      processor: 'MediaTek Dimensity 7300-Energy (4nm)',
      ram: '12GB LPDDR4X',
      storage: '256GB / 512GB',
      rearCamera: '50MP Sony LYT-600 OIS + 50MP 2x Telephoto + 8MP Ultra-wide',
      frontCamera: '50MP Eye-AF Selfie',
      battery: '5000 mAh with 80W SuperVOOC Charge',
      fiveG: true
    },
    scores: { camera: 94, gaming: 85, battery: 91, performance: 86, business: 89 },
    features: ['GenAI AI Eraser 2.0 & AI Clarity', 'Sponge Bionic Drop-Resistant Cushioning', 'Splash Touch']
  },
  {
    productId: 'phone_xiaomi_14civi',
    name: 'Xiaomi 14 CIVI',
    brand: 'Xiaomi',
    category: 'Smartphone',
    price: 44999,
    offerPrice: 38999,
    stock: 8,
    specs: {
      display: '6.55" 1.5K Floating Quad-Curved AMOLED 120Hz Dolby Vision',
      processor: 'Snapdragon 8s Gen 3 4nm',
      ram: '8GB / 12GB LPDDR5X',
      storage: '256GB / 512GB UFS 4.0',
      rearCamera: 'Leica Summilux 50MP + 50MP 2x Portrait + 12MP 120° Ultra-wide',
      frontCamera: 'Dual 32MP + 32MP Ultra-wide Vlog Camera',
      battery: '4700 mAh with 67W Turbo Charge',
      fiveG: true
    },
    scores: { camera: 96, gaming: 94, battery: 88, performance: 95, business: 90 },
    features: ['Co-Engineered with Leica Optics', 'Dual Selfie Studio Cameras', 'Ultra Slim 7.4mm Premium Leather Body']
  },
  {
    productId: 'phone_realme_narzo70pro',
    name: 'Realme Narzo 70 Pro 5G',
    brand: 'Realme',
    category: 'Smartphone',
    price: 21999,
    offerPrice: 17999,
    stock: 16,
    specs: {
      display: '6.67" 120Hz Horizon OLED Display',
      processor: 'MediaTek Dimensity 7050 5G',
      ram: '8GB',
      storage: '128GB / 256GB',
      rearCamera: '50MP Sony IMX890 Flagship Sensor with OIS',
      frontCamera: '16MP',
      battery: '5000 mAh with 67W SUPERVOOC Charge',
      fiveG: true
    },
    scores: { camera: 89, gaming: 83, battery: 91, performance: 83, business: 81 },
    features: ['Flagship Sony IMX890 Camera', 'Air Gestures (Touchless Control)', 'Duo Touch Glass Finish']
  }
];

const ACCESSORIES = [
  {
    productId: 'acc_magsafe_case',
    name: 'MagSafe Shockproof Armor Case',
    brand: 'iTechnic Genuine',
    category: 'Accessory',
    subCategory: 'Mobile Cases / Covers',
    price: 799,
    offerPrice: 449,
    stock: 50,
    compatibleModels: ['Apple', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 16', 'Samsung Galaxy S24'],
    features: ['Drop-Tested Military Grade', 'Strong N52 Magnetic Ring', 'Anti-Yellowing TPU Coating']
  },
  {
    productId: 'acc_20w_pd_charger',
    name: '20W PD Type-C Super Fast Adapter',
    brand: 'iTechnic Certified',
    category: 'Accessory',
    subCategory: 'Chargers / Cables',
    price: 999,
    offerPrice: 599,
    stock: 60,
    compatibleModels: ['All', 'Apple', 'Samsung', 'OnePlus', 'Vivo', 'Google Pixel'],
    features: ['BIS Approved Surge Protection', 'Charges 50% in 30 mins', 'Compact Travel Friendly']
  },
  {
    productId: 'acc_65w_cable',
    name: '65W Fast Charging Nylon Braided Type-C Cable',
    brand: 'iTechnic Certified',
    category: 'Accessory',
    subCategory: 'Chargers / Cables',
    price: 399,
    offerPrice: 249,
    stock: 100,
    compatibleModels: ['All'],
    features: ['10,000+ Bend Tested', 'High-Speed 480Mbps Data Sync', 'Supports Warp & SuperVOOC']
  },
  {
    productId: 'acc_tempered_9d',
    name: '9D Edge-to-Edge HD Tempered Glass Guard',
    brand: 'iTechnic Care',
    category: 'Accessory',
    subCategory: 'Tempered Glass',
    price: 349,
    offerPrice: 199,
    stock: 150,
    compatibleModels: ['All'],
    features: ['9H Anti-Scratch Hardness', 'Oleophobic Anti-Fingerprint Layer', 'Bubble-Free Quick Install']
  },
  {
    productId: 'acc_tws_earbuds',
    name: 'True Wireless Stereo (TWS) Earbuds with ENC',
    brand: 'iTechnic Audio',
    category: 'Accessory',
    subCategory: 'Earbuds / Headphones',
    price: 1999,
    offerPrice: 999,
    stock: 35,
    compatibleModels: ['All'],
    features: ['36 Hours Extended Playtime', 'Environmental Noise Cancellation (ENC)', '13mm Deep Bass Drivers', 'Instant Bluetooth 5.3']
  },
  {
    productId: 'acc_powerbank_20k',
    name: '20,000 mAh 22.5W Fast Charging Power Bank',
    brand: 'iTechnic Power',
    category: 'Accessory',
    subCategory: 'Power Banks',
    price: 2499,
    offerPrice: 1499,
    stock: 30,
    compatibleModels: ['All'],
    features: ['Triple Output Ports (Type-C + 2x USB-A)', 'Digital LED Percentage Display', 'Flight Approved Safe Lithium-Polymer']
  },
  {
    productId: 'acc_smartwatch_ultra',
    name: 'iTechnic Ultra Pro 2.0" AMOLED Smartwatch',
    brand: 'iTechnic Wearables',
    category: 'Accessory',
    subCategory: 'Smart Watches',
    price: 3999,
    offerPrice: 1999,
    stock: 20,
    compatibleModels: ['All'],
    features: ['Clear HD Bluetooth Calling', 'Always-On AMOLED Display', 'Heart Rate & SpO2 Health Monitor', 'Zinc Alloy Armor Case']
  }
];

const OFFERS = [
  {
    offerId: 'OFF-HDFC-01',
    title: 'HDFC Bank Credit Card ₹5,000 Instant Discount',
    category: 'Bank Offers',
    description: 'Get flat ₹5,000 instant bank discount + 6 or 9 months No-Cost EMI on iPhone 15 & 16 series.',
    applicableBrands: ['Apple', 'Samsung'],
    bankName: 'HDFC Bank',
    cardType: 'Credit Card',
    discountType: 'FLAT',
    discountValue: 5000,
    minTransactionAmount: 50000,
    tenureMonths: [6, 9],
    isZeroCostEmi: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    terms: ['Valid on HDFC Credit Cards only', 'No-Cost EMI valid on 6 and 9 months tenure']
  },
  {
    offerId: 'OFF-ICICI-02',
    title: 'ICICI Bank 0% No-Cost EMI up to 12 Months',
    category: 'No-Cost EMI',
    description: 'Zero down-payment and zero interest EMI on Samsung Galaxy S24 and OnePlus 12 series.',
    applicableBrands: ['Samsung', 'OnePlus'],
    bankName: 'ICICI Bank',
    cardType: 'All',
    discountType: 'NO_COST_EMI',
    discountValue: 0,
    minTransactionAmount: 25000,
    tenureMonths: [3, 6, 9, 12],
    isZeroCostEmi: true,
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    terms: ['Interest amount credited upfront as instant checkout discount']
  },
  {
    offerId: 'OFF-EXCHANGE-03',
    title: 'Old Phone Exchange Super Bonus Up To ₹6,000',
    category: 'Exchange Bonus',
    description: 'Trade-in your old working smartphone of any brand and receive market value + flat ₹6,000 extra upgrade bonus.',
    applicableBrands: ['All', 'Apple', 'Samsung', 'OnePlus', 'Vivo', 'Oppo'],
    bankName: 'iTechnic Exchange Desk',
    cardType: 'All',
    discountType: 'EXCHANGE',
    discountValue: 6000,
    minTransactionAmount: 20000,
    tenureMonths: [],
    isZeroCostEmi: false,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    terms: ['Device must power on with intact touchscreen', 'Government ID verification required at store']
  },
  {
    offerId: 'OFF-BAJAJ-04',
    title: 'Bajaj Finserv Zero Downpayment Easy EMI',
    category: 'Regular EMI',
    description: 'Fast 5-minute in-store approval with zero paperwork on any mobile phone above ₹10,000.',
    applicableBrands: ['All'],
    bankName: 'Bajaj Finserv',
    cardType: 'All',
    discountType: 'FLAT',
    discountValue: 1000,
    minTransactionAmount: 10000,
    tenureMonths: [6, 8, 10, 12],
    isZeroCostEmi: true,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    terms: ['Valid with active Bajaj Insta EMI Card or PAN Card']
  }
];

const AGENTS = [
  {
    agentId: 'AGENT-101',
    name: 'Karthik Raja',
    phone: '919342400879',
    department: 'New Phone Sales & Inquiries',
    isOnline: true,
    activeChatsCount: 1,
    maxConcurrentChats: 5
  },
  {
    agentId: 'AGENT-102',
    name: 'Siva Kumar',
    phone: '919361863063',
    department: 'Order Status & Delivery Assistance',
    isOnline: true,
    activeChatsCount: 0,
    maxConcurrentChats: 5
  },
  {
    agentId: 'AGENT-103',
    name: 'Murali Tech',
    phone: '917904441760',
    department: 'Service, Repair & Warranty',
    isOnline: true,
    activeChatsCount: 2,
    maxConcurrentChats: 5
  },
  {
    agentId: 'AGENT-104',
    name: 'Praveen Accounts',
    phone: '919361863063',
    department: 'Payments, Billing & Refunds',
    isOnline: true,
    activeChatsCount: 0,
    maxConcurrentChats: 5
  },
  {
    agentId: 'AGENT-105',
    name: 'Customer Support Lead',
    phone: '919342400879',
    department: 'General Inquiries',
    isOnline: true,
    activeChatsCount: 0,
    maxConcurrentChats: 5
  }
];

const SAMPLE_ORDERS = [
  {
    orderId: 'ORD-1082',
    customerPhone: '919342400879',
    customerName: 'Murali',
    items: [
      {
        productId: 'phone_apple_15',
        productName: 'Apple iPhone 15 (128GB Blue)',
        price: 59999,
        quantity: 1,
        selectedColor: 'Blue'
      }
    ],
    totalAmount: 59999,
    discountAmount: 3000,
    paymentStatus: 'Paid',
    orderStatus: 'Out for Delivery',
    deliveryAddress: 'No. 12, Main Road, Tirukannur, Pondicherry - 605501',
    deliveryType: 'Home Delivery',
    courierPartner: 'iTechnic Express Rider',
    trackingNumber: 'EXP-839210',
    assignedRider: {
      name: 'Suresh Kumar',
      phone: '+91 9361863063'
    },
    estimatedDeliveryDate: new Date()
  },
  {
    orderId: 'ORD-1049',
    customerPhone: '919342400879',
    customerName: 'Murali',
    items: [
      {
        productId: 'phone_op_nord4',
        productName: 'OnePlus Nord 4 5G (Oasis Green 256GB)',
        price: 28999,
        quantity: 1
      },
      {
        productId: 'acc_magsafe_case',
        productName: 'MagSafe Shockproof Armor Case',
        price: 449,
        quantity: 1
      }
    ],
    totalAmount: 29448,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    deliveryAddress: 'Store Pickup - iTechnic Mobiles Tirukannur Showroom',
    deliveryType: 'Store Pickup',
    courierPartner: 'Showroom Inward Logistics',
    trackingNumber: 'INW-40291'
  }
];

const SAMPLE_LEADS = [
  {
    leadId: 'LEAD-1082',
    customerPhone: '919342400879',
    customerName: 'Anand Kumar',
    source: 'WhatsApp Chatbot',
    interestType: 'Mobile Purchase',
    targetDevice: 'Apple iPhone 16 Pro',
    targetDevicePrice: 119900,
    budgetRange: 'Above ₹80,000',
    purchasePreference: 'Visit Showroom',
    status: 'Assigned',
    assignedExecutive: {
      name: 'Karthik Raja',
      phone: '919342400879',
      assignedAt: new Date(Date.now() - 3600000)
    },
    followUpDate: new Date(Date.now() + 7200000),
    notes: [
      { text: 'Customer interested in Black Titanium 256GB. Inquiring about HDFC ₹5,000 instant cashback.', author: 'Chatbot Bot', createdAt: new Date(Date.now() - 3600000) }
    ],
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    leadId: 'LEAD-1085',
    customerPhone: '919876543210',
    customerName: 'Priya Sundaram',
    source: 'WhatsApp Chatbot',
    interestType: 'EMI Scheme',
    targetDevice: 'Samsung Galaxy S24 Ultra 5G',
    targetDevicePrice: 119999,
    budgetRange: 'Above ₹80,000',
    purchasePreference: 'Request Callback',
    status: 'New',
    assignedExecutive: {
      name: 'Karthik Raja',
      phone: '919342400879',
      assignedAt: new Date(Date.now() - 1800000)
    },
    followUpDate: new Date(Date.now() + 3600000),
    notes: [
      { text: 'Looking for 12-month No Cost EMI on ICICI credit card.', author: 'WhatsApp Chatbot', createdAt: new Date(Date.now() - 1800000) }
    ],
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    leadId: 'LEAD-1088',
    customerPhone: '919443322110',
    customerName: 'Senthil Nathan',
    source: 'WhatsApp Chatbot',
    interestType: 'Accessories',
    targetDevice: 'OnePlus Warp Charge 65W Power Adapter',
    targetDevicePrice: 1999,
    budgetRange: '₹1,000 - ₹3,000',
    purchasePreference: 'Request Delivery',
    status: 'Contacted',
    assignedExecutive: {
      name: 'Vignesh M',
      phone: '919342400879',
      assignedAt: new Date(Date.now() - 7200000)
    },
    followUpDate: new Date(Date.now() + 86400000),
    notes: [
      { text: 'Confirmed delivery address in Pondicherry. Dispatching today.', author: 'Vignesh M', createdAt: new Date(Date.now() - 3600000) }
    ],
    createdAt: new Date(Date.now() - 7200000)
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB for seeding...');

    // 1. Seed Products
    await Product.deleteMany({});
    await Product.insertMany([...SMARTPHONES, ...ACCESSORIES]);
    console.log(`✅ Seeded ${SMARTPHONES.length} Smartphones and ${ACCESSORIES.length} Accessories.`);

    // 2. Seed Offers
    await Offer.deleteMany({});
    await Offer.insertMany(OFFERS);
    console.log(`✅ Seeded ${OFFERS.length} Offers & EMI packages.`);

    // 3. Seed Agents
    await Agent.deleteMany({});
    await Agent.insertMany(AGENTS);
    console.log(`✅ Seeded ${AGENTS.length} Department Agents.`);

    // 4. Seed Sample Orders
    await Order.deleteMany({});
    await Order.insertMany(SAMPLE_ORDERS);
    console.log(`✅ Seeded ${SAMPLE_ORDERS.length} Sample Orders.`);

    // 5. Seed Sample Leads
    await Lead.deleteMany({});
    await Lead.insertMany(SAMPLE_LEADS);
    console.log(`✅ Seeded ${SAMPLE_LEADS.length} Sample Leads.`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = {
  SMARTPHONES,
  ACCESSORIES,
  OFFERS,
  AGENTS,
  SAMPLE_ORDERS,
  SAMPLE_LEADS,
  seedDatabase
};

