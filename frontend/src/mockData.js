export const FALLBACK_TEMPLATES = [
  {
    name: 'repair_booking_confirmed',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '🔧 iTechnic Mobiles - Repair Booking Confirmed' },
      { type: 'BODY', text: 'Hello {{1}}, your repair booking for {{2}} (Job ID: {{3}}) has been received. Service: {{4}}. Estimated Turnaround: {{5}}.' },
      { type: 'FOOTER', text: 'We Repair. You Relax. · TV Malai Road, Tirukannur' },
      { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Track Repair' }, { type: 'QUICK_REPLY', text: 'Contact Technician' }] }
    ]
  },
  {
    name: 'repair_status_update',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '📱 Repair Status Progression' },
      { type: 'BODY', text: 'Hello {{1}}, status update for Job ID {{2}} ({{3}}): Status has changed to {{4}}. Technician notes: {{5}}.' },
      { type: 'FOOTER', text: 'iTechnic Mobiles Live Care' }
    ]
  },
  {
    name: 'device_ready_pickup',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '✅ Device Ready for Pickup & Payment' },
      { type: 'BODY', text: 'Hello {{1}}, great news! Your {{2}} (Job ID: {{3}}) has passed Quality Testing and is ready for pickup. Total Bill: ₹{{4}}. Invoice: {{5}}.' },
      { type: 'FOOTER', text: 'Store Hours: 10:00 AM - 8:00 PM (Mon-Sat)' }
    ]
  },
  {
    name: 'service_quotation',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '📋 Repair Estimate & Quotation' },
      { type: 'BODY', text: 'Hello {{1}}, our technician has inspected your {{2}} (Job: {{3}}). Issue: {{4}}. Quoted Cost: ₹{{5}}. Please reply to approve repair.' },
      { type: 'FOOTER', text: 'Genuine OEM Parts Guarantee' },
      { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Approve Repair' }, { type: 'QUICK_REPLY', text: 'Call Technician' }] }
    ]
  },
  {
    name: 'order_dispatched',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '🚚 Order Dispatched & Out for Delivery' },
      { type: 'BODY', text: 'Hello {{1}}, your order {{2}} for {{3}} has been dispatched via {{4}}. Tracking AWB: {{5}}.' },
      { type: 'FOOTER', text: 'iTechnic Mobiles Express Delivery' }
    ]
  },
  {
    name: 'warranty_confirmation',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '🛡️ 90-Day Digital Warranty Certificate' },
      { type: 'BODY', text: 'Hello {{1}}, thank you for choosing iTechnic Mobiles. Your warranty certificate for {{2}} (Bill: {{3}}) is valid for {{4}}.' },
      { type: 'FOOTER', text: '100% Genuine Parts Covered' }
    ]
  },
  {
    name: 'doorstep_pickup_confirmation',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '🛵 Doorstep Pickup Scheduled' },
      { type: 'BODY', text: 'Hello {{1}}, your doorstep pickup for {{2}} is confirmed for {{3}}. Pickup Executive: {{4}}.' },
      { type: 'FOOTER', text: 'Safe & Verified Doorstep Service' }
    ]
  },
  {
    name: 'admin_service_alert',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '🚨 Admin Lead / Service Alert' },
      { type: 'BODY', text: 'New service request from {{1}} (Phone: {{2}}). Device: {{3}}, Issue: {{4}}, Reference ID: {{5}}.' }
    ]
  }
];

export const FALLBACK_AGENTS = [
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
    isOnline: false,
    activeChatsCount: 0,
    maxConcurrentChats: 5
  },
  {
    agentId: 'AGENT-105',
    name: 'Deepika R',
    phone: '919361863063',
    department: 'General Support & Feedback',
    isOnline: true,
    activeChatsCount: 1,
    maxConcurrentChats: 5
  }
];

