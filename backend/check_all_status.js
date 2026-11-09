require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const WABA_ID = process.env.WABA_ID;

async function checkStatus(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates?limit=50`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          timeout: 15000
        }
      );
      console.log(`✅ Success! Total templates in Meta: ${res.data.data?.length || 0}\n`);
      (res.data.data || []).forEach((t, idx) => {
        console.log(`${idx + 1}. [${t.status}] ${t.name} (${t.category}, ${t.language}) - ID: ${t.id}`);
        if (t.reason) console.log(`   Reason: ${t.reason}`);
      });
      return;
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) {
        console.error('Final error:', err.response?.data || err.message);
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
}

checkStatus();
