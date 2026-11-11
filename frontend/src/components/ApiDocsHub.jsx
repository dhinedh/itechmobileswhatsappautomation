import React, { useState } from 'react';

const API_CATEGORIES = [
  { id: 'aisensy', name: 'AiSensy Format Campaign API (Universal)', icon: '⚡' },
  { id: 'crm', name: 'CRM Automation Workflows', icon: '🏢' },
  { id: 'messages', name: 'Universal Messaging API', icon: '📨' },
  { id: 'templates', name: 'Meta Templates API', icon: '📱' }
];

const ENDPOINTS = [
  // 0. AiSensy Universal API Campaigns
  {
    id: 'aisensy-repair-booking',
    category: 'aisensy',
    title: 'AiSensy Campaign: Repair Booking Confirmation',
    method: 'POST',
    path: '/campaign/t1/api/v2',
    description: 'Standard AiSensy API format for dispatching repair booking confirmations from CRM/ERP.',
    templateName: 'repair_booking_confirmed',
    params: [
      { name: 'apiKey', type: 'string', required: true, desc: 'Your live API key in JSON body' },
      { name: 'campaignName', type: 'string', required: true, desc: 'repair_booking_confirmation' },
      { name: 'destination', type: 'string', required: true, desc: 'Customer WhatsApp number (e.g. +919876543210)' },
      { name: 'userName', type: 'string', required: true, desc: 'Customer full name (e.g. Ramesh Babu)' },
      { name: 'templateParams', type: 'array of strings', required: true, desc: '[JobId, Device, Service, Turnaround]' }
    ],
    samplePayload: {
      apiKey: 'itech_live_sec_7f9984e1b9384e9d9a1f',
      campaignName: 'repair_booking_confirmation',
      destination: '+919876543210',
      userName: 'Ramesh Babu',
      templateParams: [
        'REP-1042',
        'Apple iPhone 13',
        'Screen Replacement',
        'Same Day'
      ]
    }
  },
  {
    id: 'aisensy-device-ready',
    category: 'aisensy',
    title: 'AiSensy Campaign: Device Ready for Pickup',
    method: 'POST',
    path: '/campaign/t1/api/v2',
    description: 'Standard AiSensy API format for notifying customer that device is repaired and bill is ready.',
    templateName: 'device_ready_pickup',
    params: [
      { name: 'apiKey', type: 'string', required: true, desc: 'Your live API key in JSON body' },
      { name: 'campaignName', type: 'string', required: true, desc: 'device_ready_pickup' },
      { name: 'destination', type: 'string', required: true, desc: 'Customer WhatsApp number' },
      { name: 'userName', type: 'string', required: true, desc: 'Customer full name' },
      { name: 'templateParams', type: 'array of strings', required: true, desc: '[JobId, Device, FinalAmount, InvoiceNumber]' }
    ],
    samplePayload: {
      apiKey: 'itech_live_sec_7f9984e1b9384e9d9a1f',
      campaignName: 'device_ready_pickup',
      destination: '+919876543210',
      userName: 'Ramesh Babu',
      templateParams: [
        'REP-1042',
        'Apple iPhone 13',
        '4500',
        'INV-2026-908'
      ]
    }
  },
  {
    id: 'aisensy-order-dispatched',
    category: 'aisensy',
    title: 'AiSensy Campaign: Order Dispatched with Invoice',
    method: 'POST',
    path: '/campaign/t1/api/v2',
    description: 'Standard AiSensy format for retail order dispatch with courier tracking and optional PDF attachment.',
    templateName: 'order_dispatched',
    params: [
      { name: 'apiKey', type: 'string', required: true, desc: 'Your live API key in JSON body' },
      { name: 'campaignName', type: 'string', required: true, desc: 'order_dispatched' },
      { name: 'destination', type: 'string', required: true, desc: 'Customer WhatsApp number' },
      { name: 'userName', type: 'string', required: true, desc: 'Customer full name' },
      { name: 'templateParams', type: 'array of strings', required: true, desc: '[OrderId, DeviceModel, Status, TrackingNumber]' },
      { name: 'media', type: 'object', required: false, desc: '{ url: "https://...", filename: "invoice.pdf" }' }
    ],
    samplePayload: {
      apiKey: 'itech_live_sec_7f9984e1b9384e9d9a1f',
      campaignName: 'order_dispatched',
      destination: '+919876543210',
      userName: 'Ramesh Babu',
      templateParams: [
        'ORD-1001',
        'Apple iPhone 15 Pro',
        'Dispatched via Express Rider',
        'TRACK-12345'
      ],
      media: {
        url: 'https://whatapp-automation-kxml.onrender.com/invoice.pdf',
        filename: 'invoice.pdf'
      }
    }
  },
  // 1. CRM Workflows
  {
    id: 'crm-repair-booking',
    category: 'crm',
    title: 'Repair Booking Confirmed',
    method: 'POST',
    path: '/api/v1/crm/repair-booking-confirmed',
    description: 'Triggers instant repair job confirmation via WhatsApp with Job ID, device name, and estimated turnaround.',
    templateName: 'repair_booking_confirmed',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Recipient phone number with country code (e.g. 919342400879)' },
      { name: 'customerName', type: 'string', required: true, desc: 'Customer full name (e.g. Murali)' },
      { name: 'jobId', type: 'string', required: true, desc: 'Unique job/ticket ID (e.g. REP-1024)' },
      { name: 'device', type: 'string', required: true, desc: 'Device model (e.g. Apple iPhone 13)' },
      { name: 'service', type: 'string', required: true, desc: 'Service required (e.g. Screen Replacement)' },
      { name: 'turnaround', type: 'string', required: false, desc: 'Turnaround time (defaults to Same Day)' }
    ],
    samplePayload: {
      phone: '919342400879',
      customerName: 'Murali',
      jobId: 'REP-1024',
      device: 'Apple iPhone 13',
      service: 'Screen Replacement',
      turnaround: 'Same Day'
    }
  },
  {
    id: 'crm-status-update',
    category: 'crm',
    title: 'Repair Status Update',
    method: 'POST',
    path: '/api/v1/crm/repair-status-update',
    description: 'Notifies customer whenever their repair changes state in your CRM (e.g. Diagnosing, In Repair, Quality Testing).',
    templateName: 'repair_status_update',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Recipient phone number (e.g. 919342400879)' },
      { name: 'customerName', type: 'string', required: true, desc: 'Customer full name (e.g. Murali)' },
      { name: 'jobId', type: 'string', required: true, desc: 'Repair Job ID (e.g. REP-1024)' },
      { name: 'device', type: 'string', required: true, desc: 'Device model (e.g. Apple iPhone 13)' },
      { name: 'status', type: 'string', required: true, desc: 'Live status description (e.g. In Repair - Technician Diagnosing)' }
    ],
    samplePayload: {
      phone: '919342400879',
      customerName: 'Murali',
      jobId: 'REP-1024',
      device: 'Apple iPhone 13',
      status: 'In Repair (Technician Diagnosing Display)'
    }
  },
  {
    id: 'crm-ready-pickup',
    category: 'crm',
    title: 'Device Ready for Pickup',
    method: 'POST',
    path: '/api/v1/crm/device-ready-pickup',
    description: 'Alerts customer that repair is completed and device is ready for collection with total invoice amount.',
    templateName: 'repair_ready_pickup',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Recipient phone number (e.g. 919342400879)' },
      { name: 'customerName', type: 'string', required: true, desc: 'Customer name (e.g. Murali)' },
      { name: 'device', type: 'string', required: true, desc: 'Device model (e.g. Apple iPhone 13)' },
      { name: 'jobId', type: 'string', required: true, desc: 'Job ID (e.g. REP-1024)' },
      { name: 'totalAmount', type: 'string/number', required: true, desc: 'Total bill amount in INR (e.g. 3500)' }
    ],
    samplePayload: {
      phone: '919342400879',
      customerName: 'Murali',
      device: 'Apple iPhone 13',
      jobId: 'REP-1024',
      totalAmount: '3500'
    }
  },
  {
    id: 'crm-doorstep-pickup',
    category: 'crm',
    title: 'Doorstep Pickup Scheduled',
    method: 'POST',
    path: '/api/v1/crm/doorstep-pickup',
    description: 'Confirms doorstep pickup executive appointment, time window, and pickup address.',
    templateName: 'doorstep_pickup_confirmed',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Customer phone number' },
      { name: 'customerName', type: 'string', required: true, desc: 'Customer name' },
      { name: 'requestId', type: 'string', required: true, desc: 'Pickup Request ID (e.g. PU-502)' },
      { name: 'device', type: 'string', required: true, desc: 'Device model (e.g. OnePlus 11)' },
      { name: 'slot', type: 'string', required: true, desc: 'Appointment slot (e.g. Today, 3:00 PM – 5:00 PM)' },
      { name: 'address', type: 'string', required: true, desc: 'Pickup address (e.g. No. 12, Main Road, Pondicherry)' }
    ],
    samplePayload: {
      phone: '919342400879',
      customerName: 'Murali',
      requestId: 'PU-502',
      device: 'OnePlus 11',
      slot: 'Today, 3:00 PM – 5:00 PM',
      address: 'No. 12, Main Road, Pondicherry'
    }
  },
  {
    id: 'crm-service-quotation',
    category: 'crm',
    title: 'Service Cost Quotation',
    method: 'POST',
    path: '/api/v1/crm/service-quotation',
    description: 'Sends formal price quote and diagnosis to customer for their approval before initiating repair.',
    templateName: 'service_quotation_estimate',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Customer phone number' },
      { name: 'customerName', type: 'string', required: true, desc: 'Customer name' },
      { name: 'device', type: 'string', required: true, desc: 'Device model (e.g. Samsung S21)' },
      { name: 'jobId', type: 'string', required: true, desc: 'Job ID (e.g. REP-1024)' },
      { name: 'issue', type: 'string', required: true, desc: 'Diagnosis issue (e.g. Display Touch Panel)' },
      { name: 'quotedCost', type: 'string/number', required: true, desc: 'Estimated repair cost in INR (e.g. 4500)' }
    ],
    samplePayload: {
      phone: '919342400879',
      customerName: 'Murali',
      device: 'Samsung S21',
      jobId: 'REP-1024',
      issue: 'Display Touch Panel Replacement',
      quotedCost: '4500'
    }
  },
  {
    id: 'crm-admin-alert',
    category: 'crm',
    title: 'Admin WhatsApp Service Alert',
    method: 'POST',
    path: '/api/v1/crm/admin-alert',
    description: 'Notifies shop managers & technician WhatsApp numbers immediately when a new service request is created in CRM.',
    templateName: 'admin_service_alert',
    params: [
      { name: 'customerName', type: 'string', required: true, desc: 'Customer name' },
      { name: 'customerPhone', type: 'string', required: true, desc: 'Customer phone number' },
      { name: 'device', type: 'string', required: true, desc: 'Device model' },
      { name: 'service', type: 'string', required: true, desc: 'Service requested' },
      { name: 'id', type: 'string', required: true, desc: 'Job/Lead ID' },
      { name: 'phone', type: 'string', required: false, desc: 'Admin WhatsApp number (defaults to configured admin)' }
    ],
    samplePayload: {
      customerName: 'Murali Kumar',
      customerPhone: '919342400879',
      device: 'iPhone 13 Pro',
      service: 'Battery Replacement',
      id: 'REP-8392'
    }
  },

  // 2. Universal Messaging API
  {
    id: 'msg-send-template',
    category: 'messages',
    title: 'Universal Template Message Dispatch',
    method: 'POST',
    path: '/api/v1/messages/send-template',
    description: 'Dynamically send any approved Meta template to any recipient with positional variable values.',
    params: [
      { name: 'to', type: 'string', required: true, desc: 'Recipient phone number with country code' },
      { name: 'templateName', type: 'string', required: true, desc: 'Meta-approved template name (e.g. repair_booking_confirmed)' },
      { name: 'bodyVariables', type: 'array of strings', required: false, desc: 'Replacement values for {{1}}, {{2}}, etc.' },
      { name: 'languageCode', type: 'string', required: false, desc: 'Language code (default en_US)' }
    ],
    samplePayload: {
      to: '919342400879',
      templateName: 'repair_booking_confirmed',
      bodyVariables: ['Murali', 'REP-1024', 'Apple iPhone 13', 'Screen Replacement', 'Same Day']
    }
  },
  {
    id: 'msg-send-text',
    category: 'messages',
    title: 'Send Direct WhatsApp Text Message',
    method: 'POST',
    path: '/api/v1/messages/send-text',
    description: 'Send custom plain text message directly to an active customer (standard 24-hr session).',
    params: [
      { name: 'to', type: 'string', required: true, desc: 'Recipient phone number with country code' },
      { name: 'text', type: 'string', required: true, desc: 'Message content' }
    ],
    samplePayload: {
      to: '919342400879',
      text: 'Hello from iTechnic Mobiles CRM! Your technician has begun working on your device.'
    }
  },

  // 3. Meta Templates API
  {
    id: 'tpl-get-all',
    category: 'templates',
    title: 'List All Meta Templates & Approval Status',
    method: 'GET',
    path: '/api/v1/templates',
    description: 'Returns real-time list of all templates registered under your WhatsApp Business Account on Meta with live statuses.',
    params: [],
    samplePayload: null
  },
  {
    id: 'tpl-create-submit',
    category: 'templates',
    title: 'Create & Submit Template to Meta',
    method: 'POST',
    path: '/api/v1/templates',
    description: 'Creates a new template and immediately registers it with Meta Graph API for automated review.',
    params: [
      { name: 'name', type: 'string', required: true, desc: 'Lowercase template name (e.g. repair_invoice_receipt)' },
      { name: 'category', type: 'string', required: true, desc: 'UTILITY or MARKETING' },
      { name: 'language', type: 'string', required: false, desc: 'Language code (e.g. en_US)' },
      { name: 'headerText', type: 'string', required: false, desc: 'Optional header string' },
      { name: 'bodyText', type: 'string', required: true, desc: 'Body text with {{1}}, {{2}} placeholders' },
      { name: 'footerText', type: 'string', required: false, desc: 'Optional footer text' },
      { name: 'buttons', type: 'array', required: false, desc: 'Array of Quick Reply or URL buttons' },
      { name: 'sampleValues', type: 'array', required: false, desc: 'Array of sample strings for {{1}}, {{2}} variables' }
    ],
    samplePayload: {
      name: 'express_pickup_receipt',
      category: 'UTILITY',
      headerText: 'Pickup Completed',
      bodyText: 'Hello {{1}}, our executive {{2}} has received your device {{3}} for repair (Tracking: {{4}}).',
      footerText: 'iTechnic Mobiles Doorstep Care',
      buttons: [{ type: 'QUICK_REPLY', text: 'Track Repair' }],
      sampleValues: ['Murali', 'Karthik', 'iPhone 13', 'PU-502']
    }
  }
];

