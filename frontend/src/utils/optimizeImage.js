/**
 * Cloudinary Image Optimization Utility
 * 
 * Transforms Cloudinary URLs to use on-the-fly image transformations:
 * - Auto format (WebP/AVIF for supported browsers)
 * - Auto quality compression
 * - Responsive width sizing
 * - Lazy loading support
 */

/**
 * Checks if a URL is a Cloudinary URL
 */
const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('res.cloudinary.com');
};

/**
 * Transforms a Cloudinary URL to include optimization parameters.
 * 
 * @param {string} url - Original Cloudinary image URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Desired width (default: 400)
 * @param {number} options.height - Desired height (optional)
 * @param {string} options.crop - Crop mode (default: 'fill')
 * @param {string} options.quality - Quality setting (default: 'auto')
 * @param {string} options.format - Format (default: 'auto' for WebP/AVIF)
 * @param {string} options.gravity - Gravity for cropping (default: 'auto')
 * @returns {string} Optimized Cloudinary URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) return url;

  const {
    width = 500,
    height = 500,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
  } = options;

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const before = url.substring(0, uploadIndex + 8); // includes '/upload/'
  let after = url.substring(uploadIndex + 8);

  // Strip existing transformation segment if present (e.g. c_fill,w_400,h_300/...)
  const parts = after.split('/');
  if (parts.length > 1 && (parts[0].includes('c_') || parts[0].includes('w_') || parts[0].includes('h_') || parts[0].includes('f_') || parts[0].includes('q_'))) {
    parts.shift();
    after = parts.join('/');
  }

  let transform = `f_${format},q_${quality},w_${width}`;
  if (height && crop !== 'limit') transform += `,h_${height}`;
  transform += `,c_${crop}`;

  return `${before}${transform}/${after}`;
};

/**
 * Get optimized image URL for menu cards (un-cropped full image)
 */
export const getMenuCardImage = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 500,
    height: 500,
    crop: 'limit',
    quality: 'auto:good',
  });
};

/**
 * Get optimized image URL for cart thumbnails (un-cropped)
 */
export const getCartThumbnail = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 200,
    height: 200,
    crop: 'limit',
    quality: 'auto:good',
  });
};

/**
 * Get optimized image URL for hero banners (large, high quality)
 */
export const getHeroBannerImage = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 1200,
    height: 500,
    crop: 'limit',
    quality: 'auto:good',
  });
};

/**
 * Get a tiny placeholder image for blur-up loading effect
 */
export const getPlaceholderImage = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 30,
    height: 20,
    crop: 'limit',
    quality: 'auto:low',
    format: 'auto',
  });
};

/**
 * Get optimized navbar logo
 */
export const getNavbarLogo = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 200,
    height: 80,
    crop: 'limit',
    quality: 'auto:good',
  });
};

