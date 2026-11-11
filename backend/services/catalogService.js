/**
 * Product & Catalog Service
 * Guided Phone Discovery, Use-Case Recommendation, Comparison Engine & Accessories Catalog
 */

const Product = require('../models/Product');
const { SMARTPHONES, ACCESSORIES } = require('../seed_data');

// Supported Brands
const BRANDS = [
  { id: 'brand_apple', name: 'Apple iPhone', tag: 'Specialist' },
  { id: 'brand_samsung', name: 'Samsung Galaxy', tag: 'AI Flagship' },
  { id: 'brand_oneplus', name: 'OnePlus', tag: 'Fast & Smooth' },
  { id: 'brand_vivo', name: 'Vivo', tag: 'ZEISS Camera' },
  { id: 'brand_oppo', name: 'Oppo', tag: 'Portrait Expert' },
  { id: 'brand_xiaomi', name: 'Xiaomi / Redmi', tag: 'Leica Optics' },
  { id: 'brand_realme', name: 'Realme', tag: 'Value Performance' },
  { id: 'brand_all', name: 'All Brands (Browse All)', tag: 'Full Catalog' }
];

// Budget Brackets
const BUDGET_TIERS = [
  { id: 'budget_1', label: 'Under ₹15,000', min: 0, max: 15000 },
  { id: 'budget_2', label: '₹15,000 – ₹30,000', min: 15000, max: 30000 },
  { id: 'budget_3', label: '₹30,000 – ₹50,000', min: 30000, max: 50000 },
  { id: 'budget_4', label: '₹50,000 – ₹80,000', min: 50000, max: 80000 },
  { id: 'budget_5', label: 'Premium (Above ₹80,000)', min: 80000, max: 999999 }
];

// Primary Requirements
const REQUIREMENTS = [
  { id: 'req_camera', label: '📷 Camera & Portraits', scoreKey: 'camera' },
  { id: 'req_gaming', label: '🎮 Gaming & Speed', scoreKey: 'gaming' },
  { id: 'req_battery', label: '🔋 Battery & Endurance', scoreKey: 'battery' },
  { id: 'req_performance', label: '⚡ Flagship Performance', scoreKey: 'performance' },
  { id: 'req_business', label: '💼 Business & Productivity', scoreKey: 'business' },
  { id: 'req_overall', label: '📱 Best Overall All-Rounder', scoreKey: 'performance' }
];

// Accessory Categories
const ACCESSORY_CATEGORIES = [
  { id: 'acc_cases', name: 'Mobile Cases & Covers', icon: '🛡️' },
  { id: 'acc_chargers', name: 'Chargers & High-Speed Cables', icon: '⚡' },
  { id: 'acc_audio', name: 'TWS Earbuds & Headphones', icon: '🎧' },
  { id: 'acc_glass', name: '9D Edge-to-Edge Tempered Glass', icon: '📱' },
  { id: 'acc_power', name: 'Fast Charging Power Banks', icon: '🔋' },
  { id: 'acc_watch', name: 'Smart Watches & Fitness Bands', icon: '⌚' }
];

/**
 * Fetch all available brands
 */
function getBrands() {
  return BRANDS;
}

/**
 * Fetch budget tiers
 */
function getBudgetTiers() {
  return BUDGET_TIERS;
}

/**
 * Fetch requirements
 */
function getRequirements() {
  return REQUIREMENTS;
}

/**
 * Fetch accessory categories
 */
function getAccessoryCategories() {
  return ACCESSORY_CATEGORIES;
}

/**
 * Get smartphones matching Brand, Budget, and Requirement filters
 */
