const axios = require('axios');
require('dotenv').config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Sends a pre-approved Meta WhatsApp Template message.
 * @param {string} to - Recipient phone number with country code (e.g. '919342400879')
 * @param {string} templateName - Name of the approved template
 * @param {Array<string>} bodyVariables - Array of strings replacing {{1}}, {{2}}, etc.
 * @param {object} media - Optional media header ({ url, filename })
 */
async function sendTemplateMessage(to, templateName, bodyVariables = [], media = null) {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' }
      }
    };

    const components = [];

    // Optional media header (PDF Document, Image, etc.)
    if (media && media.url) {
      const isPdf = media.url.toLowerCase().endsWith('.pdf') || (media.filename && media.filename.toLowerCase().endsWith('.pdf'));
      components.push({
        type: 'header',
        parameters: [
          {
            type: isPdf ? 'document' : 'image',
            [isPdf ? 'document' : 'image']: {
              link: media.url,
              ...(media.filename ? { filename: media.filename } : {})
            }
          }
        ]
      });
    }

    if (bodyVariables && bodyVariables.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyVariables.map(v => ({ type: 'text', text: String(v) }))
      });
    }

    if (components.length > 0) {
      payload.template.components = components;
    }

    const res = await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: res.data };
  } catch (err) {
    console.error(`❌ Template ${templateName} dispatch failed:`, err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

// Convenience helpers for each iTechnic Mobiles service workflow:

// 1. Repair Booking Confirmation
async function sendRepairBookingConfirmed(to, customerName, jobId, device, service, turnaround = 'Same Day') {
  return sendTemplateMessage(to, 'repair_booking_confirmed', [customerName, jobId, device, service, turnaround]);
}

// 2. Repair Status Update
async function sendRepairStatusUpdate(to, customerName, jobId, device, status) {
  return sendTemplateMessage(to, 'repair_status_update', [customerName, jobId, device, status]);
}

// 3. Device Ready for Pickup
async function sendRepairReadyPickup(to, customerName, device, jobId, totalAmount) {
  return sendTemplateMessage(to, 'repair_ready_pickup', [customerName, device, jobId, totalAmount]);
}

// 4. Doorstep Device Pickup Scheduled
async function sendDoorstepPickupConfirmed(to, customerName, requestId, device, slot, address) {
  return sendTemplateMessage(to, 'doorstep_pickup_confirmed', [customerName, requestId, device, slot, address]);
}

// 5. Service Cost Quotation
async function sendServiceQuotation(to, customerName, device, jobId, issue, quotedCost) {
  return sendTemplateMessage(to, 'service_quotation_estimate', [customerName, device, jobId, issue, quotedCost]);
}

// 6. Admin Service Request Alert
async function sendAdminAlert(to, customerName, phone, device, service, id) {
  return sendTemplateMessage(to, 'admin_service_alert', [customerName, phone, device, service, id]);
}

// 7. Welcome Greeting
async function sendWelcomeGreeting(to, customerName = 'Customer') {
  return sendTemplateMessage(to, 'itechnic_welcome_greeting', [customerName]);
}

// 8. Customer Feedback / Review Request
async function sendFeedbackRequest(to, customerName, device, jobId) {
  return sendTemplateMessage(to, 'customer_feedback_review', [customerName, device, jobId]);
}

// 9. Promotional Offer Broadcast
async function sendPromoBroadcast(to, customerName = 'Customer', offerTitle, discountPercent, validUntil) {
  return sendTemplateMessage(to, 'promotional_offer_broadcast', [customerName, offerTitle, discountPercent, validUntil]);
}

// 10. Festival Discount Promo
async function sendFestivalPromo(to, customerName = 'Customer', discountDesc, promoCode, validUntil) {
  return sendTemplateMessage(to, 'festival_discount_promo', [customerName, discountDesc, promoCode, validUntil]);
}

// 11. Express Service Discount Promo
async function sendServiceDiscountPromo(to, customerName = 'Customer', startingPrice, offerDetail) {
  return sendTemplateMessage(to, 'service_discount_broadcast', [customerName, startingPrice, offerDetail]);
}

module.exports = {
  sendTemplateMessage,
  sendRepairBookingConfirmed,
  sendRepairStatusUpdate,
  sendRepairReadyPickup,
  sendDoorstepPickupConfirmed,
  sendServiceQuotation,
  sendAdminAlert,
  sendWelcomeGreeting,
  sendFeedbackRequest,
  sendPromoBroadcast,
  sendFestivalPromo,
  sendServiceDiscountPromo
};

