/**
 * Mobile Accessories Flow Handler
 * Category selection, device compatibility, product cards & instant checkout/lead capture
 */

const catalogService = require('../services/catalogService');
const leadService = require('../services/leadService');
const sessionManager = require('../services/sessionManager');
const { sendInteractiveList, sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');

/**
 * Step 1: Render Accessories Category Selection
 */
async function renderAccessoryCategories(phone, contact) {
  sessionManager.pushStep(contact, 'acc_select_category');
  await contact.save();

  const categories = catalogService.getAccessoryCategories();
  const rows = categories.map(c => ({
    id: c.id,
    title: c.name.substring(0, 24),
    description: `Original certified accessories`
  }));

  const text = `🛍️ *GENUINE MOBILE ACCESSORIES STORE* ⚡\n\n` +
    `Certified chargers, military drop-tested cases, 9D glass, and wireless audio.\n\n` +
    `Please select an accessory category below:`;

  await sendInteractiveList(
    phone,
    text,
    'Select Category',
    [{ title: 'Product Categories', rows }],
    null,
    'iTechnic Accessories'
  );
}

/**
 * Step 2: Show Products in Chosen Category
 */
async function renderAccessoryProducts(phone, contact, categoryId) {
  const categories = catalogService.getAccessoryCategories();
  const catObj = categories.find(c => c.id === categoryId) || categories[0];

  sessionManager.pushStep(contact, 'acc_show_products', { acc_category: catObj.name });
  await contact.save();

  const products = await catalogService.searchAccessories({ categoryName: catObj.name });

  if (!products || products.length === 0) {
    const emptyMsg = `ℹ️ Stock updating for *${catObj.name}*. Please check back or talk to our accessories specialist.`;
    await sendInteractiveButtons(phone, emptyMsg, [
      { id: 'opt_5_agent', title: 'Talk to Specialist 👨‍💼' },
      { id: 'opt_4_acc', title: 'Other Categories 🛍️' },
      { id: 'btn_menu', title: 'Main Menu 🏠' }
    ]);
    return;
  }

  let catalogText = `🛍️ *${catObj.name.toUpperCase()}*\n` +
    `─────────────────────────\n\n`;

  products.forEach((p, idx) => {
    catalogText += `*${idx + 1}️⃣ ${p.name}*\n` +
      `• 💰 Price: *₹${p.offerPrice.toLocaleString('en-IN')}* _(MRP: ~₹${p.price.toLocaleString('en-IN')}~)\n` +
      `• ✨ Features: ${(p.features || []).slice(0, 2).join(' · ') || 'Genuine OEM Grade'}\n` +
      `• 📦 Stock: In Stock at Store\n\n`;
  });

  catalogText += `─────────────────────────\n` +
    `_Select an item below to order with Free Store Pickup or Doorstep Delivery:_`;

  const rows = products.map((p, idx) => ({
    id: `buy_acc_${p.productId}`,
    title: `${idx + 1}. ${p.name}`.substring(0, 24),
    description: `₹${p.offerPrice.toLocaleString('en-IN')} · Buy / Order Now`
  }));

  await sendInteractiveList(
    phone,
    catalogText,
    'Select to Buy',
    [{ title: 'Available Items', rows }],
    null,
    'Accessories Store'
  );
}

/**
 * Step 3: Handle Accessory Purchase Action
 */
async function handleAccessoryPurchase(phone, contact, accId) {
  const productId = accId.replace('buy_acc_', '');
  const products = await catalogService.searchAccessories({});
  const product = products.find(p => p.productId === productId) || products[0];

  sessionManager.pushStep(contact, 'acc_confirm_order', {
    selected_acc_id: product.productId,
    selected_acc_name: product.name,
    selected_acc_price: product.offerPrice
  });
  await contact.save();

  const leadResult = await leadService.createLead({
    customerPhone: phone,
    customerName: contact.name || 'Valued Customer',
    interestType: 'Accessory Purchase',
    targetDevice: product.name,
    targetDevicePrice: product.offerPrice,
    budgetRange: `₹${product.offerPrice}`,
    purchasePreference: 'Visit Showroom',
    notesText: `Customer ordered accessory: ${product.name} (₹${product.offerPrice})`
  });

  const confirmText = `✅ *ACCESSORY RESERVED FOR COLLECTION!* 🛍️\n\n` +
    `Item: *${product.name}*\n` +
    `Special Offer Price: *₹${product.offerPrice.toLocaleString('en-IN')}*\n\n` +
    `📍 *Collect at Tirukannur Store:*\n` +
    `TV Malai Road, Tirukannur, Pondicherry - 605501\n` +
    `⏰ *Pickup Hours:* 10:00 AM – 8:00 PM\n\n` +
    `_Want home delivery? Our delivery rider will message you shortly to confirm address!_`;

  await sendInteractiveButtons(phone, confirmText, [
    { id: 'opt_1_buy', title: 'Buy Mobiles 📱' },
    { id: 'opt_4_acc', title: 'More Accessories 🛍️' },
    { id: 'btn_menu', title: 'Main Menu 🏠' }
  ]);
}

module.exports = {
  renderAccessoryCategories,
  renderAccessoryProducts,
  handleAccessoryPurchase
};

