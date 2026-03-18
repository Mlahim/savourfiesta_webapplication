const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productSubCategory: String,
  productPrice: Number,
  originalPrice: { type: Number, default: null },
  discountedPrice: { type: Number, default: null },
  productDescription: String,
  productUrl: String,
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