export const FALLBACK_LEADS = [
  {
    leadId: 'LEAD-101',
    customerPhone: '919842100234',
    customerName: 'Anand Kumar',
    targetDevice: 'Apple iPhone 16 Pro',
    budgetRange: '₹1,00,000 - ₹1,30,000',
    purchasePreference: 'Visit Showroom',
    status: 'Contacted',
    notes: ['Inquired about exchange value for iPhone 13 128GB (Est: ₹22,000).', 'Offered Bajaj Finserv 0% EMI with ₹12,000 down payment.']
  },
  {
    leadId: 'LEAD-102',
    customerPhone: '919789012345',
    customerName: 'Lakshmi Priya',
    targetDevice: 'Samsung Galaxy S24 Ultra',
    budgetRange: '₹1,10,000 - ₹1,40,000',
    purchasePreference: 'Doorstep Delivery',
    status: 'Qualified',
    notes: ['Wants Titanium Gray color 256GB.', 'Confirmed HDFC Bank ₹6,000 instant cashback.']
  },
  {
    leadId: 'LEAD-103',
    customerPhone: '919629876543',
    customerName: 'Senthil Nathan',
    targetDevice: 'OnePlus 12 (5G)',
    budgetRange: '₹50,000 - ₹70,000',
    purchasePreference: 'Visit Showroom',
    status: 'New',
    notes: ['Enquired about Silky Black availability in Tirukannur branch.']
  }
];

export const FALLBACK_ORDERS = [
  {
    orderId: 'ORD-1082',
    customerPhone: '919876543210',
    customerName: 'Ramesh Babu',
    items: [{ productId: 'phone_apple_15', name: 'Apple iPhone 15 128GB (Black)', quantity: 1, price: 59999 }],
    totalAmount: 59999,
    deliveryType: 'store_pickup',
    deliveryAddress: 'Store Counter, Tirukannur Branch',
    orderStatus: 'Confirmed',
    courierPartner: 'Self Pickup',
    trackingNumber: 'PICKUP-1082'
  },
  {
    orderId: 'ORD-1083',
    customerPhone: '919342400879',
    customerName: 'Murali Tester',
    items: [{ productId: 'acc_apple_20w', name: 'Apple 20W USB-C Power Adapter', quantity: 1, price: 1799 }],
    totalAmount: 1799,
    deliveryType: 'home_delivery',
    deliveryAddress: 'Main Road, Villianur, Pondicherry',
    orderStatus: 'Out for Delivery',
    courierPartner: 'iTechnic Express Rider',
    trackingNumber: 'TRK-99214',
    assignedRider: { name: 'Karthik Raja', phone: '919361863063' }
  }
];

export const FALLBACK_PRODUCTS = [
  {
    productId: 'phone_apple_16pro',
    name: 'Apple iPhone 16 Pro',
    brand: 'Apple',
    category: 'Smartphone',
    price: 119900,
    offerPrice: 114900,
    stock: 8,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo.png',
    colors: [{ name: 'Desert Titanium', inStock: true }, { name: 'Natural Titanium', inStock: true }],
    specs: { display: '6.3" OLED 120Hz', processor: 'A18 Pro', ram: '8GB', storage: '128GB' },
    scores: { camera: 99, performance: 99, battery: 90 }
  },
  {
    productId: 'phone_apple_15',
    name: 'Apple iPhone 15',
    brand: 'Apple',
    category: 'Smartphone',
    price: 69900,
    offerPrice: 59999,
    stock: 12,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo.png',
    colors: [{ name: 'Black', inStock: true }, { name: 'Blue', inStock: true }],
    specs: { display: '6.1" OLED Dynamic Island', processor: 'A16 Bionic', ram: '6GB', storage: '128GB' },
    scores: { camera: 95, performance: 94, battery: 88 }
  },
  {
    productId: 'phone_samsung_s24u',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphone',
    price: 129999,
    offerPrice: 121999,
    stock: 6,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo.png',
    colors: [{ name: 'Titanium Gray', inStock: true }, { name: 'Titanium Black', inStock: true }],
    specs: { display: '6.8" Dynamic AMOLED 2X', processor: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB' },
    scores: { camera: 98, performance: 98, battery: 95 }
  },
  {
    productId: 'acc_apple_20w',
    name: 'Apple 20W USB-C Power Adapter',
    brand: 'Apple',
    category: 'Charger',
    price: 1900,
    offerPrice: 1799,
    stock: 25,
    imageUrl: 'https://whatapp-automation-kxml.onrender.com/logo.png',
    specs: { wattage: '20W', type: 'Fast Charger' }
  }
];

export const FALLBACK_OFFERS = [
  {
    offerId: 'OFFER-001',
    title: 'HDFC & ICICI Credit Card ₹6,000 Instant Cashback',
    code: 'BANK6K',
    discountAmount: 6000,
    minPurchase: 50000,
    isActive: true,
    validUntil: '2026-12-31'
  },
  {
    offerId: 'OFFER-002',
    title: 'Free 9D Tempered Glass + Premium Case with every iPhone',
    code: 'FREEKIT',
    discountAmount: 1499,
    minPurchase: 30000,
    isActive: true,
    validUntil: '2026-12-31'
  }
];
