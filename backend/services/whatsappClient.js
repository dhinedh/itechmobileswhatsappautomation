/**
 * WhatsApp Cloud API Client Wrapper
 * High-reliability sender for Text, Interactive Buttons, and Interactive Lists
 */

const axios = require('axios');
require('dotenv').config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

function normalizePhone(phone) {
  if (!phone) return '';
  const clean = phone.toString().replace(/\D/g, '');
  if (clean.length === 10) return '91' + clean;
  if (clean.length > 10 && clean.length <= 15) return clean;
  return '';
}

async function sendMessage(to, text) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return;
  const target = normalizePhone(to);
  if (!target || target.length < 10) return;
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      data: { messaging_product: 'whatsapp', to: target, type: 'text', text: { body: text } }
    });
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}

async function sendInteractiveButtons(to, bodyText, buttonsArray, imageUrl = null) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return;
  const target = normalizePhone(to);

  const buttons = buttonsArray.slice(0, 3).map(btn => ({
    type: 'reply',
    reply: { id: btn.id, title: btn.title.substring(0, 20) }
  }));

  const interactiveData = {
    type: 'button',
    body: { text: bodyText },
    action: { buttons }
  };

  if (imageUrl) {
    interactiveData.header = { type: 'image', image: { link: imageUrl } };
  }

  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      data: { messaging_product: 'whatsapp', to: target, type: 'interactive', interactive: interactiveData }
    });
  } catch (error) {
    console.warn(`[sendInteractiveButtons] Interactive fallback -> ${target}:`, error.message);
    if (imageUrl) {
      delete interactiveData.header;
      try {
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          data: { messaging_product: 'whatsapp', to: target, type: 'interactive', interactive: interactiveData }
        });
        return;
      } catch (e2) {}
    }
    // Plain text fallback
    const textWithButtons = bodyText + '\n\n' + buttonsArray.map((b, i) => `${i + 1}️⃣ *${b.title}*`).join('\n');
    await sendMessage(target, textWithButtons).catch(() => {});
  }
}

async function sendInteractiveList(to, bodyText, buttonText, sections, imageUrl = null, headerText = 'iTechnic Mobiles') {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return;
  const target = normalizePhone(to);

  const sanitizedSections = (sections || []).map(sec => ({
    title: (sec.title || '').substring(0, 24),
    rows: (sec.rows || []).slice(0, 10).map(row => ({
      id: row.id,
      title: (row.title || '').substring(0, 24),
      ...(row.description ? { description: row.description.substring(0, 72) } : {})
    }))
  }));

  const interactiveData = {
    type: 'list',
    body: { text: bodyText },
    action: {
      button: buttonText.substring(0, 20),
      sections: sanitizedSections
    }
  };

  if (imageUrl) {
    interactiveData.header = { type: 'image', image: { link: imageUrl } };
  } else if (headerText) {
    interactiveData.header = { type: 'text', text: headerText.substring(0, 60) };
  }

  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      data: { messaging_product: 'whatsapp', to: target, type: 'interactive', interactive: interactiveData }
    });
  } catch (error) {
    console.warn('[sendInteractiveList] Falling back to text list:', error.message);
    let listText = bodyText + '\n\n';
    sections.forEach(sec => {
      listText += `*${sec.title}*\n`;
      sec.rows.forEach((r, idx) => {
        listText += `${idx + 1}. *${r.title}* ${r.description ? `(${r.description})` : ''}\n`;
      });
      listText += '\n';
    });
    await sendMessage(target, listText).catch(() => {});
  }
}

module.exports = {
  normalizePhone,
  sendMessage,
  sendInteractiveButtons,
  sendInteractiveList
};

