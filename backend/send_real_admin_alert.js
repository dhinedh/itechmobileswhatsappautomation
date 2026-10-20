require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // Now 868952799641767
const TARGET = '918838887064';

async function sendRealAdminAlert() {
    console.log(`=== TESTING REAL META CLOUD API FOR LIVE PHONE ID ${PHONE_NUMBER_ID} TO ${TARGET} ===\n`);

    // 1. Repair Booking Alert (Interactive Buttons)
    const orderMsg = `🔧 *NEW REPAIR SERVICE BOOKED!* 📱\n\n` +
        `🆔 *Job ID:* REP-8392\n` +
        `👤 *Customer:* Ramesh Kumar\n` +
        `📞 *Phone:* 919976719422\n` +
        `📱 *Device:* Apple iPhone 13 Pro\n` +
        `🛠️ *Service:* Screen Replacement\n` +
        `📝 *Issue:* Display glass cracked, touch working\n` +
        `💰 *Estimated Cost:* From ₹4,500\n` +
        `⏱️ *Turnaround:* 60–90 mins (Same Day)\n\n` +
        `👇 *Tap below to update repair status:*`;

    try {
        console.log(`1️⃣ Sending Repair Alert to ${TARGET} via Phone ID ${PHONE_NUMBER_ID}...`);
        const res1 = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
            data: {
                messaging_product: 'whatsapp',
                to: TARGET,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: orderMsg },
                    action: {
                        buttons: [
                            { type: 'reply', reply: { id: 'rep_Diag_REP-8392', title: 'Diagnosing 🔬' } },
                            { type: 'reply', reply: { id: 'rep_Repair_REP-8392', title: 'In Repair ⚙️' } },
                            { type: 'reply', reply: { id: 'rep_Ready_REP-8392', title: 'Ready Pickup 🎉' } }
                        ]
                    }
                }
            }
        });
        console.log('✅ Interactive Repair Alert Result:', JSON.stringify(res1.data, null, 2));
    } catch (err) {
        console.error('❌ Interactive Alert Error:', err?.response?.data || err.message);
    }

    // 2. Low Stock Accessory Alert
    const stockMsg = `⚠️ *LOW STOCK ALERT!* 📦\n\n` +
        `Product: *20W PD Fast Charger (iPhone/Type-C)*\n` +
        `Remaining Stock: *3 items*\n\n` +
        `💡 Accessory stock is running low at iTechnic Mobiles store!`;

    try {
        console.log(`\n2️⃣ Sending Low Stock Alert to ${TARGET}...`);
        const res2 = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
            data: {
                messaging_product: 'whatsapp',
                to: TARGET,
                type: 'text',
                text: { body: stockMsg }
            }
        });
        console.log('✅ Low Stock Alert Result:', JSON.stringify(res2.data, null, 2));
    } catch (err) {
        console.error('❌ Low Stock Alert Error:', err?.response?.data || err.message);
    }
}

sendRealAdminAlert();
