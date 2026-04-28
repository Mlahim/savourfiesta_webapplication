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
    width = 400,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  // Build transformation string
  let transform = `f_${format},q_${quality},w_${width}`;
  if (height) transform += `,h_${height}`;
  transform += `,c_${crop},g_${gravity}`;

  // Cloudinary URL structure:
  // https://res.cloudinary.com/{cloud}/image/upload/{existing_transforms}/{path}
  // We need to inject our transforms after /upload/
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const before = url.substring(0, uploadIndex + 8); // includes '/upload/'
  const after = url.substring(uploadIndex + 8);

  // Check if there are already transformations (they contain commas or slashes before the version)
  // If the path starts with 'v' followed by digits, there are no existing transforms
  // If it starts with something else, there might be existing transforms
  // For simplicity, we'll prepend our transforms
  return `${before}${transform}/${after}`;
};

/**
 * Get optimized image URL for menu cards (small thumbnails)
 */
export const getMenuCardImage = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto:good',
  });
};

/**
 * Get optimized image URL for cart thumbnails (tiny)
 */
export const getCartThumbnail = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 128,
    height: 128,
    crop: 'fill',
    quality: 'auto:low',
  });
};

/**
 * Get optimized image URL for hero banners (large, high quality)
 */
export const getHeroBannerImage = (url) => {
  return optimizeCloudinaryUrl(url, {
    width: 1200,
    height: 500,
    crop: 'fill',
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
    crop: 'fill',
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
    crop: 'fit',
    quality: 'auto:good',
  });
};
