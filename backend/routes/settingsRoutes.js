const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/userRole');

// Public route to get settings (needs to be accessed by checkout page)
router.get('/', settingsController.getSettings);

// Admin route to update settings
router.put('/delivery-charge', auth, role('admin'), settingsController.updateDeliveryCharge);
router.put('/banner-texts', auth, role('admin'), settingsController.updateBannerTexts);

module.exports = router;
