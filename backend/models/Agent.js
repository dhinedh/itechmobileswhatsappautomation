const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true }, // e.g. AGENT-101
  name: { type: String, required: true },
  phone: { type: String, required: true },
  department: { 
    type: String, 
    enum: [
      'New Phone Sales & Inquiries', 
      'Order Status & Delivery Assistance', 
      'Payments, Billing & Refunds', 
      'Service, Repair & Warranty', 
      'General Inquiries'
    ],
    required: true 
  },
  isOnline: { type: Boolean, default: true },
  activeChatsCount: { type: Number, default: 0 },
  maxConcurrentChats: { type: Number, default: 5 },
  notificationsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);