async function searchPhones({ brand, budgetId, requirementId }) {
  let list = [];
  try {
    list = await Product.find({ category: 'Smartphone', isActive: true });
  } catch (e) {
    // Fallback to in-memory seed dataset if MongoDB is buffering or offline
    list = SMARTPHONES;
  }

  if (!list || list.length === 0) list = SMARTPHONES;

  // 1. Filter by Brand
  if (brand && brand !== 'brand_all' && brand !== 'All Brands (Browse All)') {
    const cleanBrand = brand.toLowerCase().replace('brand_', '');
    list = list.filter(p => p.brand.toLowerCase().includes(cleanBrand));
  }

  // 2. Filter by Budget Range
  const budgetTier = BUDGET_TIERS.find(b => b.id === budgetId);
  if (budgetTier) {
    list = list.filter(p => p.offerPrice >= budgetTier.min && p.offerPrice <= budgetTier.max);
  }

  // 3. Score & Rank based on Requirement
  const reqObj = REQUIREMENTS.find(r => r.id === requirementId) || REQUIREMENTS[0];
  const scoreKey = reqObj.scoreKey || 'performance';

  list.sort((a, b) => {
    const scoreA = (a.scores && a.scores[scoreKey]) || 80;
    const scoreB = (b.scores && b.scores[scoreKey]) || 80;
    return scoreB - scoreA;
  });

  // Return Top 3 recommendation devices
  return list.slice(0, 3);
}

/**
 * Fetch a single phone by ID or Name
 */
async function getPhoneById(idOrName) {
  try {
    const found = await Product.findOne({
      $or: [
        { productId: idOrName },
        { name: new RegExp(idOrName, 'i') }
      ]
    });
    if (found) return found;
  } catch (e) {}
  
  // Fallback
  return SMARTPHONES.find(p => p.productId === idOrName || p.name.toLowerCase().includes(idOrName.toLowerCase())) || SMARTPHONES[0];
}

/**
 * Side-by-Side Comparison Generator for 2 Phones
 */
async function comparePhones(phoneId1, phoneId2) {
  const p1 = await getPhoneById(phoneId1);
  const p2 = await getPhoneById(phoneId2);

  return {
    phone1: p1,
    phone2: p2,
    comparisonText: `⚖️ *MOBILE COMPARISON:*\n*${p1.name}*  VS  *${p2.name}*\n` +
      `─────────────────────────\n` +
      `💰 *Price:*\n• ${p1.name}: ₹${p1.offerPrice.toLocaleString('en-IN')}\n• ${p2.name}: ₹${p2.offerPrice.toLocaleString('en-IN')}\n\n` +
      `🖥️ *Display:*\n• ${p1.name}: ${p1.specs.display}\n• ${p2.name}: ${p2.specs.display}\n\n` +
      `⚡ *Processor:*\n• ${p1.name}: ${p1.specs.processor}\n• ${p2.name}: ${p2.specs.processor}\n\n` +
      `📷 *Rear Camera:*\n• ${p1.name}: ${p1.specs.rearCamera}\n• ${p2.name}: ${p2.specs.rearCamera}\n\n` +
      `🔋 *Battery & Charging:*\n• ${p1.name}: ${p1.specs.battery}\n• ${p2.name}: ${p2.specs.battery}\n` +
      `─────────────────────────\n` +
      `💡 *Verdict:*\n` +
      `• Choose *${p1.name}* for better ${p1.scores.camera > p2.scores.camera ? 'Camera & Portraits' : 'Design'}.\n` +
      `• Choose *${p2.name}* for better ${p2.scores.gaming > p1.scores.gaming ? 'Gaming & Battery' : 'Value for Money'}.`
  };
}

/**
 * Search Accessories by Category & Budget
 */
async function searchAccessories({ categoryName, budgetMax = 99999 }) {
  let list = [];
  try {
    list = await Product.find({ category: 'Accessory', isActive: true });
  } catch (e) {
    list = ACCESSORIES;
  }

  if (!list || list.length === 0) list = ACCESSORIES;

  if (categoryName && categoryName !== 'All') {
    list = list.filter(a => (a.subCategory || '').toLowerCase().includes(categoryName.toLowerCase()));
  }

  if (budgetMax) {
    list = list.filter(a => a.offerPrice <= budgetMax);
  }

  return list.slice(0, 4);
}

module.exports = {
  getBrands,
  getBudgetTiers,
  getRequirements,
  getAccessoryCategories,
  searchPhones,
  getPhoneById,
  comparePhones,
  searchAccessories
};