function ApiDocsHub({ apiUrl }) {
  const [activeCategory, setActiveCategory] = useState('aisensy');
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [codeLanguage, setCodeLanguage] = useState('curl');
  const [apiKey, setApiKey] = useState('itech_live_sec_7f9984e1b9384e9d9a1f');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Try It Out state
  const [testPayloadStr, setTestPayloadStr] = useState(
    JSON.stringify(ENDPOINTS[0].samplePayload, null, 2)
  );
  const [runningTest, setRunningTest] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

  // Switch endpoint
  const handleSelectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setTestPayloadStr(ep.samplePayload ? JSON.stringify(ep.samplePayload, null, 2) : '');
    setTestResponse(null);
  };

  const currentBaseUrl = apiUrl || window.location.origin;

  // Generate code snippet based on selected language
  const generateSnippet = (ep, lang) => {
    const fullUrl = `${currentBaseUrl}${ep.path}`;
    const payload = ep.samplePayload;

    if (lang === 'curl') {
      if (ep.method === 'GET') {
        return `curl -X GET "${fullUrl}" \\\n  -H "x-api-key: ${apiKey}"`;
      }
      return `curl -X POST "${fullUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${apiKey}" \\\n  -d '${JSON.stringify(payload, null, 2)}'`;
    }

    if (lang === 'node') {
      if (ep.method === 'GET') {
        return `const axios = require('axios');

async function getTemplates() {
  const response = await axios.get('${fullUrl}', {
    headers: { 'x-api-key': '${apiKey}' }
  });
  console.log('Templates:', response.data);
}

getTemplates();`;
      }
      return `const axios = require('axios');

async function sendWhatsAppNotification() {
  const payload = ${JSON.stringify(payload, null, 2)};

  const response = await axios.post('${fullUrl}', payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}'
    }
  });

  console.log('Response:', response.data);
}

sendWhatsAppNotification();`;
    }

    if (lang === 'python') {
      if (ep.method === 'GET') {
        return `import requests

url = "${fullUrl}"
headers = {"x-api-key": "${apiKey}"}

response = requests.get(url, headers=headers)
print(response.json())`;
      }
      return `import requests

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
}
payload = ${JSON.stringify(payload, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;
    }

    if (lang === 'php') {
      if (ep.method === 'GET') {
        return `<?php
$ch = curl_init('${fullUrl}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'x-api-key: ${apiKey}'
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;
      }
      return `<?php
$payload = json_encode(${JSON.stringify(payload, null, 2)});

$ch = curl_init('${fullUrl}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'x-api-key: ${apiKey}'
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;
    }

    return '';
  };

  // Run Test API Call
  const handleExecuteTest = async () => {
    setRunningTest(true);
    setTestResponse(null);

    const fullUrl = `${currentBaseUrl}${selectedEndpoint.path}`;
    try {
      const options = {
        method: selectedEndpoint.method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      };

      if (selectedEndpoint.method === 'POST' && testPayloadStr.trim()) {
        options.body = testPayloadStr;
      }

      const res = await fetch(fullUrl, options);
      const data = await res.json();
      setTestResponse({
        status: res.status,
        ok: res.ok,
        data
      });
    } catch (err) {
      setTestResponse({
        status: 500,
        ok: false,
        error: err.message
      });
    } finally {
      setRunningTest(false);
    }
  };

  const filteredEndpoints = ENDPOINTS.filter(e => e.category === activeCategory);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto">
      {/* Top Banner & API Key Management */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-6 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl font-bold tracking-tight">
                WhatsApp API Services & CRM Integration Hub
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                v1.0.0 Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Plug these high-performance REST API endpoints directly into your company CRM, ERP, or billing software. Trigger automated WhatsApp booking confirmations, status alerts, invoices, and quotations effortlessly.
            </p>
          </div>

          {/* API Key Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-xl flex flex-col gap-1.5 min-w-[320px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>🔑</span> Active API Secret Key
              </span>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] text-teal-300 hover:text-white transition-colors"
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-black/40 px-2.5 py-1.5 rounded-md flex-1 text-emerald-300 truncate">
                {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  alert('API Key copied to clipboard! Pass it in header: x-api-key');
                }}
                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs rounded-md transition-colors shrink-0 shadow-sm"
                title="Copy API Key"
              >
                Copy
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              Header: <code className="text-slate-300">x-api-key: {showApiKey ? apiKey.slice(0, 15) + '...' : '••••••••'}</code>
            </span>
          </div>
        </div>

        {/* Action Toolbar: Category Tabs & Document Downloads */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {API_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const first = ENDPOINTS.find(e => e.category === cat.id);
                  if (first) handleSelectEndpoint(first);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/15 text-slate-200'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          {/* Download Developer Integration Document */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`${currentBaseUrl}/api/v1/docs/download?format=pdf`}
              download="iTechnic_ERP_WhatsApp_API_Integration_Guide.pdf"
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              title="Download Ready-to-Print Official ERP Integration PDF Manual"
            >
              <span>📑</span> Download PDF Manual
            </a>
            <a
              href={`${currentBaseUrl}/api/v1/docs/download?format=html`}
              download="PRODUCTION_DEVELOPER_INTEGRATION_GUIDE.html"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-all flex items-center gap-1.5"
              title="Download HTML manual with live interactive testing"
            >
              <span>🌐</span> HTML Manual
            </a>
            <a
              href={`${currentBaseUrl}/api/v1/docs/download?format=md`}
              download="PRODUCTION_DEVELOPER_INTEGRATION_GUIDE.md"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-all flex items-center gap-1.5"
              title="Download Markdown Documentation"
            >
              <span>📄</span> Markdown (.md)
            </a>
            <a
              href={`${currentBaseUrl}/itechnic-whatsapp-postman-collection.json`}
              download="itechnic-whatsapp-postman.json"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-all flex items-center gap-1.5"
              title="Download Postman Collection"
            >
              <span>📮</span> Postman
            </a>
            <a
              href={`${currentBaseUrl}/developer-docs.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-teal-300 hover:text-white font-semibold text-xs rounded-lg border border-teal-500/30 transition-all flex items-center gap-1.5"
              title="Open full interactive manual in a new tab"
            >
              <span>↗</span> Open Manual
            </a>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Navigation: Endpoints List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Available Endpoints ({filteredEndpoints.length})
            </h3>
            {filteredEndpoints.map(ep => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{ep.title}</span>
                  </div>
                  <code className="text-[10px] text-slate-500 font-mono truncate">
                    {ep.path}
                  </code>
                </button>
              );
            })}
          </div>

          {/* Right Main Details: API Specs, Code Generator, Live Playground (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Endpoint Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono ${
                    selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm font-bold font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                  {selectedEndpoint.path}
                </code>
                {selectedEndpoint.templateName && (
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-mono px-2 py-0.5 rounded-full border border-teal-200">
                    Template: {selectedEndpoint.templateName}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">
                {selectedEndpoint.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedEndpoint.description}
              </p>

              {/* Parameters Table */}
              {selectedEndpoint.params.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Request Parameters (JSON Body)
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                          <th className="py-2 px-3 font-semibold">Parameter</th>
                          <th className="py-2 px-3 font-semibold">Type</th>
                          <th className="py-2 px-3 font-semibold">Requirement</th>
                          <th className="py-2 px-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedEndpoint.params.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono font-bold text-emerald-800">
                              {p.name}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                              {p.type}
                            </td>
                            <td className="py-2 px-3 text-[11px]">
                              {p.required ? (
                                <span className="text-rose-600 font-semibold">Required</span>
                              ) : (
                                <span className="text-slate-400">Optional</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[11px]">
                              {p.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Code Generator Card */}
            <div className="bg-slate-900 rounded-xl shadow-md overflow-hidden border border-slate-800">
              <div className="bg-slate-800/80 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Code Snippet:</span>
                  {['curl', 'node', 'python', 'php'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors uppercase ${
                        codeLanguage === lang
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'node' ? 'Node.js (Axios)' : lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const code = generateSnippet(selectedEndpoint, codeLanguage);
                    navigator.clipboard.writeText(code);
                    alert(`Copied ${codeLanguage.toUpperCase()} code snippet to clipboard!`);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center gap-1"
                >
                  <span>📋</span> Copy Code
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {generateSnippet(selectedEndpoint, codeLanguage)}
                </pre>
              </div>
            </div>

            {/* Interactive "Try It Out / Test Request" Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>🚀</span> Live Interactive Playground
                </h3>
                <span className="text-[11px] text-slate-400">
                  Sends live request to your running backend
                </span>
              </div>

              {selectedEndpoint.method === 'POST' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Editable Request Body (JSON):
                  </label>
                  <textarea
                    rows={7}
                    value={testPayloadStr}
                    onChange={(e) => setTestPayloadStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-900 text-emerald-300 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tip: Enter your real phone number in "phone" or "to" to receive the actual WhatsApp notification!
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Target: <code className="font-mono text-slate-700">{selectedEndpoint.path}</code>
                </div>
                <button
                  onClick={handleExecuteTest}
                  disabled={runningTest}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {runningTest ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Executing...
                    </>
                  ) : (
                    <>
                      <span>▶</span> Send Request Now
                    </>
                  )}
                </button>
              </div>

              {/* Execution Result Box */}
              {testResponse && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">Live Response:</span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        testResponse.ok
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Status: {testResponse.status} {testResponse.ok ? 'OK' : 'Error'}
                    </span>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ApiDocsHub;
