const multer = require('multer');
const { storage, heroStorage } = require('../config/cloudinary');

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max for food items
  }
});

const uploadHero = multer({
  storage: heroStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for high-res hero banners
  }
});

module.exports = { upload, uploadHero };