/**
 * One-time migration: Upload food images to Cloudinary and update menu items in DB.
 * Run with: node seed/migrateImages.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDb = require('../config/mongoDb');
const Menu = require('../models/Menu');
const { cloudinary } = require('../config/cloudinary');

// Free-to-use food images from Unsplash (small size, direct links)
const imageSourceMap = {
    '65d4f1a2e4b0a1b2c3d4e5f1': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', // Zinger Burger
    '65d4f1a2e4b0a1b2c3d4e5f2': 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&h=400&fit=crop', // Double Zinger
    '65d4f1a2e4b0a1b2c3d4e5f3': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop', // Fried Chicken
    '65d4f1a2e4b0a1b2c3d4e5f4': 'https://images.unsplash.com/photo-1608039829572-9b0189aa8765?w=600&h=400&fit=crop', // Spicy Wings
    '65d4f1a2e4b0a1b2c3d4e5f5': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop', // Chicken Shawarma
    '65d4f1a2e4b0a1b2c3d4e5f6': 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=600&h=400&fit=crop', // Beef Shawarma
    '65d4f1a2e4b0a1b2c3d4e5f7': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop', // French Fries
    '65d4f1a2e4b0a1b2c3d4e5f8': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&h=400&fit=crop', // Loaded Fries
    '65d4f1a2e4b0a1b2c3d4e601': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop', // Chicken Seekh Kabab
    '65d4f1a2e4b0a1b2c3d4e602': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop', // Beef Seekh Kabab
    '65d4f1a2e4b0a1b2c3d4e603': 'https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?w=600&h=400&fit=crop', // Tikka Boti
    '65d4f1a2e4b0a1b2c3d4e604': 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&h=400&fit=crop', // Special Tikka Boti
    '65d4f1a2e4b0a1b2c3d4e605': 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&h=400&fit=crop', // Malai Boti
    '65d4f1a2e4b0a1b2c3d4e606': 'https://images.unsplash.com/photo-1606471191009-63994c53dbcf?w=600&h=400&fit=crop', // Creamy Malai Boti
    '65d4f1a2e4b0a1b2c3d4e607': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop', // Chicken Tikka
    '65d4f1a2e4b0a1b2c3d4e608': 'https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?w=600&h=400&fit=crop', // Afghani Chicken Tikka
    '65d4f1a2e4b0a1b2c3d4e609': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop', // Chicken Biryani
    '65d4f1a2e4b0a1b2c3d4e610': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600&h=400&fit=crop', // Mutton Biryani
    '65d4f1a2e4b0a1b2c3d4e611': 'https://images.unsplash.com/photo-1645696324024-c5b53244e534?w=600&h=400&fit=crop', // Chicken Pulao
    '65d4f1a2e4b0a1b2c3d4e612': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&h=400&fit=crop', // Beef Pulao
};

const migrate = async () => {
    await connectDb();
    console.log('Starting image migration to Cloudinary...\n');

    let updated = 0;
    let failed = 0;

    for (const [id, sourceUrl] of Object.entries(imageSourceMap)) {
        try {
            const item = await Menu.findById(id);
            if (!item) {
                console.log(`⚠️  ID ${id} not found in DB — skipping`);
                continue;
            }

            // Upload to Cloudinary from URL
            const result = await cloudinary.uploader.upload(sourceUrl, {
                folder: 'hotel-menu',
                public_id: item.productName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                overwrite: true,
                transformation: [
                    { width: 600, height: 400, crop: 'fill', quality: 'auto', format: 'auto' }
                ],
            });

            // Save Cloudinary URL to DB
            item.productUrl = result.secure_url;
            await item.save();

            console.log(`✅ ${item.productName} → ${result.secure_url}`);
            updated++;
        } catch (err) {
            console.log(`❌ Failed for ID ${id}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`Migration complete: ${updated} updated, ${failed} failed`);
    process.exit(0);
};

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
