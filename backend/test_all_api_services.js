const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TEST_PORT = 5050;
const LOCAL_BASE = `http://127.0.0.1:${TEST_PORT}`;
const REMOTE_BASE = 'https://whatapp-automation-kxml.onrender.com';
const API_KEY = process.env.CRM_API_KEY || 'itech_live_sec_7f9984e1b9384e9d9a1f';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_bot_token_123';

const results = [];

function recordTest(category, name, passed, details = '') {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon} [${category}] ${name} ${details ? `(${details})` : ''}`);
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  console.log(`[BOOT] Waiting for Express server on ${url}...`);
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(`${url}/api/v1/auth/key`, { timeout: 1000 });
      if (res.status === 200 && res.data.success) {
        return true;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return false;
}

async function run() {
  console.log('\n================================================================');
  console.log('   iTechnic Mobiles - Complete WhatsApp & CRM API Service Test');
  console.log(`   Local Test Port:      ${TEST_PORT}`);
  console.log(`   Remote Render Server: ${REMOTE_BASE}`);
  console.log('================================================================\n');

  console.log(`[BOOT] Launching backend server on port ${TEST_PORT}...`);
  const serverProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'test'
    },
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (d) => {
    const msg = d.toString().trim();
    if (msg.includes('running') || msg.includes('MongoDB')) {
      console.log(`  [SERVER LOG]: ${msg}`);
    }
  });

  const ready = await waitForServer(LOCAL_BASE, 15000);
  if (!ready) {
    console.error('❌ Server did not become ready in 15s. Terminating.');
    serverProcess.kill();
    process.exit(1);
  }
  console.log(`[BOOT] ✅ Backend server is fully operational on ${LOCAL_BASE}\n`);

  const http = axios.create({
    baseURL: LOCAL_BASE,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-requested-from': 'internal-dashboard'
    }
  });

  try {
    // -------------------------------------------------------------
    // SECTION 1: SYSTEM & AUTH DISCOVERY
    // -------------------------------------------------------------
    console.log('--- SECTION 1: System & Auth Discovery ---');
    try {
      const res = await http.get('/api/v1/auth/key');
      const valid = res.status === 200 && res.data.success && res.data.apiKey === API_KEY;
      recordTest('AUTH', 'GET /api/v1/auth/key', valid, `WABA ID: ${res.data.wabaId}, Key: ${res.data.apiKey?.substring(0, 10)}...`);
    } catch (err) {
      recordTest('AUTH', 'GET /api/v1/auth/key', false, err.message);
    }

    try {
      const res = await http.get('/api/v1/docs');
      const valid = res.status === 200 && res.data.title && Array.isArray(res.data.endpoints);
      recordTest('DOCS', 'GET /api/v1/docs', valid, `${res.data.endpoints?.length || 0} CRM REST Endpoints documented`);
    } catch (err) {
      recordTest('DOCS', 'GET /api/v1/docs', false, err.message);
    }

    // -------------------------------------------------------------
    // SECTION 2: AISENSY UNIVERSAL API CAMPAIGNS
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: AiSensy Universal API Campaigns (POST /campaign/t1/api/v2) ---');

    const campaigns = [
      {
        name: 'repair_booking_confirmation',
        params: ['Ramesh Babu', 'REP-9041', 'Apple iPhone 14 Pro', 'Screen Replacement', 'Same Day']
      },
      {
        name: 'repair_status_update',
        params: ['Ramesh Babu', 'REP-9041', 'Apple iPhone 14 Pro', 'In Repair (Technician diagnosing display)']
      },
      {
        name: 'device_ready_pickup',
        params: ['Ramesh Babu', 'iPhone 14 Pro', 'REP-9041', '4500']
      },
      {
        name: 'service_quotation',
        params: ['Ramesh Babu', 'iPhone 14 Pro', '3200', 'OEM Grade Display replacement with 90-day warranty']
      },
      {
        name: 'order_dispatched',
        params: ['ORD-9021', 'Apple 20W USB-C Adapter', 'Dispatched', 'TRACK-78219']
      },
      {
        name: 'payment_confirmation',
        params: ['Ramesh Babu', '4500', 'REP-9041', 'UPI-TXN-88219']
      },
      {
        name: 'warranty_confirmation',
        params: ['Ramesh Babu', 'Apple iPhone 14 Pro', 'WAR-9041', '90 Days']
      },
      {
        name: 'doorstep_pickup_confirmation',
        params: ['Ramesh Babu', 'PU-502', 'iPhone 14 Pro', 'Today 4:00 PM - 5:00 PM', 'Tirukannur, Pondicherry']
      }
    ];

    for (const c of campaigns) {
      try {
        const res = await http.post('/campaign/t1/api/v2', {
          apiKey: API_KEY,
          campaignName: c.name,
          destination: '+919361863063',
          userName: 'Ramesh Babu',
          templateParams: c.params
        });
        const metaTpl = res.data.data?.templateName || res.data.data?.metaTemplate || res.data.templateName;
        const valid = res.status === 200 && res.data.success && !!metaTpl;
        recordTest('AISENSY_API', `Campaign: ${c.name}`, valid, `Meta Template: ${metaTpl}`);
      } catch (err) {
        recordTest('AISENSY_API', `Campaign: ${c.name}`, false, err.response?.data?.message || err.message);
      }
    }

    // Alias route check
    try {
      const res = await http.post('/api/v1/campaign/t1/api/v2', {
        apiKey: API_KEY,
        campaignName: 'repair_status_update',
        destination: '+919361863063',
        userName: 'Ramesh Babu',
        templateParams: ['Ramesh Babu', 'REP-9041', 'iPhone 14 Pro', 'Testing QA']
      });
      const valid = res.status === 200 && res.data.success;
      recordTest('AISENSY_API', 'POST /api/v1/campaign/t1/api/v2 (Alias Route)', valid, `Status: ${res.data.data?.status || 'OK'}`);
    } catch (err) {
      recordTest('AISENSY_API', 'POST /api/v1/campaign/t1/api/v2 (Alias Route)', false, err.message);
    }

    // Validation checks
    try {
      await http.post('/campaign/t1/api/v2', {
        apiKey: API_KEY,
        campaignName: 'repair_status_update'
      });
      recordTest('AISENSY_VAL', 'Validation: Reject missing destination', false, 'Should have returned 400');
    } catch (err) {
      const passed = err.response?.status === 400;
      recordTest('AISENSY_VAL', 'Validation: Reject missing destination', passed, `HTTP ${err.response?.status}`);
    }

    try {
      await http.post('/campaign/t1/api/v2', {
        apiKey: API_KEY,
        destination: '+919361863063'
      });
      recordTest('AISENSY_VAL', 'Validation: Reject missing campaignName', false, 'Should have returned 400');
    } catch (err) {
      const passed = err.response?.status === 400;
      recordTest('AISENSY_VAL', 'Validation: Reject missing campaignName', passed, `HTTP ${err.response?.status}`);
    }

    // -------------------------------------------------------------
    // SECTION 3: CORE CRM & OPERATIONS
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: Core CRM & Live Operations ---');
    let testPhone = '919047553923';

    try {
      const res = await http.get('/crm');
      const contactsList = Array.isArray(res.data) ? res.data : res.data.contacts;
      const valid = res.status === 200 && Array.isArray(contactsList);
      if (valid && contactsList.length > 0) {
        testPhone = contactsList[0].phone;
      }
      recordTest('CRM', 'GET /crm (List Contacts)', valid, `Found ${contactsList?.length || 0} active contacts`);
    } catch (err) {
      recordTest('CRM', 'GET /crm (List Contacts)', false, err.message);
    }

    try {
      const res = await http.get('/crm/analytics');
      const valid = res.status === 200 && res.data && typeof res.data.totalRevenue !== 'undefined';
      recordTest('CRM', 'GET /crm/analytics', valid, `Revenue: ₹${res.data?.totalRevenue}, Active Orders: ${res.data?.activeOrders}`);
    } catch (err) {
      recordTest('CRM', 'GET /crm/analytics', false, err.message);
    }

    try {
      const res = await http.get(`/crm/${testPhone}`);
      const valid = res.status === 200 && res.data;
      recordTest('CRM', `GET /crm/:phone (${testPhone})`, valid, `Name: ${res.data.name || testPhone}`);
    } catch (err) {
      recordTest('CRM', `GET /crm/:phone (${testPhone})`, false, err.message);
    }

    try {
      const res = await http.post(`/crm/${testPhone}/update-lead-status`, { lead_status: 'Hot Lead' });
      const valid = res.status === 200 && res.data.success;
      recordTest('CRM', 'POST /crm/:phone/update-lead-status', valid, 'Lead status updated to Hot Lead');
    } catch (err) {
      recordTest('CRM', 'POST /crm/:phone/update-lead-status', false, err.message);
    }

    try {
      const res = await http.post(`/crm/${testPhone}/pause`, { isPaused: true });
      const valid = res.status === 200 && res.data.success;
      recordTest('CRM', 'POST /crm/:phone/pause (Toggle Bot State)', valid, `isPaused=${res.data.isPaused}`);
      await http.post(`/crm/${testPhone}/pause`, { isPaused: false });
    } catch (err) {
      recordTest('CRM', 'POST /crm/:phone/pause (Toggle Bot State)', false, err.message);
    }

    // Repair Web Booking & Tracking
    let bookedJobId = null;
    try {
      const res = await http.post('/api/book-repair', {
        customerName: 'Ramesh Babu',
        phone: '919876543210',
        brand: 'Apple',
        model: 'iPhone 13',
        service: 'Screen Replacement',
        issue: 'Display cracked touch responsive'
      });
      const valid = res.status === 200 && res.data.success && (res.data.repairId || res.data.repair_job_id);
      if (valid) bookedJobId = res.data.repairId || res.data.repair_job_id;
      recordTest('REPAIR_API', 'POST /api/book-repair', valid, `Job ID: ${bookedJobId}`);
    } catch (err) {
      recordTest('REPAIR_API', 'POST /api/book-repair', false, err.message);
    }

    if (bookedJobId) {
      try {
        const res = await http.get(`/api/track-repair/${bookedJobId}`);
        const valid = res.status === 200 && res.data.success && res.data.repair;
        recordTest('REPAIR_API', `GET /api/track-repair/:id`, valid, `Status: ${res.data.repair.status}`);
      } catch (err) {
        recordTest('REPAIR_API', `GET /api/track-repair/:id`, false, err.message);
      }
    }

    // -------------------------------------------------------------
    // SECTION 4: REST HUB MODULES
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: REST API Hub Modules (/api/v1/...) ---');

    // Leads
    try {
      const res = await http.get('/api/v1/leads');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.leads);
      recordTest('REST_HUB', 'GET /api/v1/leads', valid, `Count: ${res.data.count}`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/leads', false, err.message);
    }

    let createdLeadId = null;
    try {
      const res = await http.post('/api/v1/leads', {
        customerPhone: '919444123456',
        customerName: 'Karthik Raja',
        targetDevice: 'Apple iPhone 16 Pro 256GB',
        budgetRange: '₹1,19,900',
        interestType: 'Smartphone Purchase',
        purchasePreference: 'Visit Showroom'
      });
      const valid = res.status === 200 && res.data.success && res.data.lead;
      if (valid) createdLeadId = res.data.lead.leadId;
      recordTest('REST_HUB', 'POST /api/v1/leads', valid, `Created: ${createdLeadId}`);
    } catch (err) {
      recordTest('REST_HUB', 'POST /api/v1/leads', false, err.message);
    }

    if (createdLeadId) {
      try {
        const res = await http.put(`/api/v1/leads/${createdLeadId}/status`, {
          status: 'Contacted',
          noteText: 'Customer confirmed store visit'
        });
        const valid = res.status === 200 && res.data.success && res.data.lead?.status === 'Contacted';
        recordTest('REST_HUB', 'PUT /api/v1/leads/:id/status', valid, `Status: ${res.data.lead?.status}`);
      } catch (err) {
        recordTest('REST_HUB', 'PUT /api/v1/leads/:id/status', false, err.message);
      }
    }

    // Orders
    try {
      const res = await http.get('/api/v1/orders');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.orders);
      recordTest('REST_HUB', 'GET /api/v1/orders', valid, `Count: ${res.data.count}`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/orders', false, err.message);
    }

    try {
      const res = await http.put('/api/v1/orders/ORD-1082/status', {
        orderStatus: 'Out for Delivery',
        courierPartner: 'Dunzo Express',
        assignedRider: { name: 'Karthik Raja', phone: '919361863063' }
      });
      const valid = res.status === 200 && res.data.success && res.data.order?.orderStatus === 'Out for Delivery';
      recordTest('REST_HUB', 'PUT /api/v1/orders/:id/status', valid, `Status: ${res.data.order?.orderStatus}`);
    } catch (err) {
      recordTest('REST_HUB', 'PUT /api/v1/orders/:id/status', false, err.message);
    }

    // Products
    try {
      const res = await http.get('/api/v1/products');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.products);
      recordTest('REST_HUB', 'GET /api/v1/products', valid, `Count: ${res.data.count} items`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/products', false, err.message);
    }

    try {
      const res = await http.put('/api/v1/products/phone_apple_16pro', {
        stock: 15,
        offerPrice: 112900
      });
      const valid = res.status === 200 && res.data.success && res.data.product?.stock === 15;
      recordTest('REST_HUB', 'PUT /api/v1/products/:id', valid, `Stock: ${res.data.product?.stock}`);
    } catch (err) {
      recordTest('REST_HUB', 'PUT /api/v1/products/:id', false, err.message);
    }

    // Offers
    try {
      const res = await http.get('/api/v1/offers');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.offers);
      recordTest('REST_HUB', 'GET /api/v1/offers', valid, `Count: ${res.data.count} offers`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/offers', false, err.message);
    }

    // Agents
    try {
      const res = await http.get('/api/v1/agents');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.agents);
      recordTest('REST_HUB', 'GET /api/v1/agents', valid, `Count: ${res.data.count} staff members`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/agents', false, err.message);
    }

    try {
      const res = await http.put('/api/v1/agents/agent_sales_1/status', { isOnline: true });
      const valid = res.status === 200 && res.data.success && res.data.agent?.isOnline === true;
      recordTest('REST_HUB', 'PUT /api/v1/agents/:id/status', valid, `isOnline: ${res.data.agent?.isOnline}`);
    } catch (err) {
      recordTest('REST_HUB', 'PUT /api/v1/agents/:id/status', false, err.message);
    }

    // Meta Templates
    try {
      const res = await http.get('/api/v1/templates');
      const valid = res.status === 200 && res.data.success && Array.isArray(res.data.templates);
      recordTest('REST_HUB', 'GET /api/v1/templates (Meta Live Sync)', valid, `Count: ${res.data.count} templates retrieved from Meta Graph`);
    } catch (err) {
      recordTest('REST_HUB', 'GET /api/v1/templates (Meta Live Sync)', false, err.response?.data?.error?.message || err.message);
    }

    // -------------------------------------------------------------
    // SECTION 5: META WHATSAPP WEBHOOK
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: Meta WhatsApp Webhook ---');

    const challengeToken = 'meta_test_challenge_882910';
    try {
      const res = await axios.get(`${LOCAL_BASE}/webhook`, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': VERIFY_TOKEN,
          'hub.challenge': challengeToken
        }
      });
      const valid = res.status === 200 && res.data.toString() === challengeToken;
      recordTest('WEBHOOK', 'GET /webhook (Meta Handshake Challenge)', valid, 'Challenge echo verified');
    } catch (err) {
      recordTest('WEBHOOK', 'GET /webhook (Meta Handshake Challenge)', false, err.message);
    }

    try {
      await axios.get(`${LOCAL_BASE}/webhook`, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge': challengeToken
        }
      });
      recordTest('WEBHOOK', 'GET /webhook (Reject Invalid Token)', false, 'Should have failed with 403');
    } catch (err) {
      const passed = err.response?.status === 403;
      recordTest('WEBHOOK', 'GET /webhook (Reject Invalid Token)', passed, `Rejected HTTP ${err.response?.status}`);
    }

    try {
      const samplePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '1758570912097342',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '919361863063', phone_number_id: '1404976076032185' },
                  statuses: [
                    {
                      id: 'wamid.test_status_123',
                      status: 'delivered',
                      timestamp: Math.floor(Date.now() / 1000),
                      recipient_id: '919876543210'
                    }
                  ]
                },
                field: 'messages'
              }
            ]
          }
        ]
      };
      const res = await axios.post(`${LOCAL_BASE}/webhook`, samplePayload);
      const valid = res.status === 200;
      recordTest('WEBHOOK', 'POST /webhook (Meta Status Delivery Receipt)', valid, `HTTP ${res.status}`);
    } catch (err) {
      recordTest('WEBHOOK', 'POST /webhook (Meta Status Delivery Receipt)', false, err.message);
    }

    // -------------------------------------------------------------
    // SECTION 6: REMOTE RENDER PRODUCTION SERVER
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: Remote Production Server (Render) ---');
    try {
      const res = await axios.get(`${REMOTE_BASE}/crm`, { timeout: 20000 });
      const contactsList = Array.isArray(res.data) ? res.data : res.data.contacts;
      const valid = res.status === 200 && Array.isArray(contactsList);
      recordTest('REMOTE_RENDER', 'GET /crm (Render Live)', valid, `Contacts: ${contactsList?.length}`);
    } catch (err) {
      recordTest('REMOTE_RENDER', 'GET /crm (Render Live)', false, err.message);
    }

    try {
      const res = await axios.get(`${REMOTE_BASE}/crm/analytics`, { timeout: 20000 });
      const valid = res.status === 200 && res.data;
      recordTest('REMOTE_RENDER', 'GET /crm/analytics (Render Live)', valid, `Revenue: ₹${res.data?.totalRevenue}`);
    } catch (err) {
      recordTest('REMOTE_RENDER', 'GET /crm/analytics (Render Live)', false, err.message);
    }

  } finally {
    console.log('\n[TEARDOWN] Stopping local test server instance...');
    serverProcess.kill();
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                      TEST SUMMARY REPORT                       ');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`TOTAL TESTS EXECUTED: ${total}`);
  console.log(`PASSED:               ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`FAILED:               ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ [${r.category}] ${r.name}: ${r.details}`);
    });
  } else {
    console.log('\n🏆 ALL API SERVICES AND ENDPOINTS ARE 100% OPERATIONAL & VERIFIED!');
  }
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(e => {
  console.error('Test Suite Fatal Exception:', e);
  process.exit(1);
});
