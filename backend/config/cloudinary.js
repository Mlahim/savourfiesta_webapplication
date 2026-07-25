const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'hotel-menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp', // Convert all uploads to WebP for smaller file sizes
        transformation: [
            { width: 600, height: 600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
        ],
    },
});

const heroStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'hotel-hero-banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp', // WebP format for fast loading
        transformation: [
            { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' }
        ],
    },
});

const deleteCloudinaryImage = async (url) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    const parts = url.split('/upload/');
    if (parts.length > 1) {
      let pathAfterUpload = parts[1];
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
      const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.')) || pathAfterUpload;
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted Cloudinary image: ${publicId}`);
    }
  } catch (err) {
    console.error("Cloudinary deletion error:", err.message);
  }
};

module.exports = { cloudinary, storage, heroStorage, deleteCloudinaryImage };
