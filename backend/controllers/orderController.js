const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Menu = require('../models/Menu');
const User = require('../models/User');
const sendEmail = require('../config/nodemailer');

exports.createOrder = async (req, res) => {
  try {
    const { items, delivery, totalAmount, deliveryCharge } = req.body;

    // Validate required delivery fields
    if (!delivery?.email || !delivery?.phone || !delivery?.address) {
      return res.status(400).json({ message: 'Email, phone, and address are required for delivery.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Look up product names for each item
    const orderItems = await Promise.all(items.map(async (item) => {
      const productId = item.productId?._id || item.productId;
      let productName = item.productName || '';

      // If no productName was sent from frontend, look it up
      if (!productName && productId) {
        try {
          const product = await Menu.findById(productId);
          if (product) {
            productName = product.productName;
          }
        } catch (e) {
          // Product might not exist anymore, use whatever we have
        }
      }

      return {
        productId,
        productName,
        quantity: item.quantity,
        price: item.price || 0
      };
    }));

    const order = new Order({
      userId: req.user?.id || null,
      items: orderItems,
      delivery,
      deliveryCharge: deliveryCharge || 0,
      totalAmount,
      status: 'pending'
    });

    await order.save();

    // Clear the user's cart if logged in
    if (req.user?.id) {
      const cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    }

    // Send email notification to admin(s) — fire-and-forget
    try {
      const admins = await User.find({ role: 'admin' });
      if (admins.length > 0) {
        const adminEmails = admins.map(a => a.email).join(', ');
        const itemRows = orderItems.map(item =>
          `<tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.productName || 'N/A'}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
        ).join('');

        await sendEmail({
          to: adminEmails,
          subject: `🛒 New Order #${order._id.toString().slice(-6).toUpperCase()} — $${totalAmount.toFixed(2)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ea580c;">New Order Received!</h1>
              <p style="color: #555;">A new order has been placed. Here are the details:</p>

              <h3 style="margin-top: 24px; color: #333;">📦 Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr style="background: #f9f9f9;">
                    <th style="padding: 8px 12px; text-align: left;">Item</th>
                    <th style="padding: 8px 12px; text-align: center;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <div style="margin-top: 12px; border-top: 1px solid #ccc; padding-top: 8px;">
                <p style="color: #555; text-align: right; margin: 4px 0;">Delivery Charge: $${Number(deliveryCharge || 0).toFixed(2)}</p>
                <p style="font-size: 18px; font-weight: bold; color: #ea580c; text-align: right; margin: 4px 0;">
                  Total: $${totalAmount.toFixed(2)}
                </p>
              </div>

              <h3 style="margin-top: 24px; color: #333;">👤 Customer Info</h3>
              <p style="color: #555; margin: 4px 0;"><strong>Name:</strong> ${delivery.name || 'N/A'}</p>
              <p style="color: #555; margin: 4px 0;"><strong>Email:</strong> ${delivery.email}</p>
              <p style="color: #555; margin: 4px 0;"><strong>Phone:</strong> ${delivery.phone}</p>

              <h3 style="margin-top: 24px; color: #333;">📍 Delivery Address</h3>
              <p style="color: #555;">${delivery.address}${delivery.landmark ? ' (Near: ' + delivery.landmark + ')' : ''}</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr.message);
    }

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: 'Failed to place order.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ADMIN: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const User = require('../models/User');
    const orders = await Order.find()
      .populate('items.productId', 'productName productCategory productSubCategory')
      .sort({ createdAt: -1 });

    // Attach user info using MongoDB _id
    const ordersWithUser = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      if (orderObj.userId) {
        const user = await User.findById(orderObj.userId);
        orderObj.userInfo = user ? { name: user.name, email: user.email, phone: user.phone } : null;
      }
      return orderObj;
    }));

    res.json(ordersWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ADMIN: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'enroute', 'delivered', 'rejected', 'delivery_failed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email phone')
      .populate('items.productId', 'productName productCategory productSubCategory');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
