const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerId: { type: String, required: true, unique: true }, // e.g. OFF-HDFC-01
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Bank Offers', 'No-Cost EMI', 'Regular EMI', 'Exchange Bonus', 'Festival Special'],
    required: true 
  },
  description: { type: String, required: true },
  applicableBrands: [String],
  applicableProducts: [String],
  bankName: { type: String, default: '' }, // HDFC Bank, ICICI Bank, SBI, Bajaj Finserv, etc.
  cardType: { type: String, enum: ['Credit Card', 'Debit Card', 'All'], default: 'All' },
  discountType: { 
    type: String, 
    enum: ['FLAT', 'PERCENTAGE', 'CASHBACK', 'EXCHANGE', 'NO_COST_EMI'], 
    default: 'FLAT' 
  },
  discountValue: { type: Number, required: true }, // Amount or percentage
  minTransactionAmount: { type: Number, default: 10000 },
  tenureMonths: { type: [Number], default: [3, 6, 9, 12] },
  isZeroCostEmi: { type: Boolean, default: false },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  terms: [String],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Offer', offerSchema);

