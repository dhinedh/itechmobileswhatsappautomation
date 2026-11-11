const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g. ORD-1082
  customerPhone: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    selectedColor: String
  }],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'COD', 'Refunded'], 
    default: 'Pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Confirmed' 
  },
  deliveryAddress: { type: String, default: '' },
  deliveryType: { type: String, enum: ['Store Pickup', 'Home Delivery'], default: 'Home Delivery' },
  courierPartner: { type: String, default: 'iTechnic Express Rider' },
  trackingNumber: { type: String, default: '' },
  trackingUrl: { type: String, default: 'https://itechnicmobiles.com/track-repair/' },
  assignedRider: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  estimatedDeliveryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

