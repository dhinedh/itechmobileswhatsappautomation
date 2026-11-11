const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true }, // Apple, Samsung, OnePlus, Vivo, Oppo, Xiaomi, Realme, etc.
  category: { 
    type: String, 
    required: true, 
    enum: ['Smartphone', 'Accessory', 'Tablet', 'Feature Phone'],
    default: 'Smartphone'
  },
  subCategory: { type: String, default: '' }, // Cases, Chargers, Earbuds, Tempered Glass, Power Banks, Smartwatches
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  stock: { type: Number, default: 10 },
  imageUrl: { type: String, default: '' },
  colors: [{ 
    name: String, 
    hex: String, 
    inStock: { type: Boolean, default: true } 
  }],
  
  // Guided Buyer Specs & Attribute Scoring
  specs: {
    display: { type: String, default: '' },        // e.g. '6.7" Super Retina XDR OLED 120Hz'
    processor: { type: String, default: '' },      // e.g. 'A18 Pro' / 'Snapdragon 8 Gen 3'
    ram: { type: String, default: '' },            // e.g. '8GB / 12GB'
    storage: { type: String, default: '' },        // e.g. '128GB / 256GB / 512GB'
    rearCamera: { type: String, default: '' },     // e.g. '48MP + 48MP + 12MP with OIS'
    frontCamera: { type: String, default: '' },    // e.g. '12MP TrueDepth'
    battery: { type: String, default: '' },        // e.g. '4422 mAh with 30W Fast Charging'
    fiveG: { type: Boolean, default: true }
  },
  scores: {
    camera: { type: Number, default: 80 },     // 1-100 score for Camera preference
    gaming: { type: Number, default: 80 },     // 1-100 score for Gaming preference
    battery: { type: Number, default: 80 },    // 1-100 score for Battery preference
    performance: { type: Number, default: 80 },// 1-100 score for Performance preference
    business: { type: Number, default: 80 }    // 1-100 score for Business / Daily usage
  },
  compatibleModels: [String], // Used for accessories e.g. ['iPhone 13', 'iPhone 14', 'All']
  features: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

