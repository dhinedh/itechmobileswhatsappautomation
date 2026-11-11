/**
 * Buy a New Mobile Flow Handler
 * Guided Phone Discovery, Use-Case Filtering, Comparison & CRM Lead Capture
 */

const catalogService = require('../services/catalogService');
const leadService = require('../services/leadService');
const sessionManager = require('../services/sessionManager');
const { sendInteractiveList, sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');

/**
 * Step 1: Render Brand Selection
 */
async function renderBrandSelection(phone, contact) {
  sessionManager.pushStep(contact, 'buy_select_brand');
  await contact.save();

  const brands = catalogService.getBrands();
  const rows = brands.map(b => ({
    id: b.id,
    title: b.name.substring(0, 24),
    description: b.tag
  }));

  const text = `📱 *BUY A NEW MOBILE - STEP 1 OF 3*\n\n` +
    `Which smartphone brand are you interested in?\n` +
    `Select your favorite brand below or choose *Browse All*:`;

  await sendInteractiveList(
    phone,
    text,
    'Select Brand',
    [{ title: 'Popular Smartphone Brands', rows }],
    null,
    'iTechnic Phone Finder'
  );
}

/**
 * Step 2: Render Budget Selection
 */
async function renderBudgetSelection(phone, contact) {
  sessionManager.pushStep(contact, 'buy_select_budget');
  await contact.save();

  const brandName = contact.session?.wizard_data?.brand_name || 'Selected Brand';
  const text = `💰 *BUY A NEW MOBILE - STEP 2 OF 3*\n` +
    `Brand: *${brandName}*\n\n` +
    `What is your preferred price budget range?`;

  const buttons = [
    { id: 'budget_1', title: 'Under ₹15,000' },
    { id: 'budget_2', title: '₹15k – ₹30,000' },
    { id: 'budget_3', title: '₹30k – ₹50,000' }
  ];

  // We offer primary 3 as buttons, or list for higher tiers
  const sections = [
    {
      title: 'Select Budget Range',
      rows: [
        { id: 'budget_1', title: '1. Under ₹15,000', description: 'Budget 5G & Everyday Essentials' },
        { id: 'budget_2', title: '2. ₹15,000 – ₹30,000', description: 'Mid-range Value & Gaming' },
        { id: 'budget_3', title: '3. ₹30,000 – ₹50,000', description: 'Premium Camera & Curved OLED' },
        { id: 'budget_4', title: '4. ₹50,000 – ₹80,000', description: 'Flagship Performance' },
        { id: 'budget_5', title: '5. Above ₹80,000', description: 'Ultra-Premium Flagship' }
      ]
    }
  ];

  await sendInteractiveList(
    phone,
    text,
    'Choose Budget',
    sections,
    null,
    'Budget Selection'
  );
}

/**
 * Step 3: Render Primary Requirement Selection
 */
async function renderRequirementSelection(phone, contact) {
  sessionManager.pushStep(contact, 'buy_select_requirement');
  await contact.save();

  const brandName = contact.session?.wizard_data?.brand_name || 'Selected Brand';
  const budgetTier = contact.session?.wizard_data?.budget_label || 'All Budgets';

  const text = `🎯 *BUY A NEW MOBILE - STEP 3 OF 3*\n` +
    `Brand: *${brandName}* · Budget: *${budgetTier}*\n\n` +
    `What is your primary priority or usage requirement?`;

  const sections = [
    {
      title: 'Primary Priority',
      rows: [
        { id: 'req_camera', title: '1. Camera & Portraits', description: 'High MP, OIS & Studio Portrait lens' },
        { id: 'req_gaming', title: '2. Gaming & High Speed', description: 'Flagship chip, 120Hz & vapor cooling' },
        { id: 'req_battery', title: '3. Battery Endurance', description: '5500-6000mAh with fast turbo charge' },
        { id: 'req_performance', title: '4. Flagship Power', description: 'Fast multitasking & future-proof' },
        { id: 'req_business', title: '5. Business & Work', description: 'Lightweight, eSIM & enterprise security' },
        { id: 'req_overall', title: '6. Best All-Rounder', description: 'Balanced performance, battery & camera' }
      ]
    }
  ];

  await sendInteractiveList(
    phone,
    text,
    'Select Priority',
    sections,
    null,
    'Usage Requirement'
  );
}

/**
 * Step 4: Show Top 3 Recommended Mobiles
 */
async function renderTopMobiles(phone, contact) {
  sessionManager.pushStep(contact, 'buy_show_results');
  const wizard = contact.session?.wizard_data || {};

  const results = await catalogService.searchPhones({
    brand: wizard.brand_id,
    budgetId: wizard.budget_id,
    requirementId: wizard.requirement_id
  });

  if (!results || results.length === 0) {
    const fallbackMsg = `ℹ️ No exact match found for this specific combination.\n\n` +
      `Here are our top recommended flagship models across all brands.\n` +
      `Reply *BACK* to adjust your budget or requirement.`;
    await sendMessage(phone, fallbackMsg);
    wizard.brand_id = 'brand_all';
    wizard.budget_id = null;
  }

  const top3 = results.slice(0, 3);
  sessionManager.updateWizardData(contact, { search_results: top3.map(p => p.productId) });
  await contact.save();

  let resultsText = `🏆 *TOP RECOMMENDED MOBILES FOR YOU:*\n` +
    `Priority: *${wizard.requirement_label || 'High Performance'}*\n` +
    `─────────────────────────\n\n`;

  top3.forEach((p, idx) => {
    resultsText += `*${idx + 1}️⃣ ${p.name}*\n` +
      `• 💰 Price: *₹${p.offerPrice.toLocaleString('en-IN')}* (MRP: ~₹${p.price.toLocaleString('en-IN')}~)\n` +
      `• ⚡ Chip: ${p.specs?.processor || 'Fast Octa-core'}\n` +
      `• 📷 Camera: ${p.specs?.rearCamera || '50MP OIS'}\n` +
      `• 🔋 Battery: ${p.specs?.battery || '5000 mAh'}\n\n`;
  });

  resultsText += `─────────────────────────\n` +
    `_Select a phone below to view full specifications, compare, or book:_`;

  const rows = top3.map((p, idx) => ({
    id: `view_phone_${p.productId}`,
    title: `${idx + 1}. ${p.name}`.substring(0, 24),
    description: `₹${p.offerPrice.toLocaleString('en-IN')} · ${p.specs?.processor?.slice(0, 30) || 'Top Spec'}`
  }));

  await sendInteractiveList(
    phone,
    resultsText,
    'View Mobile Details',
    [{ title: 'Top Recommendations', rows }],
    null,
    'Top Recommendations'
  );
}

/**
 * Step 5: Render Detailed Specifications for Selected Phone
 */
async function renderDeviceDetail(phone, contact, productId) {
  const phoneObj = await catalogService.getPhoneById(productId);
  sessionManager.pushStep(contact, 'buy_device_detail', { selected_phone_id: phoneObj.productId, selected_phone_name: phoneObj.name });
  await contact.save();

  const colors = (phoneObj.colors || []).map(c => c.name).join(', ') || 'Titanium, Black, Blue';
  const features = (phoneObj.features || []).map(f => `✓ ${f}`).join('\n');

  const detailText = `📱 *${phoneObj.name.toUpperCase()}*\n` +
    `─────────────────────────\n` +
    `💰 *Offer Price:* ₹${phoneObj.offerPrice.toLocaleString('en-IN')} _(MRP: ₹${phoneObj.price.toLocaleString('en-IN')})_\n` +
    `🏷️ *Save ₹${(phoneObj.price - phoneObj.offerPrice).toLocaleString('en-IN')}* with 0% No-Cost EMI\n\n` +
    `📋 *KEY SPECIFICATIONS:*\n` +
    `• 🖥️ *Display:* ${phoneObj.specs?.display}\n` +
    `• ⚡ *Processor:* ${phoneObj.specs?.processor}\n` +
    `• 💾 *Memory:* ${phoneObj.specs?.ram} | ${phoneObj.specs?.storage}\n` +
    `• 📷 *Cameras:* ${phoneObj.specs?.rearCamera} (Front: ${phoneObj.specs?.frontCamera})\n` +
    `• 🔋 *Battery:* ${phoneObj.specs?.battery}\n` +
    `• 🎨 *Available Colors:* ${colors}\n` +
    `• 📦 *Stock Status:* ✅ In Stock at Tirukannur Showroom\n\n` +
    `✨ *HIGHLIGHTS:*\n${features}\n` +
    `─────────────────────────\n` +
    `_What would you like to do next?_`;

  const buttons = [
    { id: 'btn_buy_now', title: 'Buy / Reserve Phone 🛍️' },
    { id: 'btn_compare_init', title: 'Compare Phone ⚖️' },
    { id: 'btn_back_results', title: 'Browse More 📱' }
  ];

  await sendInteractiveButtons(phone, detailText, buttons, phoneObj.imageUrl || null);
}

/**
 * Step 6: Initialize Comparison (Pick 2nd Phone)
 */
async function renderComparePicker(phone, contact) {
  sessionManager.pushStep(contact, 'buy_compare_select');
  await contact.save();

  const currentId = contact.session?.wizard_data?.selected_phone_id;
  const currentName = contact.session?.wizard_data?.selected_phone_name || 'Device';

  // Retrieve candidate phones for comparison
  const phones = await catalogService.searchPhones({ brand: 'brand_all' });
  const otherPhones = phones.filter(p => p.productId !== currentId).slice(0, 5);

  const text = `⚖️ *COMPARE WITH ANOTHER PHONE*\n` +
    `Currently viewing: *${currentName}*\n\n` +
    `Select another smartphone from below to generate a side-by-side spec comparison:`;

  const rows = otherPhones.map(p => ({
    id: `comp_with_${p.productId}`,
    title: p.name.substring(0, 24),
    description: `₹${p.offerPrice.toLocaleString('en-IN')} · ${p.brand}`
  }));

  await sendInteractiveList(
    phone,
    text,
    'Select Competitor',
    [{ title: 'Compare Against', rows }],
    null,
    'Compare Mobiles'
  );
}

/**
 * Step 7: Display Side-by-Side Comparison Matrix
 */
async function renderComparisonMatrix(phone, contact, compareId) {
  const currentId = contact.session?.wizard_data?.selected_phone_id;
  const comparison = await catalogService.comparePhones(currentId, compareId);

  sessionManager.pushStep(contact, 'buy_show_comparison');
  await contact.save();

  const buttons = [
    { id: `view_phone_${currentId}`, title: `Buy ${comparison.phone1.brand}` },
    { id: `view_phone_${compareId}`, title: `Buy ${comparison.phone2.brand}` },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ];

  await sendInteractiveButtons(phone, comparison.comparisonText, buttons);
}

/**
 * Step 8: Purchase / Lead Handoff Options
 */
async function renderPurchaseOptions(phone, contact) {
  sessionManager.pushStep(contact, 'buy_select_purchase_option');
  await contact.save();

  const phoneName = contact.session?.wizard_data?.selected_phone_name || 'Selected Phone';

  const text = `🛍️ *HOW WOULD YOU LIKE TO PURCHASE?*\n` +
    `Selected Model: *${phoneName}*\n\n` +
    `Please choose your preferred option:\n\n` +
    `*1️⃣ Visit Tirukannur Showroom*\n` +
    `_Reserve your piece & collect with free 9D tempered glass installation._\n\n` +
    `*2️⃣ Request Home Delivery (Pondicherry Region)*\n` +
    `_Free same-day express doorstep delivery with Cash / UPI on Delivery._\n\n` +
    `*3️⃣ Talk to Sales Executive / Request Callback*\n` +
    `_Get dedicated pricing guidance, exchange valuation & finance help._`;

  const buttons = [
    { id: 'pref_showroom', title: 'Visit Showroom 🏬' },
    { id: 'pref_delivery', title: 'Home Delivery 🚚' },
    { id: 'pref_callback', title: 'Speak to Sales 👨‍💼' }
  ];

  await sendInteractiveButtons(phone, text, buttons);
}

/**
 * Step 9: Finalize Lead & Send Confirmation
 */
async function finalizePurchaseLead(phone, contact, preferenceType) {
  const wizard = contact.session?.wizard_data || {};
  let prefLabel = 'Visit Showroom';
  if (preferenceType.includes('delivery')) prefLabel = 'Home Delivery';
  if (preferenceType.includes('callback') || preferenceType.includes('sales')) prefLabel = 'Talk to Sales';

  const result = await leadService.createLead({
    customerPhone: phone,
    customerName: contact.name || 'Valued Customer',
    interestType: 'Mobile Purchase',
    targetDevice: wizard.selected_phone_name || 'Smartphone Inquiry',
    targetDevicePrice: wizard.selected_phone_price || 0,
    budgetRange: wizard.budget_label || 'Standard',
    purchasePreference: prefLabel,
    notesText: `Customer filtered for ${wizard.requirement_label || 'general'}`
  });

  // 1. Notify Sales Executive on WhatsApp
  const salesPhone = result.assignedExecutive?.phone || process.env.SALES_TEAM_PHONE;
  if (salesPhone) {
    const alertMsg = leadService.formatExecutiveAlert(result.lead);
    await sendMessage(salesPhone, alertMsg);
  }

  // 2. Send Confirmation & Voucher to Customer
  const custAck = leadService.formatCustomerLeadAck(result.lead);
  await sendInteractiveButtons(phone, custAck, [
    { id: 'opt_3_offers', title: 'Check EMI Deals 💳' },
    { id: 'opt_4_acc', title: 'Buy Accessories 🛍️' },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ]);
}

module.exports = {
  renderBrandSelection,
  renderBudgetSelection,
  renderRequirementSelection,
  renderTopMobiles,
  renderDeviceDetail,
  renderComparePicker,
  renderComparisonMatrix,
  renderPurchaseOptions,
  finalizePurchaseLead
};

