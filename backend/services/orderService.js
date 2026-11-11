/**
 * Order Tracking & Fulfillment Service
 * Look up order status by Order ID or Registered Mobile number, format timeline & delivery details
 */

const Order = require('../models/Order');
const { SAMPLE_ORDERS } = require('../seed_data');

/**
 * Normalizes phone number to 10 or 12 digits
 */
function cleanPhone(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  return digits;
}

/**
 * Visual 5-Stage Order Status Bar Helper
 */
function renderOrderStatusBar(status) {
  const stages = [
    { key: 'Order Confirmed', label: 'Confirmed' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  const currentIdx = stages.findIndex(
    s => s.key.toLowerCase() === (status || '').toLowerCase()
  );
  const idx = currentIdx === -1 ? 0 : currentIdx;

  const bar = stages
    .map((s, i) => (i <= idx ? `🟢 *${s.label}*` : `⚪ ${s.label}`))
    .join(' ➔ ');

  return bar;
}

/**
 * Find order by Order ID or Customer Phone
 */
async function findOrder(query) {
  if (!query) return null;
  const trimmed = query.trim().toUpperCase();
  const normalizedP = cleanPhone(query);

  try {
    const order = await Order.findOne({
      $or: [
        { orderId: trimmed },
        { customerPhone: normalizedP },
        { customerPhone: query.replace(/\D/g, '') }
      ]
    }).sort({ createdAt: -1 });

    if (order) return order;
  } catch (e) {
    console.warn('MongoDB query failed in findOrder, falling back to sample orders:', e.message);
  }

  // Fallback to sample orders
  const found = SAMPLE_ORDERS.find(
    o => o.orderId.toUpperCase() === trimmed || 
         o.customerPhone === normalizedP || 
         o.customerPhone.endsWith(query.replace(/\D/g, '').slice(-10))
  );

  return found || null;
}

/**
 * Format order details message for WhatsApp
 */
function formatOrderMessage(order) {
  const statusBar = renderOrderStatusBar(order.orderStatus);
  const itemsText = (order.items || [])
    .map(i => `• *${i.productName || i.name}* (Qty: ${i.quantity || 1}) - ₹${(i.price || 0).toLocaleString('en-IN')}`)
    .join('\n');

  let deliveryInfo = '';
  if (order.orderStatus === 'Out for Delivery' && order.assignedRider?.name) {
    deliveryInfo = `\n🏍️ *Delivery Rider:* ${order.assignedRider.name}\n📞 *Rider Contact:* ${order.assignedRider.phone}`;
  } else if (order.courierPartner) {
    deliveryInfo = `\n🚚 *Courier Partner:* ${order.courierPartner}\n📦 *AWB/Tracking:* ${order.trackingNumber || 'Active'}`;
  }

  const etaText = order.estimatedDeliveryDate 
    ? `\n⏰ *Estimated Delivery:* ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`
    : '';

  return `📦 *ORDER STATUS: ${order.orderId}*\n\n` +
    `${statusBar}\n\n` +
    `🛒 *Items Ordered:*\n${itemsText}\n\n` +
    `💰 *Total Amount:* ₹${(order.totalAmount || 0).toLocaleString('en-IN')} (${order.paymentStatus || 'Paid'})\n` +
    `📍 *Delivery Address:* ${order.deliveryAddress || 'iTechnic Showroom Pickup'}` +
    `${deliveryInfo}` +
    `${etaText}\n\n` +
    `_Need further assistance with this order? Reply *AGENT* or tap below._`;
}

module.exports = {
  findOrder,
  formatOrderMessage,
  renderOrderStatusBar
};

