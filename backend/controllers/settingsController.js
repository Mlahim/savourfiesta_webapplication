const Settings = require('../models/Settings');

// Get all settings or a specific setting
exports.getSettings = async (req, res) => {
  try {
    const { key } = req.query;
    
    // If a specific key is requested
    if (key) {
      const setting = await Settings.findOne({ key });
      return res.json({ [key]: setting ? setting.value : null });
    }

    // Get all settings and format as an object
    const settingsList = await Settings.find();
    const settingsObj = {};
    settingsList.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.json(settingsObj);
  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin: Update delivery charge
exports.updateDeliveryCharge = async (req, res) => {
  try {
    const { deliveryCharge } = req.body;

    if (deliveryCharge === undefined || deliveryCharge === null || isNaN(deliveryCharge) || deliveryCharge < 0) {
      return res.status(400).json({ message: 'Invalid delivery charge. Must be a non-negative number.' });
    }

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: 'deliveryCharge' },
      { value: Number(deliveryCharge) },
      { new: true, upsert: true }
    );

    res.json({ message: 'Delivery charge updated successfully', deliveryCharge: updatedSetting.value });
  } catch (err) {
    console.error("Update Delivery Charge Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin: Update banner texts
exports.updateBannerTexts = async (req, res) => {
  try {
    const { bannerTexts } = req.body;

    if (!Array.isArray(bannerTexts)) {
      return res.status(400).json({ message: 'Invalid banner texts format. Must be an array.' });
    }

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: 'bannerTexts' },
      { value: bannerTexts },
      { new: true, upsert: true }
    );

    res.json({ message: 'Banner texts updated successfully', bannerTexts: updatedSetting.value });
  } catch (err) {
    console.error("Update Banner Texts Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};
