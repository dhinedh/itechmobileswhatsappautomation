/**
 * Agent Routing & Multi-Department Support Queue Service
 * Checks live agent availability, routes to appropriate department,
 * executes live chat handoff or generates priority callback tickets.
 */

const Agent = require('../models/Agent');
const { AGENTS } = require('../seed_data');

const DEPARTMENTS = [
  { id: 'dept_sales', name: 'New Phone Sales & Inquiries', icon: '🛍️' },
  { id: 'dept_orders', name: 'Order Status & Delivery Assistance', icon: '🚚' },
  { id: 'dept_billing', name: 'Payments, Billing & Refunds', icon: '💳' },
  { id: 'dept_service', name: 'Service, Repair & Warranty', icon: '🔧' },
  { id: 'dept_general', name: 'General Inquiries & Other', icon: '❓' }
];

function getDepartments() {
  return DEPARTMENTS;
}

/**
 * Checks if a qualified agent is currently online in the chosen department
 */
async function findAvailableAgent(departmentName) {
  try {
    const agent = await Agent.findOne({
      department: new RegExp(departmentName, 'i'),
      isOnline: true
    });
    if (agent) return agent;
  } catch (e) {
    console.warn('Agent DB lookup failed, checking in-memory agents:', e.message);
  }

  // Fallback to in-memory agents
  const found = AGENTS.find(
    a => a.isOnline && a.department.toLowerCase().includes(departmentName.toLowerCase())
  );

  return found || null;
}

/**
 * Generates unique Callback Ticket ID
 */
function generateCallbackId() {
  const num = Math.floor(100 + Math.random() * 900);
  return `CB-${num}`;
}

/**
 * Formats Agent Handoff Dossier for the Agent WhatsApp
 */
function formatAgentDossier(customer, departmentName, queryText) {
  return `🚨 *LIVE CUSTOMER HANDOFF REQUIRED* 👨‍💼\n` +
    `─────────────────────────\n` +
    `👤 *Customer:* ${customer.name || 'Customer'} (${customer.phone})\n` +
    `🏢 *Department:* ${departmentName}\n` +
    `📝 *Customer Inquiry:* "${queryText || 'Live Assistance Requested'}"\n` +
    `─────────────────────────\n` +
    `🤖 *Chatbot has been paused for this contact.*\n` +
    `👉 Click to chat directly: https://wa.me/${customer.phone}`;
}

module.exports = {
  getDepartments,
  findAvailableAgent,
  generateCallbackId,
  formatAgentDossier
};

