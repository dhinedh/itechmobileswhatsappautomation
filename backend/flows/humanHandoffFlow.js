/**
 * Human Agent Handoff & Department Routing Flow Handler
 * Department selection, live presence checking, bot pause toggle & offline callback ticketing
 */

const agentService = require('../services/agentService');
const sessionManager = require('../services/sessionManager');
const { sendInteractiveList, sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');

/**
 * Step 1: Render Department Selection Menu
 */
async function renderDepartmentMenu(phone, contact) {
  sessionManager.pushStep(contact, 'agent_select_department');
  await contact.save();

  const departments = agentService.getDepartments();
  const rows = departments.map(d => ({
    id: d.id,
    title: d.name.substring(0, 24),
    description: `Connect with specialized department`
  }));

  const text = `👨‍💼 *CONNECT WITH OUR SPECIALIST TEAM* 📱\n\n` +
    `Which department would you like to speak with?`;

  await sendInteractiveList(
    phone,
    text,
    'Select Department',
    [{ title: 'Store Departments', rows }],
    null,
    'Live Assistance'
  );
}

/**
 * Step 2: Prompt for Inquiry Details
 */
async function promptInquiryDetails(phone, contact, deptId) {
  const departments = agentService.getDepartments();
  const deptObj = departments.find(d => d.id === deptId) || departments[0];

  sessionManager.pushStep(contact, 'agent_enter_details', { chosen_dept: deptObj.name });
  await contact.save();

  const text = `🏢 *Department Selected:* ${deptObj.name}\n\n` +
    `Please type a short message explaining your question or issue, so our executive can prepare your account details:\n\n` +
    `_Example: "Looking for best price on iPhone 15" or "Checking warranty on repair #REP-1024"_`;

  await sendMessage(phone, text);
}

/**
 * Step 3: Route to Agent or Generate Callback Ticket
 */
async function executeAgentHandoff(phone, contact, inquiryText) {
  const wizard = contact.session?.wizard_data || {};
  const deptName = wizard.chosen_dept || 'General Inquiries & Other';

  const availableAgent = await agentService.findAvailableAgent(deptName);

  if (availableAgent) {
    // 1. Pause chatbot so agent can chat directly
    contact.is_paused = true;
    contact.step = 'human_takeover';
    await contact.save();

    // 2. Alert Agent on WhatsApp
    const agentDossier = agentService.formatAgentDossier(contact, deptName, inquiryText);
    await sendMessage(availableAgent.phone, agentDossier);

    // 3. Notify Customer
    const connectMsg = `👨‍💼 *YOU ARE CONNECTED TO OUR SENIOR EXECUTIVE!*\n\n` +
      `Agent: *${availableAgent.name}*\n` +
      `Department: *${deptName}*\n\n` +
      `Our executive has received your inquiry and will reply right here in this WhatsApp chat shortly.\n\n` +
      `📞 *Direct Phone:* ${availableAgent.phone}\n` +
      `🏪 *Showroom:* TV Malai Road, Tirukannur, Pondicherry\n\n` +
      `_Type *MENU* anytime if you wish to re-enable the automated assistant._`;

    await sendMessage(phone, connectMsg);
  } else {
    // Agent unavailable -> Generate Callback Ticket
    const callbackId = agentService.generateCallbackId();
    sessionManager.pushStep(contact, 'agent_callback_created', { callback_id: callbackId });
    await contact.save();

    // Notify Manager
    const managerPhone = process.env.SALES_TEAM_PHONE || '919342400879';
    await sendMessage(
      managerPhone,
      `⚠️ *CALLBACK TICKET CREATED [${callbackId}]*\n` +
      `Customer: ${contact.name || phone} (${phone})\n` +
      `Department: ${deptName}\n` +
      `Inquiry: "${inquiryText}"\n` +
      `Please call customer back within business hours.`
    );

    const offlineMsg = `ℹ️ *ALL AGENTS CURRENTLY ASSISTING CUSTOMERS*\n\n` +
      `We have registered your Priority Callback Request:\n` +
      `🎫 Ticket ID: *${callbackId}*\n` +
      `🏢 Department: *${deptName}*\n\n` +
      `Our team will call you back on *${phone}* within 30 minutes.\n\n` +
      `🏪 *Showroom Timings:* 10:00 AM – 8:00 PM\n` +
      `📞 *Urgent Hotline:* +91 9361863063`;

    await sendInteractiveButtons(phone, offlineMsg, [
      { id: 'opt_1_buy', title: 'Browse Mobiles 📱' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ]);
  }
}

module.exports = {
  renderDepartmentMenu,
  promptInquiryDetails,
  executeAgentHandoff
};

