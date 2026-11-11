/**
 * CRM Lead & Sales Attribution Service
 * Captures high-intent leads from Mobile Buyer, EMI, and Accessories funnels,
 * notifies store executives on WhatsApp, and creates trackable CRM records.
 */

const Lead = require('../models/Lead');
const Agent = require('../models/Agent');
const { SAMPLE_LEADS } = require('../seed_data');

// In-memory fallback and cache
const inMemoryLeads = [...(SAMPLE_LEADS || [])];

/**
 * Generates unique readable Lead ID
 */
function generateLeadId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LEAD-${num}`;
}

/**
 * Creates and registers a new sales lead
 */
async function createLead({
  customerPhone,
  customerName = 'Valued Customer',
  interestType = 'Mobile Purchase',
  targetDevice = '',
  targetDevicePrice = 0,
  budgetRange = '',
  purchasePreference = 'Visit Showroom',
  notesText = ''
}) {
  const leadId = generateLeadId();

  // Pick an active sales executive
  let assignedExecutive = {
    name: 'Karthik Raja',
    phone: process.env.SALES_TEAM_PHONE || '919342400879'
  };

  try {
    const activeAgent = await Agent.findOne({
      department: 'New Phone Sales & Inquiries',
      isOnline: true
    });
    if (activeAgent) {
      assignedExecutive = {
        name: activeAgent.name,
        phone: activeAgent.phone,
        assignedAt: new Date()
      };
    }
  } catch (e) {}

  const leadData = {
    leadId,
    customerPhone,
    customerName,
    source: 'WhatsApp Chatbot',
    interestType,
    targetDevice,
    targetDevicePrice,
    budgetRange,
    purchasePreference,
    status: 'New',
    assignedExecutive,
    followUpDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours SLA
    notes: notesText ? [{ text: notesText, author: 'WhatsApp Chatbot' }] : []
  };

  try {
    const lead = new Lead(leadData);
    await lead.save();
    console.log(`✅ CRM Lead ${leadId} created for ${customerName} (${customerPhone})`);
  } catch (e) {
    console.warn(`Lead save to MongoDB failed (${e.message}), continuing with memory record`);
  }

  // Always keep in-memory leads synchronized
  inMemoryLeads.unshift(leadData);

  return {
    success: true,
    lead: leadData,
    assignedExecutive
  };
}

/**
 * Format alert message for the Sales Executive WhatsApp
 */
function formatExecutiveAlert(lead) {
  return `🔥 *NEW SALES LEAD RECEIVED [${lead.leadId}]* 📱\n` +
    `─────────────────────────\n` +
    `👤 *Customer:* ${lead.customerName} (${lead.customerPhone})\n` +
    `🎯 *Interest:* ${lead.interestType}\n` +
    `📱 *Preferred Model:* ${lead.targetDevice || 'Open to Recommendations'}\n` +
    `💰 *Budget:* ${lead.budgetRange || 'Not Specified'}\n` +
    `🏬 *Preference:* ${lead.purchasePreference}\n` +
    `─────────────────────────\n` +
    `⚡ *Action Required:* Please contact customer within 15 minutes.\n` +
    `👉 Quick WhatsApp chat: https://wa.me/${lead.customerPhone}`;
}

/**
 * Format confirmation message for the Customer
 */
function formatCustomerLeadAck(lead) {
  let prefInfo = '';
  if (lead.purchasePreference === 'Visit Showroom') {
    prefInfo = `📍 *Store Location:* TV Malai Road, Tirukannur, Pondicherry - 605501\n⏰ *Hours:* Mon–Sat, 10:00 AM – 8:00 PM`;
  } else if (lead.purchasePreference === 'Home Delivery') {
    prefInfo = `🚚 *Delivery:* Our logistics executive will confirm your address shortly for same-day delivery.`;
  } else {
    prefInfo = `📞 *Callback:* Our senior executive *${lead.assignedExecutive.name}* will call you shortly.`;
  }

  return `🎉 *INQUIRY REGISTERED SUCCESSFULLY!*\n` +
    `Reference ID: *${lead.leadId}*\n\n` +
    `Thank you, *${lead.customerName}*! We have reserved your preferred model details (*${lead.targetDevice || 'Mobile Service'}*).\n\n` +
    `${prefInfo}\n\n` +
    `👨‍💼 *Assigned Executive:* ${lead.assignedExecutive.name} (${lead.assignedExecutive.phone})\n\n` +
    `_Reply *MENU* anytime to return to the main menu._`;
}

module.exports = {
  createLead,
  formatExecutiveAlert,
  formatCustomerLeadAck,
  inMemoryLeads
};

