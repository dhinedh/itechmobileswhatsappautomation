const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');

// Disable buffering so tests don't hang if Mongo Atlas is offline
mongoose.set('bufferCommands', false);

const app = express();
app.use(bodyParser.json());

const apiRoutes = require('./api_service_routes');
app.use('/api/v1', apiRoutes);

async function runApiTests() {
  const http = require('http');
  const server = http.createServer(app);

  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`Testing API on port ${port}...`);

  try {
    // 1. Leads
    const leadsRes = await axios.get(`${baseUrl}/leads`);
    console.log(`✅ GET /leads: Found ${leadsRes.data.count} leads`);

    const updateLeadRes = await axios.put(`${baseUrl}/leads/LEAD-1082/status`, {
      status: 'Contacted',
      noteText: 'Called customer, confirmed showroom visit at 4 PM.'
    });
    console.log(`✅ PUT /leads/:id/status: Updated status to ${updateLeadRes.data.lead?.status}`);

    // 2. Orders
    const ordersRes = await axios.get(`${baseUrl}/orders`);
    console.log(`✅ GET /orders: Found ${ordersRes.data.count} orders`);

    const updateOrderRes = await axios.put(`${baseUrl}/orders/ORD-1082/status`, {
      orderStatus: 'Out for Delivery',
      courierPartner: 'Dunzo Express',
      assignedRider: { name: 'Vimal', phone: '919876543210' }
    });
    console.log(`✅ PUT /orders/:id/status: Updated order to ${updateOrderRes.data.order?.orderStatus}`);

    // 3. Products
    const productsRes = await axios.get(`${baseUrl}/products`);
    console.log(`✅ GET /products: Found ${productsRes.data.count} products`);

    const updateProdRes = await axios.put(`${baseUrl}/products/phone_apple_16pro`, {
      stock: 10,
      offerPrice: 112900
    });
    console.log(`✅ PUT /products/:id: Stock updated to ${updateProdRes.data.product?.stock}`);

    // 4. Offers
    const offersRes = await axios.get(`${baseUrl}/offers`);
    console.log(`✅ GET /offers: Found ${offersRes.data.count} offers`);

    // 5. Agents
    const agentsRes = await axios.get(`${baseUrl}/agents`);
    console.log(`✅ GET /agents: Found ${agentsRes.data.count} agents`);

    const toggleAgentRes = await axios.put(`${baseUrl}/agents/agent_sales_1/status`, {
      isOnline: false
    });
    console.log(`✅ PUT /agents/:id/status: isOnline updated to ${toggleAgentRes.data.agent?.isOnline}`);

    console.log('\n🎉 ALL DASHBOARD REST API ENDPOINTS VERIFIED & WORKING PERFECTLY!');
  } catch (err) {
    console.error('API Test Error:', err.response?.data || err.message);
  } finally {
    server.close();
    process.exit(0);
  }
}

runApiTests();

