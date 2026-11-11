/**
 * Offers & EMI Calculator Service
 * Bank offers, Zero-Cost EMI tenure computation & exchange bonus management
 */

const Offer = require('../models/Offer');
const { OFFERS } = require('../seed_data');

const OFFER_CATEGORIES = [
  { id: 'cat_bank', name: 'Bank Offers (HDFC, ICICI, SBI)', categoryKey: 'Bank Offers' },
  { id: 'cat_nocost', name: 'Zero-Downpayment No-Cost EMI', categoryKey: 'No-Cost EMI' },
  { id: 'cat_regemi', name: 'Standard Easy In-Store EMI', categoryKey: 'Regular EMI' },
  { id: 'cat_exchange', name: 'Old Phone Exchange Bonus', categoryKey: 'Exchange Bonus' },
  { id: 'cat_all', name: 'View All Active Deals', categoryKey: 'All' }
];

/**
 * Return list of offer categories
 */
function getOfferCategories() {
  return OFFER_CATEGORIES;
}

/**
 * Fetch offers by category
 */
async function getOffersByCategory(categoryKey) {
  let list = [];
  try {
    list = await Offer.find({ isActive: true });
  } catch (e) {
    list = OFFERS;
  }

  if (!list || list.length === 0) list = OFFERS;

  if (categoryKey && categoryKey !== 'All') {
    list = list.filter(o => o.category === categoryKey);
  }

  return list;
}

/**
 * EMI Calculator Helper
 * Calculates monthly EMI for 3, 6, 9, 12 months
 */
function calculateEmiBreakdown(amount) {
  const tenures = [3, 6, 9, 12];
  return tenures.map(months => {
    // Zero-cost EMI calculation (interest absorbed by merchant/brand)
    const monthlyZeroCost = Math.round(amount / months);
    // Standard bank EMI calculation (14% annual interest rate benchmark)
    const monthlyRate = 0.14 / 12;
    const stdEmi = Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));

    return {
      months,
      noCostPerMonth: monthlyZeroCost,
      standardPerMonth: stdEmi
    };
  });
}

/**
 * Format Offer Card for WhatsApp
 */
function formatOfferCard(offer, targetAmount = 50000) {
  const emiOptions = calculateEmiBreakdown(targetAmount);
  const tenureText = emiOptions
    .map(t => `• *${t.months} Months:* ₹${t.noCostPerMonth.toLocaleString('en-IN')}/month (0% No-Cost EMI)`)
    .join('\n');

  const expiry = offer.validUntil
    ? new Date(offer.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Limited Period';

  return `🔥 *${offer.title.toUpperCase()}*\n` +
    `─────────────────────────\n` +
    `📝 *Details:* ${offer.description}\n\n` +
    `🏦 *Eligible Banks:* ${offer.bankName || 'All Major Partner Banks'}\n` +
    `💳 *Card Type:* ${offer.cardType || 'Credit & Debit Cards'}\n` +
    `💰 *Min Purchase:* ₹${(offer.minTransactionAmount || 10000).toLocaleString('en-IN')}\n\n` +
    `📊 *Sample EMI Breakdown (for ₹${targetAmount.toLocaleString('en-IN')} Phone):*\n` +
    `${tenureText}\n\n` +
    `⏰ *Offer Valid Until:* ${expiry}\n` +
    `─────────────────────────\n` +
    `_Would you like our finance desk to reserve this offer for you?_`;
}

module.exports = {
  getOfferCategories,
  getOffersByCategory,
  calculateEmiBreakdown,
  formatOfferCard
};

