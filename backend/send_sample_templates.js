require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TARGET_PHONE = '919342400879';

const samples = [
  {
    title: '1. Repair Booking Confirmed (repair_booking_confirmed)',
    message: `🛠️ *Repair Booking Confirmed*\n\nHello Murali, your repair booking has been confirmed!\n\n📋 Job ID: *REP-1024*\n📱 Device: *Apple iPhone 13*\n🛠️ Service: *Screen Replacement*\n⏱️ Turnaround: *Same Day*\n\nOur technician is preparing your repair. Thank you for choosing iTechnic Mobiles!\n\n_iTechnic Mobiles • We Repair. You Relax._`
  },
  {
    title: '2. Repair Status Update (repair_status_update)',
    message: `⚙️ *Repair Status Update*\n\nHello Murali, here is an update on your repair:\n\n📋 Job ID: *REP-1024*\n📱 Device: *Apple iPhone 13*\n⚡ Status: *In Repair (Technician Diagnosing)*\n\nWe will notify you as soon as your device is ready for collection.\n\n_iTechnic Mobiles • Tirukannur_`
  },
  {
    title: '3. Device Ready for Pickup (repair_ready_pickup)',
    message: `🎉 *Device Ready for Pickup*\n\nHello Murali, great news! Your *Apple iPhone 13* (Job ID: *REP-1024*) has been repaired and tested.\n\n💰 Total Amount: *₹3,500*\n📍 Store: *iTechnic Mobiles, TV Malai Road, Tirukannur*\n⏰ Timings: *10:00 AM – 8:00 PM*\n\nPlease visit our store to collect your device.\n\n_iTechnic Mobiles • +91 9361863063_`
  },
  {
    title: '4. Doorstep Pickup Scheduled (doorstep_pickup_confirmed)',
    message: `🛵 *Doorstep Pickup Scheduled*\n\nHello Murali, your doorstep device pickup has been scheduled!\n\n📋 Request ID: *PU-502*\n📱 Device: *OnePlus 11*\n🕒 Slot: *Today, 3:00 PM – 5:00 PM*\n📍 Address: *No. 12, Main Street, Pondicherry*\n\nOur executive will reach your location as scheduled.\n\n_iTechnic Mobiles Doorstep Care_`
  },
  {
    title: '5. Service Quotation (service_quotation_estimate)',
    message: `💰 *Service Quotation*\n\nHello Murali, here is your diagnosis and estimated quote for *Samsung S21* (Job ID: *REP-1024*):\n\n🔍 Issue: *Display Touch Panel Replacement*\n💰 Quoted Cost: *₹4,500*\n\nPlease reply to confirm if you would like us to proceed with this service.\n\n_iTechnic Mobiles Certified Technicians_`
  },
  {
    title: '6. Admin Service Alert (admin_service_alert)',
    message: `⚠️ *New Service Request Alert*\n\nNew customer service request received:\n\n👤 Customer: *Murali*\n📞 Phone: *919342400879*\n📱 Device: *iPhone 13 Pro*\n🛠️ Service: *Battery Replacement*\n🆔 ID: *REP-8392*\n\nPlease check the CRM dashboard to assign or update.\n\n_iTechnic Mobiles CRM_`
  },
  {
    title: '7. Welcome Greeting (itechnic_welcome_greeting)',
    message: `👋 *Welcome to iTechnic Mobiles*\n\nHello Murali! Welcome to iTechnic Mobiles, Pondicherry trusted mobile sales, repairs, and accessories center.\n\nWe provide certified smartphone screen and battery replacements, genuine accessories, old phone trade-in, and doorstep pickup.\n\nHow can our team help you today?\n\n_We Repair. You Relax._`
  },
  {
    title: '8. Customer Feedback (customer_feedback_review)',
    message: `⭐ *Thank You for Choosing Us*\n\nHello Murali, thank you for trusting iTechnic Mobiles with your *iPhone 13* service (Job ID: *REP-1024*)!\n\nYour satisfaction is our top priority. Could you please take a moment to share your feedback or rate your experience with us?\n\n_iTechnic Mobiles Support_`
  },
  {
    title: '9. Promotional Offer Broadcast (promotional_offer_broadcast)',
    message: `📢 *Special Offer from iTechnic Mobiles*\n\nHello Murali! 🎉\n\nWe have an exclusive offer for you: *Weekend Mega Repair Discount*!\n\nGet up to *25% off* on screen replacements, battery replacements, and phone accessories.\n\nOffer valid till: *this Sunday*\nVisit our store at Tirukannur or reply to this message to book doorstep service!\n\n_iTechnic Mobiles • Reply STOP to unsubscribe_`
  },
  {
    title: '10. Festival Discount Promo (festival_discount_promo)',
    message: `🪔 *Festive Season Savings*\n\nHappy Festive Season, Murali! ✨\n\nCelebrate with iTechnic Mobiles! Get *Flat 20%* discount on all mobile repairs, display fixes, and premium tempered glass.\n\nUse Promo Code: *FESTIVE20*\nOffer valid until: *31st October*\n\nVisit our service center at Tirukannur or book our doorstep pickup today!\n\n_iTechnic Mobiles • Reply STOP to opt out_`
  },
  {
    title: '11. Express Service Discount (service_discount_broadcast)',
    message: `⚡ *Express Mobile Repair Deals*\n\nHello Murali! Is your smartphone battery draining fast or display cracked? 📱🔧\n\nGet certified repair with genuine parts and 90-day warranty starting at just *₹499*.\n\nLimited period offer: *Free Tempered Glass with every screen replacement*\nDoorstep pickup & drop available across Pondicherry!\n\n_iTechnic Mobiles • Reply STOP to opt out_`
  }
];

async function sendAllSamples() {
  console.log(`🚀 Sending all 11 sample template messages to +${TARGET_PHONE} via iTechnic Mobiles Bot...\n`);

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    console.log(`[${i + 1}/${samples.length}] Sending: ${s.title}...`);
    try {
      const res = await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: TARGET_PHONE,
          type: 'text',
          text: {
            body: `📌 *[SAMPLE TEMPLATE ${i + 1}/11]*\n\n${s.message}`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ✅ Sent! (Message ID: ${res.data.messages?.[0]?.id})`);
    } catch (err) {
      console.error(`   ❌ Failed:`, err.response?.data || err.message);
    }
    // Small delay between messages to ensure sequential delivery
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n🎉 All 11 sample template messages have been dispatched to +${TARGET_PHONE}!`);
}

sendAllSamples();
