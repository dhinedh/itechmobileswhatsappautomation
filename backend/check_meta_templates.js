require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const WABA_ID = process.env.WABA_ID || '1758570912097342';

async function checkTemplates() {
    try {
        console.log(`Fetching Message Templates for WABA ID: ${WABA_ID}...`);
        const templateRes = await axios.get(
            `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates?limit=100`,
            { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
        );
        const list = templateRes.data.data || [];
        console.log(`\nFound ${list.length} message templates on Meta:\n`);
        list.forEach((t, i) => {
            console.log(`${i + 1}. [${t.status}] ${t.name} (${t.category}, ${t.language})`);
        });
    } catch (err) {
        console.error('Error fetching templates:', err?.response?.data || err.message);
    }
}

checkTemplates();
