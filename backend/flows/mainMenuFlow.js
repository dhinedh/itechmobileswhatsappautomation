/**
 * Main Menu Flow Handler
 * Renders the 5 Core Pillars and routes incoming selections
 */

const { sendInteractiveList, sendInteractiveButtons, sendMessage } = require('../services/whatsappClient');
const sessionManager = require('../services/sessionManager');

const MAIN_MENU_TEXT = `📱 *WELCOME TO iTechnic Mobiles!* 🛍️\n` +
  `_Pondicherry's Trusted Smartphone & Accessories Destination_\n\n` +
  `How can our team serve you today?\n\n` +
  `*1️⃣ 📱 BUY A NEW MOBILE*\n` +
  `_Find your ideal smartphone with our guided specs & price recommender._\n\n` +
  `*2️⃣ 📦 TRACK MY ORDER*\n` +
  `_Check live dispatch, courier partner & delivery rider status._\n\n` +
  `*3️⃣ 💳 LATEST OFFERS & EMI*\n` +
  `_Bank card discounts, 0% No-Cost EMI & exchange bonuses._\n\n` +
  `*4️⃣ 🛍️ MOBILE ACCESSORIES*\n` +
  `_Cases, 20W/65W chargers, 9D glass, power banks & earbuds._\n\n` +
  `*5️⃣ 👨‍💼 TALK TO OUR TEAM*\n` +
  `_Connect directly with our sales, order, billing or repair executives._\n\n` +
  `─────────────────────────\n` +
  `💡 *Pro-tip:* Reply with a number (1-5) or tap below.\n` +
  `_Type *BACK* to return to previous step, or *MENU* anytime._`;

async function renderMainMenu(phone, contact) {
  sessionManager.resetSession(contact);
  await contact.save();

  const sections = [
    {
      title: 'Choose Service',
      rows: [
        { id: 'opt_1_buy', title: '1. Buy a New Mobile', description: 'Smartphones by brand, budget & usage' },
        { id: 'opt_2_track', title: '2. Track My Order', description: 'Live delivery & status tracking' },
        { id: 'opt_3_offers', title: '3. Latest Offers & EMI', description: 'Bank deals, 0% No-Cost EMI & exchange' },
        { id: 'opt_4_acc', title: '4. Mobile Accessories', description: 'Chargers, cases, glass & earbuds' },
        { id: 'opt_5_agent', title: '5. Talk to Our Team', description: 'Connect with senior store executive' }
      ]
    }
  ];

  await sendInteractiveList(
    phone,
    MAIN_MENU_TEXT,
    'Explore Services',
    sections,
    null,
    'iTechnic Mobiles Menu'
  );
}

module.exports = {
  renderMainMenu
};

