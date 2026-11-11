/**
 * Track My Order Flow Handler
 * Self-service Order ID & Registered Mobile lookup with delivery timeline
 */

const orderService = require('../services/orderService');
const sessionManager = require('../services/sessionManager');
const { sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');

/**
 * Step 1: Prompt customer for Order ID or Phone
 */
async function promptOrderQuery(phone, contact) {
  sessionManager.pushStep(contact, 'track_prompt_query', { track_attempts: 0 });
  await contact.save();

  const text = `🔍 *TRACK YOUR ORDER* 📦\n\n` +
    `Please type and send your:\n` +
    `• *Order ID* (e.g., *ORD-1082*)\n` +
    `  _OR_\n` +
    `• *10-Digit Registered Mobile Number*\n\n` +
    `_Or tap below to search with your current WhatsApp number:_`;

  const buttons = [
    { id: `track_phone_${phone}`, title: 'Search My Number 📱' },
    { id: 'btn_agent', title: 'Talk to Support 👨‍💼' },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ];

  await sendInteractiveButtons(phone, text, buttons);
}

/**
 * Step 2: Handle Query & Display Order Result
 */
async function handleOrderLookup(phone, contact, rawQuery) {
  const wizard = contact.session?.wizard_data || {};
  let attempts = (wizard.track_attempts || 0) + 1;
  sessionManager.updateWizardData(contact, { track_attempts: attempts });

  const query = rawQuery.replace('track_phone_', '');
  const order = await orderService.findOrder(query);

  if (order) {
    sessionManager.pushStep(contact, 'track_show_result', { found_order_id: order.orderId });
    await contact.save();

    const formattedMessage = orderService.formatOrderMessage(order);
    const buttons = [
      { id: 'opt_5_agent', title: 'Need Assistance? 👨‍💼' },
      { id: 'opt_4_acc', title: 'Shop Accessories 🛍️' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ];

    await sendInteractiveButtons(phone, formattedMessage, buttons);
    return;
  }

  // If order was not found
  if (attempts < 2) {
    const retryMsg = `❌ *Order Not Found for: "${query}"*\n\n` +
      `Please check the spelling of your Order ID or make sure you entered the correct 10-digit mobile number.\n\n` +
      `_Please type your Order ID or phone again:_`;

    await sendInteractiveButtons(phone, retryMsg, [
      { id: 'opt_5_agent', title: 'Connect to Support 👨‍💼' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ]);
  } else {
    // 2nd failure -> Automatically escalate to Support Team
    const escalateMsg = `⚠️ *Still Unable to Locate Order*\n\n` +
      `No problem! Our Order Support Executive is available right now to check your billing and delivery records manually.\n\n` +
      `Would you like to connect with our Order Support desk?`;

    await sendInteractiveButtons(phone, escalateMsg, [
      { id: 'opt_5_agent', title: 'Connect to Agent 👨‍💼' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ]);
  }
}

module.exports = {
  promptOrderQuery,
  handleOrderLookup
};

