const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/userRole');
const order = require('../controllers/orderController');
const jwt = require('jsonwebtoken');

// Optional auth middleware - allows both guest and logged-in users
const optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role || 'user',
                name: decoded.name || ''
            };
        } catch (err) {
            // Token is invalid, treat as guest
        }
    }
    next();
};

// ADMIN routes (must be before /:id routes)
router.get('/admin/all', auth, role('admin'), order.getAllOrders);
router.put('/admin/:id/status', auth, role('admin'), order.updateOrderStatus);

// Customer routes
router.post('/', optionalAuth, order.createOrder);
router.get('/', auth, order.getOrders);

module.exports = router;
