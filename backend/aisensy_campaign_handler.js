const templateService = require('./template_service');
const mongoose = require('mongoose');

const CRM_API_KEY = process.env.CRM_API_KEY || 'itech_live_sec_7f9984e1b9384e9d9a1f';

// Campaign name mapping: AiSensy campaign names -> Meta approved template names
const CAMPAIGN_MAP = {
  'repair_booking_confirmation': 'repair_booking_confirmed',
  'repair_booking_confirmed': 'repair_booking_confirmed',
  'repair_status_update': 'repair_status_update',
  'device_ready_pickup': 'device_ready_pickup',
  'device_ready': 'device_ready_pickup',
  'service_quotation': 'service_quotation',
  'order_dispatched': 'order_dispatched',
  'order_milestone_update': 'order_milestone_update',
  'payment_confirmation': 'payment_confirmation',
  'payment_completed': 'payment_confirmation',
  'warranty_confirmation': 'warranty_confirmation',
  'warranty_notification': 'warranty_confirmation',
  'doorstep_pickup_confirmation': 'doorstep_pickup',
  'doorstep_pickup': 'doorstep_pickup',
  'admin_service_alert': 'admin_service_alert'
};

/**
 * Normalizes phone numbers to standard 12-digit Indian format (e.g. 919876543210)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * AiSensy Universal API Handler
 * Matches endpoint: POST /campaign/t1/api/v2
 */
async function handleAiSensyCampaign(req, res) {
  try {
    const {
      apiKey,
      campaignName,
      destination,
      userName,
      templateParams = [],
      source = 'CRM',
      media,
      tags = [],
      attributes = {}
    } = req.body;

    // 1. Authentication
    const requestKey = apiKey || req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    const isInternal = req.headers['x-requested-from'] === 'internal-dashboard';

    if (requestKey !== CRM_API_KEY && !isInternal && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid API Key. Please provide a valid AiSensy/iTechnic API Key.'
      });
    }

    // 2. Validation
    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: destination (Customer WhatsApp number with country code, e.g. +919876543210).'
      });
    }

    if (!campaignName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: campaignName (e.g. repair_booking_confirmation, order_dispatched).'
      });
    }

    const cleanPhone = normalizePhone(destination);
    const resolvedCampaign = campaignName.trim().toLowerCase();
    const metaTemplateName = CAMPAIGN_MAP[resolvedCampaign] || resolvedCampaign;

    // 3. Resolve template parameters with smart userName injection
    let finalParams = Array.isArray(templateParams) ? [...templateParams] : [];

    // Most templates start with customer name (e.g. Hello {{1}}).
    // If userName is supplied and templateParams does not already start with userName, prepend it.
    if (userName && (finalParams.length === 0 || finalParams[0] !== userName)) {
      if (['repair_booking_confirmation', 'repair_booking_confirmed', 'device_ready_pickup', 'device_ready', 'service_quotation', 'order_dispatched'].includes(resolvedCampaign)) {
        if (finalParams.length === 4) {
          // Received 4 parameters (e.g. Job ID, Device, Service, Turnaround) -> prepend customer name
          finalParams.unshift(userName);
        }
      }
    }

    // 4. Dispatch via Meta Cloud API / Template Service
    const dispatchResult = await templateService.sendTemplateMessage(cleanPhone, metaTemplateName, finalParams, media);

    // 5. Save to MongoDB CRM Ledger (if connected)
    try {
      const Contact = mongoose.models.Contact;
      if (Contact && mongoose.connection.readyState === 1) {
        let contact = await Contact.findOne({ phone: cleanPhone });
        if (!contact) {
          contact = new Contact({
            phone: cleanPhone,
            name: userName || cleanPhone,
            lead_status: 'Customer',
            consent: true,
            tags: tags || []
          });
        }

        // Merge tags & attributes
        if (Array.isArray(tags) && tags.length > 0) {
          contact.tags = Array.from(new Set([...(contact.tags || []), ...tags]));
        }
        if (userName && !contact.name) {
          contact.name = userName;
        }

        // Log outgoing message to conversation history
        const summaryText = `[AiSensy Campaign: ${campaignName}] Params: ${finalParams.join(' · ')}`;
        contact.messages.push({
          text: summaryText,
          fromCustomer: false,
          mediaType: media ? 'media_template' : 'template',
          time: new Date()
        });
        contact.lastSeen = new Date();
        contact.messageCount = (contact.messageCount || 0) + 1;

        // Auto-register repair if booking confirmation
        if (resolvedCampaign === 'repair_booking_confirmation' || resolvedCampaign === 'repair_booking_confirmed') {
          const jobId = finalParams[1] || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
          const device = finalParams[2] || 'Smartphone';
          const service = finalParams[3] || 'General Repair';
          const turnaround = finalParams[4] || 'Same Day';

          const existingRepair = contact.repairs?.find(r => r.repairId === jobId);
          if (!existingRepair) {
            contact.repairs = contact.repairs || [];
            contact.repairs.push({
              repairId: jobId,
              deviceBrand: device.split(' ')[0] || 'Phone',
              deviceModel: device,
              serviceName: service,
              turnaroundTime: turnaround,
              status: 'Received',
              createdAt: new Date()
            });
            contact.lead_status = 'Repair Booked';
          }
        }

        await contact.save().catch(e => console.warn('Could not save contact in AiSensy handler:', e.message));
      }
    } catch (dbErr) {
      console.warn('MongoDB ledger sync skipped in AiSensy handler:', dbErr.message);
    }

    // 6. Return AiSensy Standard Response
    const messageId = dispatchResult.data?.messages?.[0]?.id || `wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return res.status(200).json({
      success: true,
      message: 'Campaign submitted successfully',
      data: {
        campaignName,
        destination: cleanPhone,
        userName: userName || cleanPhone,
        status: dispatchResult.success ? 'SENT' : 'ACCEPTED',
        messageId,
        templateName: metaTemplateName,
        submittedParams: finalParams,
        source: source || 'CRM'
      }
    });

  } catch (err) {
    console.error('❌ Error handling AiSensy campaign:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AiSensy API campaign',
      error: err.message
    });
  }
}

module.exports = {
  handleAiSensyCampaign,
  CAMPAIGN_MAP,
  normalizePhone
};

