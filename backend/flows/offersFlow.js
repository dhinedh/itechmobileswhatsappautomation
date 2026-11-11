/**
 * Latest Offers & EMI Calculator Flow Handler
 * Bank card deals, Zero-Cost EMI options & high-intent finance lead generator
 */

const offerService = require('../services/offerService');
const leadService = require('../services/leadService');
const sessionManager = require('../services/sessionManager');
const { sendInteractiveList, sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');

/**
 * Step 1: Render Offer Category Selection
 */
async function renderOfferCategories(phone, contact) {
  sessionManager.pushStep(contact, 'offers_select_category');
  await contact.save();

  const categories = offerService.getOfferCategories();
  const rows = categories.map(c => ({
    id: c.id,
    title: c.name.substring(0, 24),
    description: c.categoryKey
  }));

  const text = `💳 *LATEST OFFERS & 0% NO-COST EMI* 🔥\n\n` +
    `Unlock exclusive festive deals, instant bank cashbacks & zero-interest finance plans.\n\n` +
    `Please select an offer category to view active schemes:`;

  await sendInteractiveList(
    phone,
    text,
    'Select Offer Category',
    [{ title: 'Active Schemes', rows }],
    null,
    'Deals & EMI Desk'
  );
}

/**
 * Step 2: Display Offers for the chosen category
 */
async function renderOffersList(phone, contact, categoryId) {
  const categories = offerService.getOfferCategories();
  const catObj = categories.find(c => c.id === categoryId) || categories[0];

  sessionManager.pushStep(contact, 'offers_show_deals', { selected_offer_cat: catObj.categoryKey });
  await contact.save();

  const offers = await offerService.getOffersByCategory(catObj.categoryKey);

  if (!offers || offers.length === 0) {
    const emptyMsg = `ℹ️ Currently all deals under *${catObj.name}* have been claimed.\n\nWould you like to speak to our store finance desk for custom EMI approval?`;
    await sendInteractiveButtons(phone, emptyMsg, [
      { id: 'opt_5_agent', title: 'Talk to Finance 👨‍💼' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ]);
    return;
  }

  const primaryOffer = offers[0];
  sessionManager.updateWizardData(contact, { active_offer_id: primaryOffer.offerId, active_offer_title: primaryOffer.title });
  await contact.save();

  const cardText = offerService.formatOfferCard(primaryOffer, 50000);

  const buttons = [
    { id: `claim_offer_${primaryOffer.offerId}`, title: 'Claim This Offer 🏷️' },
    { id: 'opt_1_buy', title: 'View Mobiles 📱' },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ];

  await sendInteractiveButtons(phone, cardText, buttons);
}

/**
 * Step 3: Finalize Offer Lead & Send Pre-Approval Voucher
 */
async function finalizeOfferLead(phone, contact, offerId) {
  const wizard = contact.session?.wizard_data || {};

  const leadResult = await leadService.createLead({
    customerPhone: phone,
    customerName: contact.name || 'Valued Customer',
    interestType: 'EMI Inquiry',
    targetDevice: wizard.active_offer_title || 'Bank / EMI Deal',
    budgetRange: '0% No-Cost EMI',
    purchasePreference: 'Visit Showroom',
    notesText: `Customer requested reservation for deal: ${wizard.active_offer_title || offerId}`
  });

  // Notify store finance desk
  const salesPhone = leadResult.assignedExecutive?.phone || process.env.SALES_TEAM_PHONE;
  if (salesPhone) {
    await sendMessage(
      salesPhone,
      `💳 *0% EMI / OFFER RESERVATION REQUEST* 🏷️\n` +
      `Customer: ${contact.name || 'Customer'} (${phone})\n` +
      `Deal: ${wizard.active_offer_title || offerId}\n` +
      `Please contact customer with bank qualification criteria.`
    );
  }

  const voucherText = `🎉 *OFFER RESERVED FOR YOU!* 🏷️\n` +
    `Voucher Code: *ITECHNIC-EMI-PASS*\n\n` +
    `Show this WhatsApp message at our Tirukannur showroom counter to claim *${wizard.active_offer_title || 'Special EMI Offer'}*.\n\n` +
    `📍 *iTechnic Mobiles Showroom:*\nTV Malai Road, Tirukannur, Pondicherry - 605501\n` +
    `⏰ *Timings:* 10:00 AM – 8:00 PM (Mon–Sat)\n📞 *Finance Desk:* +91 9361863063\n\n` +
    `_Our finance executive will also call you shortly to assist with documentation!_`;

  await sendInteractiveButtons(phone, voucherText, [
    { id: 'opt_1_buy', title: 'Browse Mobiles 📱' },
    { id: 'opt_4_acc', title: 'Buy Accessories 🛍️' },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ]);
}

module.exports = {
  renderOfferCategories,
  renderOffersList,
  finalizeOfferLead
};

