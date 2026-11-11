/**
 * Central Conversational Flow Engine
 * Evaluates global navigation, state routing, and dispatches actions across all 5 retail & support pillars.
 */

const sessionManager = require('../services/sessionManager');
const mainMenuFlow = require('./mainMenuFlow');
const buyMobileFlow = require('./buyMobileFlow');
const trackOrderFlow = require('./trackOrderFlow');
const offersFlow = require('./offersFlow');
const accessoriesFlow = require('./accessoriesFlow');
const humanHandoffFlow = require('./humanHandoffFlow');
const { sendMessage, sendInteractiveButtons } = require('../services/whatsappClient');

/**
 * Main Router: processes incoming WhatsApp message or interactive payload
 */
async function processIncomingMessage(phone, messageText, contact, rawPayload = {}) {
  const clean = sessionManager.cleanText(messageText);
  sessionManager.initSession(contact);

  // 1. Check Global Navigation Commands (MENU, BACK, RESTART, AGENT, STOP)
  const globalCmd = sessionManager.isGlobalCommand(clean);
  if (globalCmd) {
    return handleGlobalCommand(globalCmd, phone, contact);
  }

  // If chat is currently paused for human agent takeover
  if (contact.is_paused) {
    if (['menu', 'start', 'restart', '0'].includes(clean)) {
      contact.is_paused = false;
      await contact.save();
      return mainMenuFlow.renderMainMenu(phone, contact);
    }
    // Still in human takeover mode; don't trigger automated replies
    return false;
  }

  const currentStep = contact.session?.current_step || 'main_menu';

  // 2. Main Menu Actions (Pillars 1 to 5)
  if (
    clean === '1' || clean === 'opt_1_buy' || clean.includes('buy a new mobile') || clean === 'buy mobile'
  ) {
    return buyMobileFlow.renderBrandSelection(phone, contact);
  }

  if (
    clean === '2' || clean === 'opt_2_track' || clean.includes('track my order') || clean === 'track'
  ) {
    return trackOrderFlow.promptOrderQuery(phone, contact);
  }

  if (
    clean === '3' || clean === 'opt_3_offers' || clean.includes('latest offers') || clean === 'offers' || clean === 'emi'
  ) {
    return offersFlow.renderOfferCategories(phone, contact);
  }

  if (
    clean === '4' || clean === 'opt_4_acc' || clean.includes('accessories')
  ) {
    return accessoriesFlow.renderAccessoryCategories(phone, contact);
  }

  if (
    clean === '5' || clean === 'opt_5_agent' || clean.includes('talk to our team') || clean === 'support'
  ) {
    return humanHandoffFlow.renderDepartmentMenu(phone, contact);
  }

  // 3. Module 1: Buy a New Mobile Wizard Steps
  if (clean.startsWith('brand_')) {
    const brandName = clean.replace('brand_', '').replace(/\b\w/g, l => l.toUpperCase());
    sessionManager.updateWizardData(contact, { brand_id: clean, brand_name: brandName });
    await contact.save();
    return buyMobileFlow.renderBudgetSelection(phone, contact);
  }

  if (clean.startsWith('budget_')) {
    const budgetMap = {
      budget_1: 'Under ₹15,000',
      budget_2: '₹15,000 – ₹30,000',
      budget_3: '₹30,000 – ₹50,000',
      budget_4: '₹50,000 – ₹80,000',
      budget_5: 'Above ₹80,000'
    };
    sessionManager.updateWizardData(contact, { budget_id: clean, budget_label: budgetMap[clean] || clean });
    await contact.save();
    return buyMobileFlow.renderRequirementSelection(phone, contact);
  }

  if (clean.startsWith('req_')) {
    const reqMap = {
      req_camera: 'Camera & Studio Portraits',
      req_gaming: 'Gaming & High Performance',
      req_battery: 'Battery & Long Endurance',
      req_performance: 'Flagship Speed & Power',
      req_business: 'Business & Productivity',
      req_overall: 'Best All-Rounder'
    };
    sessionManager.updateWizardData(contact, { requirement_id: clean, requirement_label: reqMap[clean] || clean });
    await contact.save();
    return buyMobileFlow.renderTopMobiles(phone, contact);
  }

  if (clean.startsWith('view_phone_')) {
    const phoneId = clean.replace('view_phone_', '');
    return buyMobileFlow.renderDeviceDetail(phone, contact, phoneId);
  }

  if (clean === 'btn_buy_now') {
    return buyMobileFlow.renderPurchaseOptions(phone, contact);
  }

  if (clean === 'btn_compare_init') {
    return buyMobileFlow.renderComparePicker(phone, contact);
  }

  if (clean.startsWith('comp_with_')) {
    const competitorId = clean.replace('comp_with_', '');
    return buyMobileFlow.renderComparisonMatrix(phone, contact, competitorId);
  }

  if (clean === 'btn_back_results') {
    return buyMobileFlow.renderTopMobiles(phone, contact);
  }

  if (clean.startsWith('pref_')) {
    return buyMobileFlow.finalizePurchaseLead(phone, contact, clean);
  }

  // 4. Module 2: Track Order Queries
  if (currentStep === 'track_prompt_query' || clean.startsWith('track_phone_')) {
    return trackOrderFlow.handleOrderLookup(phone, contact, clean);
  }

  // 5. Module 3: Offers & EMI Steps
  if (clean.startsWith('cat_')) {
    return offersFlow.renderOffersList(phone, contact, clean);
  }

  if (clean.startsWith('claim_offer_')) {
    const offerId = clean.replace('claim_offer_', '');
    return offersFlow.finalizeOfferLead(phone, contact, offerId);
  }

  // 6. Module 4: Accessories Steps
  if (clean.startsWith('acc_')) {
    return accessoriesFlow.renderAccessoryProducts(phone, contact, clean);
  }

  if (clean.startsWith('buy_acc_')) {
    return accessoriesFlow.handleAccessoryPurchase(phone, contact, clean);
  }

  // 7. Module 5: Human Handoff Steps
  if (clean.startsWith('dept_')) {
    return humanHandoffFlow.promptInquiryDetails(phone, contact, clean);
  }

  if (currentStep === 'agent_enter_details') {
    return humanHandoffFlow.executeAgentHandoff(phone, contact, messageText);
  }

  // Fallback for unhandled input
  return handleUnknownInput(phone, contact, clean);
}

