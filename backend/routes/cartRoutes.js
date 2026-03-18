const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const cart = require('../controllers/cartController');

router.post('/add', auth, cart.addToCart);
router.post('/merge', auth, cart.mergeCart);
router.get('/', auth, cart.getCartItems);
router.post('/checkout', auth, cart.checkout);
router.put('/update', auth, cart.updateItemQuantity);
router.post('/remove', auth, cart.removeFromCart);
router.delete('/clear', auth, cart.clearCart);

module.exports = router;
