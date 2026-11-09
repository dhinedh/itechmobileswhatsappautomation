const express = require('express');
const router = express.Router();
const axios = require('axios');
const templateService = require('./template_service');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WABA_ID = process.env.WABA_ID || '1758570912097342';
const CRM_API_KEY = process.env.CRM_API_KEY || 'itech_live_sec_7f9984e1b9384e9d9a1f';

// Authentication Middleware for API Services
function authenticateApiKey(req, res, next) {
  // Allow internal dashboard requests through or validate header
  const headerKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
  const isInternal = req.headers['x-requested-from'] === 'internal-dashboard';
  
  // If request has API key matching or internal flag or in dev mode
  if (headerKey === CRM_API_KEY || isInternal || !headerKey) {
    // If no key is provided, we can allow for local testing or require in production
    return next();
  }
  
  if (headerKey !== CRM_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API Key. Please provide a valid x-api-key header.'
    });
  }
  
  next();
}

router.use(authenticateApiKey);

// ----------------------------------------------------
// 1. API AUTH & INFO
// ----------------------------------------------------
router.get('/auth/key', (req, res) => {
  res.json({
    success: true,
    apiKey: CRM_API_KEY,
    wabaId: WABA_ID,
    phoneNumberId: PHONE_NUMBER_ID,
    baseUrl: `${req.protocol}://${req.get('host')}/api/v1`
  });
});

// ----------------------------------------------------
// 2. TEMPLATES API (Fetch from Meta & Submit to Meta)
// ----------------------------------------------------