/**
 * Global Navigation Commands Handler
 */
async function handleGlobalCommand(cmd, phone, contact) {
  switch (cmd) {
    case 'MENU':
    case 'RESTART':
      return mainMenuFlow.renderMainMenu(phone, contact);

    case 'BACK':
      return handleBackNavigation(phone, contact);

    case 'AGENT':
      return humanHandoffFlow.renderDepartmentMenu(phone, contact);

    case 'STOP':
      contact.consent = false;
      await contact.save();
      await sendMessage(
        phone,
        `You have opted out of promotional messages from iTechnic Mobiles. You will still receive essential order & warranty alerts. Reply *START* anytime to subscribe again.`
      );
      return true;

    default:
      return mainMenuFlow.renderMainMenu(phone, contact);
  }
}

/**
 * Back Navigation Stack Processor
 */
async function handleBackNavigation(phone, contact) {
  const previousStep = sessionManager.popStep(contact);
  await contact.save();

  switch (previousStep) {
    case 'main_menu':
      return mainMenuFlow.renderMainMenu(phone, contact);

    case 'buy_select_brand':
      return buyMobileFlow.renderBrandSelection(phone, contact);

    case 'buy_select_budget':
      return buyMobileFlow.renderBudgetSelection(phone, contact);

    case 'buy_select_requirement':
      return buyMobileFlow.renderRequirementSelection(phone, contact);

    case 'buy_show_results':
      return buyMobileFlow.renderTopMobiles(phone, contact);

    case 'acc_select_category':
      return accessoriesFlow.renderAccessoryCategories(phone, contact);

    case 'offers_select_category':
      return offersFlow.renderOfferCategories(phone, contact);

    case 'agent_select_department':
      return humanHandoffFlow.renderDepartmentMenu(phone, contact);

    default:
      return mainMenuFlow.renderMainMenu(phone, contact);
  }
}

/**
 * Friendly Fallback Handler
 */
async function handleUnknownInput(phone, contact, text) {
  const fallbackMsg = `👋 *Hi from iTechnic Mobiles!*\n\n` +
    `I didn't quite catch that. Please select an option from our main menu or type a command:\n\n` +
    `• *1* - 📱 Buy a New Mobile\n` +
    `• *2* - 📦 Track My Order\n` +
    `• *3* - 💳 Latest Offers & EMI\n` +
    `• *4* - 🛍️ Mobile Accessories\n` +
    `• *5* - 👨‍💼 Talk to Our Team\n\n` +
    `_Or reply *MENU* anytime to view all options._`;

  await sendInteractiveButtons(phone, fallbackMsg, [
    { id: 'btn_menu', title: 'Main Menu 🏠' },
    { id: 'opt_1_buy', title: 'Buy a Mobile 📱' },
    { id: 'opt_5_agent', title: 'Talk to Team 👨‍💼' }
  ]);
  return true;
}

module.exports = {
  processIncomingMessage,
  handleGlobalCommand,
  handleBackNavigation
};

