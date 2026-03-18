const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: Number,
    price: Number
  }],
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model('Cart', cartSchema);
