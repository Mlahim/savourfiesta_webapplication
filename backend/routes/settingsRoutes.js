const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/userRole');
const { uploadHero } = require('../middleware/multer');

// Public route to get settings (needs to be accessed by checkout page)
router.get('/', settingsController.getSettings);

// Admin route to update settings
router.put('/delivery-charge', auth, role('admin'), settingsController.updateDeliveryCharge);
router.put('/banner-texts', auth, role('admin'), settingsController.updateBannerTexts);
router.put('/hero-banners', auth, role('admin'), settingsController.updateHeroBanners);
router.post('/hero-banner-image', auth, role('admin'), uploadHero.single('image'), settingsController.uploadHeroBannerImage);

module.exports = router;
