const Settings = require('../models/Settings');
const { deleteCloudinaryImage } = require('../config/cloudinary');

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
// Admin: Upload hero banner image
exports.uploadHeroBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    res.json({ message: 'Image uploaded successfully', imageUrl: req.file.path });
  } catch (err) {
    console.error("Upload Hero Banner Image Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin: Update hero banners array
exports.updateHeroBanners = async (req, res) => {
  try {
    const { heroBanners } = req.body;

    if (!Array.isArray(heroBanners)) {
      return res.status(400).json({ message: 'Invalid hero banners format. Must be an array.' });
    }

    // Check if any old cloudinary images were deleted or replaced
    const oldSetting = await Settings.findOne({ key: 'heroBanners' });
    if (oldSetting && Array.isArray(oldSetting.value)) {
      const newUrls = new Set(heroBanners.map(b => b.image));
      for (const oldBanner of oldSetting.value) {
        if (oldBanner.image && !newUrls.has(oldBanner.image)) {
          await deleteCloudinaryImage(oldBanner.image);
        }
      }
    }

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: 'heroBanners' },
      { value: heroBanners },
      { new: true, upsert: true }
    );

    res.json({ message: 'Hero banners updated successfully', heroBanners: updatedSetting.value });
  } catch (err) {
    console.error("Update Hero Banners Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};
