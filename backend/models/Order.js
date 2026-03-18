const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
      productName: { type: String, default: '' },
      quantity: { type: Number, default: 1, required: true },
      price: { type: Number, required: true },
    }],
  delivery: {
    name: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String, default: '' }
  },
  deliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'enroute', 'delivered', 'rejected', 'delivery_failed'], default: 'pending', required: true }

}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;