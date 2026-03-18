/**
 * Fix: Upload images for items that failed in the first migration run.
 * Run with: node seed/fixMissingImages.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDb = require('../config/mongoDb');
const Menu = require('../models/Menu');
const { cloudinary } = require('../config/cloudinary');

const fixImages = async () => {
    await connectDb();

    // Find items without productUrl
    const missing = await Menu.find({
        $or: [
            { productUrl: null },
            { productUrl: '' },
            { productUrl: { $exists: false } }
        ]
    });

    if (missing.length === 0) {
        console.log('All items already have image URLs!');
        process.exit(0);
    }

    console.log(`Found ${missing.length} items without images. Uploading...\n`);

    // Fallback image sources based on category/subcategory keywords
    const categoryImages = {
        'Zinger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop',
        'Fried Chicken': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
        'Shawarma': 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=600&h=400&fit=crop',
        'Fries': 'https://images.unsplash.com/photo-1630384060421-cb20aed44a83?w=600&h=400&fit=crop',
        'Seekh Kabab': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop',
        'Tikka Boti': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
        'Malai Boti': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
        'Chicken Tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
        'Biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
        'Pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop',
        'Fast Food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&h=400&fit=crop',
        'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop',
        'Rice': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop',
    };

    let updated = 0;
    for (const item of missing) {
        const imageUrl = categoryImages[item.productSubCategory] || categoryImages[item.productCategory] || categoryImages['Fast Food'];

        try {
            const result = await cloudinary.uploader.upload(imageUrl, {
                folder: 'hotel-menu',
                public_id: item.productName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                overwrite: true,
                transformation: [
                    { width: 600, height: 400, crop: 'fill', quality: 'auto', format: 'auto' }
                ],
            });

            item.productUrl = result.secure_url;
            await item.save();
            console.log(`✅ ${item.productName} → ${result.secure_url}`);
            updated++;
        } catch (err) {
            console.log(`❌ ${item.productName}: ${err.message}`);
        }
    }

    console.log(`\nFixed: ${updated}/${missing.length} items`);
    process.exit(0);
};

fixImages().catch(err => {
    console.error('Fix failed:', err);
    process.exit(1);
});
