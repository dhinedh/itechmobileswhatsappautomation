const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true }, // e.g. LEAD-9382
  customerPhone: { type: String, required: true },
  customerName: { type: String, required: true },
  source: { type: String, enum: ['WhatsApp Chatbot', 'Web Widget', 'Showroom Visit'], default: 'WhatsApp Chatbot' },
  interestType: { 
    type: String, 
    enum: ['Mobile Purchase', 'EMI Inquiry', 'Accessory Purchase', 'Repair Service', 'General Support'],
    required: true 
  },
  targetDevice: { type: String, default: '' },
  targetDevicePrice: { type: Number, default: 0 },
  budgetRange: { type: String, default: '' },
  purchasePreference: { 
    type: String, 
    enum: ['Visit Showroom', 'Home Delivery', 'Callback Requested', 'Talk to Sales', 'Direct Purchase'],
    default: 'Visit Showroom'
  },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Quoted', 'Converted', 'Lost'],
    default: 'New' 
  },
  assignedExecutive: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    assignedAt: { type: Date }
  },
  followUpDate: { type: Date },
  notes: [{
    text: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);