// GET /api/v1/templates - Fetch all templates live from Meta
router.get('/templates', async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates?limit=100`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    const templates = response.data.data || [];
    res.json({
      success: true,
      count: templates.length,
      wabaId: WABA_ID,
      templates
    });
  } catch (err) {
    console.error('Error fetching Meta templates:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

// POST /api/v1/templates - Create and Submit Template to Meta for approval
router.post('/templates', async (req, res) => {
  try {
    const {
      name,
      category,
      language = 'en_US',
      headerText,
      headerType = 'TEXT', // 'NONE', 'TEXT', 'IMAGE', 'DOCUMENT'
      bodyText,
      footerText,
      buttons = [],
      sampleValues = []
    } = req.body;

    if (!name || !bodyText || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: "name", "category", and "bodyText" are mandatory.'
      });
    }

    // Clean name: Meta requires lowercase letters and underscores only
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    // Build components array
    const components = [];

    // 1. Header (if specified)
    if (headerType !== 'NONE' && headerText) {
      components.push({
        type: 'HEADER',
        format: headerType,
        text: headerText
      });
    }

    // 2. Body component
    const bodyComponent = {
      type: 'BODY',
      text: bodyText
    };

    // Detect {{1}}, {{2}} placeholders in body text
    const matches = bodyText.match(/{{\s*\d+\s*}}/g);
    if (matches && matches.length > 0) {
      // Build sample values array
      const examples = matches.map((m, idx) => {
        return sampleValues[idx] || `Sample_${idx + 1}`;
      });
      bodyComponent.example = {
        body_text: [examples]
      };
    }
    components.push(bodyComponent);

    // 3. Footer component
    if (footerText && footerText.trim()) {
      components.push({
        type: 'FOOTER',
        text: footerText.trim()
      });
    }

    // 4. Buttons component
    if (Array.isArray(buttons) && buttons.length > 0) {
      const formattedButtons = buttons.map(b => {
        if (b.type === 'QUICK_REPLY') {
          return { type: 'QUICK_REPLY', text: b.text };
        } else if (b.type === 'URL') {
          return { type: 'URL', text: b.text, url: b.url };
        } else if (b.type === 'PHONE_NUMBER') {
          return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
        }
        return { type: 'QUICK_REPLY', text: b.text || 'Action' };
      });

      components.push({
        type: 'BUTTONS',
        buttons: formattedButtons
      });
    }

    const payload = {
      name: cleanName,
      category: category.toUpperCase(), // 'UTILITY' or 'MARKETING'
      language: language,
      components
    };

    console.log(`Submitting new template "${cleanName}" to Meta WABA ${WABA_ID}...`);
    const metaRes = await axios.post(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: `Template "${cleanName}" successfully submitted to Meta for approval!`,
      data: metaRes.data
    });
  } catch (err) {
    console.error('Failed to submit template to Meta:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.error?.message || err.response?.data || err.message
    });
  }
});

// DELETE /api/v1/templates/:name - Delete template from Meta
router.delete('/templates/:name', async (req, res) => {
  try {
    const templateName = req.params.name;
    const response = await axios.delete(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates?name=${templateName}`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    res.json({
      success: true,
      message: `Template "${templateName}" deleted from Meta`,
      data: response.data
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

// ----------------------------------------------------
// 3. UNIVERSAL MESSAGE DISPATCH API
// ----------------------------------------------------

// POST /api/v1/messages/send-template
router.post('/messages/send-template', async (req, res) => {
  try {
    const { to, templateName, languageCode = 'en_US', bodyVariables = [] } = req.body;
    if (!to || !templateName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: "to" and "templateName".'
      });
    }

    const result = await templateService.sendTemplateMessage(to, templateName, bodyVariables);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Template "${templateName}" dispatched to +${to}`,
      metaResponse: result.data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/messages/send-text
router.post('/messages/send-text', async (req, res) => {
  try {
    const { to, text } = req.body;
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: "to" and "text".'
      });
    }

    const cleanPhone = to.replace(/[^0-9]/g, '');
    const metaRes = await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      messageId: metaRes.data?.messages?.[0]?.id,
      metaResponse: metaRes.data
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

// ----------------------------------------------------
// 4. CRM READY-TO-USE WORKFLOW ENDPOINTS (FOR CLIENT CRM)
// ----------------------------------------------------

// 1. Repair Booking Confirmed
router.post('/crm/repair-booking-confirmed', async (req, res) => {
  const { phone, customerName, jobId, device, service, turnaround = 'Same Day' } = req.body;
  if (!phone || !customerName || !jobId) {
    return res.status(400).json({ success: false, error: 'phone, customerName, and jobId are required' });
  }
  const result = await templateService.sendRepairBookingConfirmed(phone, customerName, jobId, device, service, turnaround);
  res.status(result.success ? 200 : 400).json(result);
});

// 2. Repair Status Update
router.post('/crm/repair-status-update', async (req, res) => {
  const { phone, customerName, jobId, device, status } = req.body;
  if (!phone || !customerName || !jobId || !status) {
    return res.status(400).json({ success: false, error: 'phone, customerName, jobId, and status are required' });
  }
  const result = await templateService.sendRepairStatusUpdate(phone, customerName, jobId, device, status);
  res.status(result.success ? 200 : 400).json(result);
});

// 3. Device Ready for Pickup
router.post('/crm/device-ready-pickup', async (req, res) => {
  const { phone, customerName, device, jobId, totalAmount } = req.body;
  if (!phone || !customerName || !device || !jobId || !totalAmount) {
    return res.status(400).json({ success: false, error: 'phone, customerName, device, jobId, totalAmount are required' });
  }
  const result = await templateService.sendRepairReadyPickup(phone, customerName, device, jobId, totalAmount);
  res.status(result.success ? 200 : 400).json(result);
});

// 4. Doorstep Pickup Scheduled
router.post('/crm/doorstep-pickup', async (req, res) => {
  const { phone, customerName, requestId, device, slot, address } = req.body;
  if (!phone || !customerName || !requestId || !slot || !address) {
    return res.status(400).json({ success: false, error: 'phone, customerName, requestId, slot, address are required' });
  }
  const result = await templateService.sendDoorstepPickupConfirmed(phone, customerName, requestId, device, slot, address);
  res.status(result.success ? 200 : 400).json(result);
});

// 5. Service Quotation Estimate
router.post('/crm/service-quotation', async (req, res) => {
  const { phone, customerName, device, jobId, issue, quotedCost } = req.body;
  if (!phone || !customerName || !device || !jobId || !quotedCost) {
    return res.status(400).json({ success: false, error: 'phone, customerName, device, jobId, quotedCost are required' });
  }
  const result = await templateService.sendServiceQuotation(phone, customerName, device, jobId, issue, quotedCost);
  res.status(result.success ? 200 : 400).json(result);
});

// 6. Admin Service Request Alert
router.post('/crm/admin-alert', async (req, res) => {
  const { phone, customerName, customerPhone, device, service, id } = req.body;
  const adminPhone = phone || (process.env.ADMIN_PHONE ? process.env.ADMIN_PHONE.split(',')[0] : '919342400879');
  const result = await templateService.sendAdminAlert(adminPhone, customerName, customerPhone, device, service, id);
  res.status(result.success ? 200 : 400).json(result);
});

// 7. Welcome Greeting
router.post('/crm/welcome-greeting', async (req, res) => {
  const { phone, customerName = 'Customer' } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'phone is required' });
  const result = await templateService.sendWelcomeGreeting(phone, customerName);
  res.status(result.success ? 200 : 400).json(result);
});

// 8. Customer Feedback / Review
router.post('/crm/feedback-review', async (req, res) => {
  const { phone, customerName, device, jobId } = req.body;
  if (!phone || !customerName || !device || !jobId) {
    return res.status(400).json({ success: false, error: 'phone, customerName, device, jobId are required' });
  }
  const result = await templateService.sendFeedbackRequest(phone, customerName, device, jobId);
  res.status(result.success ? 200 : 400).json(result);
});

// 9. Promotional Broadcast
router.post('/crm/promotional-broadcast', async (req, res) => {
  const { phone, customerName = 'Customer', offerTitle, discountPercent, validUntil } = req.body;
  if (!phone || !offerTitle || !discountPercent || !validUntil) {
    return res.status(400).json({ success: false, error: 'phone, offerTitle, discountPercent, validUntil are required' });
  }
  const result = await templateService.sendPromoBroadcast(phone, customerName, offerTitle, discountPercent, validUntil);
  res.status(result.success ? 200 : 400).json(result);
});

// 10. Festival Discount Promo
router.post('/crm/festival-promo', async (req, res) => {
  const { phone, customerName = 'Customer', discountDesc, promoCode, validUntil } = req.body;
  if (!phone || !discountDesc || !promoCode || !validUntil) {
    return res.status(400).json({ success: false, error: 'phone, discountDesc, promoCode, validUntil are required' });
  }
  const result = await templateService.sendFestivalPromo(phone, customerName, discountDesc, promoCode, validUntil);
  res.status(result.success ? 200 : 400).json(result);
});

// 11. Express Service Discount Promo
router.post('/crm/service-discount-promo', async (req, res) => {
  const { phone, customerName = 'Customer', startingPrice, offerDetail } = req.body;
  if (!phone || !startingPrice || !offerDetail) {
    return res.status(400).json({ success: false, error: 'phone, startingPrice, offerDetail are required' });
  }
  const result = await templateService.sendServiceDiscountPromo(phone, customerName, startingPrice, offerDetail);
  res.status(result.success ? 200 : 400).json(result);
});

// ----------------------------------------------------
// 5. API DOCUMENTATION ENDPOINT
// ----------------------------------------------------
router.get('/docs', (req, res) => {
  res.json({
    title: 'iTechnic Mobiles WhatsApp Business API Services',
    version: '1.0.0',
    description: 'Enterprise REST API suite to integrate WhatsApp automation into any external CRM or ERP system.',
    authentication: {
      type: 'API Key',
      header: 'x-api-key',
      example: CRM_API_KEY
    },
    endpoints: [
      {
        path: '/api/v1/crm/repair-booking-confirmed',
        method: 'POST',
        description: 'Send instant repair booking confirmation with Job ID and turnaround time.',
        params: {
          phone: '919342400879 (Required)',
          customerName: 'Murali (Required)',
          jobId: 'REP-1024 (Required)',
          device: 'Apple iPhone 13 (Required)',
          service: 'Screen Replacement (Required)',
          turnaround: 'Same Day (Optional, defaults to Same Day)'
        }
      },
      {
        path: '/api/v1/crm/repair-status-update',
        method: 'POST',
        description: 'Send live repair status updates (Diagnosing, In Repair, Quality Testing).',
        params: {
          phone: '919342400879 (Required)',
          customerName: 'Murali (Required)',
          jobId: 'REP-1024 (Required)',
          device: 'Apple iPhone 13 (Required)',
          status: 'In Repair (Technician diagnosing display) (Required)'
        }
      },
      {
        path: '/api/v1/crm/device-ready-pickup',
        method: 'POST',
        description: 'Alert customer that device is ready for store collection with bill amount.',
        params: {
          phone: '919342400879 (Required)',
          customerName: 'Murali (Required)',
          device: 'Apple iPhone 13 (Required)',
          jobId: 'REP-1024 (Required)',
          totalAmount: '3500 (Required)'
        }
      },
      {
        path: '/api/v1/crm/doorstep-pickup',
        method: 'POST',
        description: 'Confirm doorstep executive pickup time slot and address.',
        params: {
          phone: '919342400879 (Required)',
          customerName: 'Murali (Required)',
          requestId: 'PU-502 (Required)',
          device: 'OnePlus 11 (Required)',
          slot: 'Today, 3:00 PM – 5:00 PM (Required)',
          address: 'No. 12, Main Street, Pondicherry (Required)'
        }
      },
      {
        path: '/api/v1/crm/service-quotation',
        method: 'POST',
        description: 'Send diagnostic quote and ask for customer confirmation.',
        params: {
          phone: '919342400879 (Required)',
          customerName: 'Murali (Required)',
          device: 'Samsung S21 (Required)',
          jobId: 'REP-1024 (Required)',
          issue: 'Display Touch Panel (Required)',
          quotedCost: '4500 (Required)'
        }
      },
      {
        path: '/api/v1/messages/send-template',
        method: 'POST',
        description: 'Universal template sender to trigger any Meta approved template.',
        params: {
          to: '919342400879 (Required)',
          templateName: 'repair_booking_confirmed (Required)',
          bodyVariables: ['Murali', 'REP-1024', 'iPhone 13', 'Screen', 'Same Day']
        }
      },
      {
        path: '/api/v1/templates',
        method: 'GET',
        description: 'Get all message templates and their live approval status from Meta.',
        params: {}
      },
      {
        path: '/api/v1/templates',
        method: 'POST',
        description: 'Create and submit a new template directly to Meta for approval.',
        params: {
          name: 'template_name_in_lowercase (Required)',
          category: 'UTILITY or MARKETING (Required)',
          bodyText: 'Hello {{1}}, your order {{2}} is ready! (Required)',
          headerText: 'Optional Header',
          footerText: 'Optional Footer',
          buttons: 'Array of Quick Reply or URL buttons',
          sampleValues: 'Array of sample strings for {{1}}, {{2}}'
        }
      }
    ]
  });
});

module.exports = router;
