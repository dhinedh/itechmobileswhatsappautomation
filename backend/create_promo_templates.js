require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const WABA_ID = process.env.WABA_ID;

const promotionalTemplates = [
  {
    name: 'promotional_offer_broadcast',
    category: 'MARKETING',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Special Offer from iTechnic Mobiles'
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}! 🎉\n\nWe have an exclusive offer for you: {{2}}!\n\nGet up to {{3}} off on screen replacements, battery replacements, and phone accessories.\n\nOffer valid till: {{4}}\nVisit our store at Tirukannur or reply to this message to book doorstep service!',
        example: {
          body_text: [
            ['Customer', 'Weekend Mega Repair Discount', '25%', 'this Sunday']
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'iTechnic Mobiles • Reply STOP to unsubscribe'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Book Repair'
          },
          {
            type: 'QUICK_REPLY',
            text: 'View Pricing'
          }
        ]
      }
    ]
  },
  {
    name: 'festival_discount_promo',
    category: 'MARKETING',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Festive Season Savings'
      },
      {
        type: 'BODY',
        text: 'Happy Festive Season, {{1}}! 🪔✨\n\nCelebrate with iTechnic Mobiles! Get {{2}} discount on all mobile repairs, display fixes, and premium tempered glass.\n\nUse Promo Code: {{3}}\nOffer valid until: {{4}}\n\nVisit our service center at Tirukannur or book our doorstep pickup today!',
        example: {
          body_text: [
            ['Customer', 'Flat 20%', 'FESTIVE20', '31st October']
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'iTechnic Mobiles • Reply STOP to opt out'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Claim Offer'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Store Location'
          }
        ]
      }
    ]
  },
  {
    name: 'service_discount_broadcast',
    category: 'MARKETING',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Express Mobile Repair Deals'
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}! Is your smartphone battery draining fast or display cracked? 📱🔧\n\nGet certified repair with genuine parts and 90-day warranty starting at just ₹{{2}}.\n\nLimited period offer: {{3}}\nDoorstep pickup & drop available across Pondicherry!',
        example: {
          body_text: [
            ['Customer', '499', 'Free Tempered Glass with every screen replacement']
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'iTechnic Mobiles • Reply STOP to opt out'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Book Pickup'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Talk to Expert'
          }
        ]
      }
    ]
  }
];

async function createTemplates() {
  console.log(`Submitting Promotional Templates to WABA ID: ${WABA_ID}...\n`);

  for (const tpl of promotionalTemplates) {
    try {
      const res = await axios.post(
        `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
        tpl,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Created: "${tpl.name}" | ID: ${res.data.id} | Status: ${res.data.status || 'PENDING'}`);
    } catch (err) {
      console.error(`❌ Failed to create "${tpl.name}":`, err.response?.data || err.message);
    }
  }
}

createTemplates();
