require('dotenv').config();
const mongoose = require('mongoose');
const connectDb = require('../config/mongoDb');
const Menu = require('../models/Menu');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const menuItems = [
    // Fast Food - Burger
    { productName: 'Patty Burger', productCategory: 'Fast Food', productSubCategory: 'Burger', productPrice: 300, productDescription: 'Juicy beef patty with fresh lettuce and cheese.', imageFile: 'patty_burger_fastfood.png' },
    { productName: 'Chicken Burger', productCategory: 'Fast Food', productSubCategory: 'Burger', productPrice: 350, productDescription: 'Crispy chicken fillet with mayo and lettuce.', imageFile: 'chicken_burger_fastfood.png' },
    { productName: 'Classic Zinger Burger', productCategory: 'Fast Food', productSubCategory: 'Burger', productPrice: 400, productDescription: 'Classic crispy zinger with special sauce.', imageFile: 'classic_zinger_burger.png' },
    { productName: 'Mighty Zinger Burger', productCategory: 'Fast Food', productSubCategory: 'Burger', productPrice: 550, productDescription: 'Double crispy zinger patties stacked with cheese.', imageFile: 'mighty_zinger_burger_fastfood.png' },
    { productName: 'Shami Burger', productCategory: 'Fast Food', productSubCategory: 'Burger', productPrice: 200, productDescription: 'Traditional shami kabab burger with egg and chutney.', imageFile: 'shami_burger_fastfood.png' },

    // Fast Food - Wings
    { productName: 'Fried Crispy Wings', productCategory: 'Fast Food', productSubCategory: 'Wings', productPrice: 350, productDescription: 'Crispy, golden-fried chicken wings.', imageFile: 'fried_crispy_wings_fastfood.png' },
    { productName: 'Hot Buffalo Wings', productCategory: 'Fast Food', productSubCategory: 'Wings', productPrice: 400, productDescription: 'Spicy buffalo wings served with ranch.', imageFile: 'hot_buffalo_wings_fastfood.png' },
    { productName: 'Flaming Wings', productCategory: 'Fast Food', productSubCategory: 'Wings', productPrice: 450, productDescription: 'Extra hot and flaming wings for spice lovers.', imageFile: 'flamming_wings_fastfood.png' },

    // Fast Food - Shawarma
    { productName: 'Mini Shawarma', productCategory: 'Fast Food', productSubCategory: 'Shawarma', productPrice: 150, productDescription: 'Bite-sized chicken shawarma wrap.', imageFile: 'mini_shawarma_fastfood.png' },
    { productName: 'Large Chicken Shawarma', productCategory: 'Fast Food', productSubCategory: 'Shawarma', productPrice: 250, productDescription: 'Large pita wrap filled with grilled chicken and tahini.', imageFile: 'large_chicken_shawarma_fastfood.png' },

    // Fast Food - Fried Chicken
    { productName: 'Crispy Leg Piece', productCategory: 'Fast Food', productSubCategory: 'Fried Chicken', productPrice: 200, productDescription: 'Crispy fried chicken drumstick.', imageFile: 'crispy_leg_piece_fastfood.png' },
    { productName: 'Crispy Thigh Piece', productCategory: 'Fast Food', productSubCategory: 'Fried Chicken', productPrice: 220, productDescription: 'Juicy and crispy fried chicken thigh.', imageFile: 'crispy_thigh_piece_fastfood (2).png' },

    // Fast Food - Fries
    { productName: 'Plain French Fries', productCategory: 'Fast Food', productSubCategory: 'Fries', productPrice: 150, productDescription: 'Classic salted french fries.', imageFile: 'plain_french_fries_fastfood.png' },
    { productName: 'Loaded Fries', productCategory: 'Fast Food', productSubCategory: 'Fries', productPrice: 300, productDescription: 'Fries topped with cheese, jalapenos, and sauces.', imageFile: 'loaded_fries_fastfood.png' },
    { productName: 'Garlic Mayo Fries', productCategory: 'Fast Food', productSubCategory: 'Fries', productPrice: 250, productDescription: 'Golden fries smothered in rich garlic mayo.', imageFile: 'garlic_mayo_fries_fastfood.png' },

    // BBQ - Pieces
    { productName: 'Chest Piece', productCategory: 'BBQ', productSubCategory: 'Pieces', productPrice: 300, productDescription: 'Charcoal grilled chicken breast piece.', imageFile: 'chest_piece_bbq.png' },
    { productName: 'Leg Piece', productCategory: 'BBQ', productSubCategory: 'Pieces', productPrice: 280, productDescription: 'Spicy grilled chicken leg quarter.', imageFile: 'leg_piece_bbq.png' },

    // BBQ - Seekh Kabab
    { productName: 'Seekh Kabab', productCategory: 'BBQ', productSubCategory: 'Seekh Kabab', productPrice: 250, productDescription: 'Minced meat skewers grilled to perfection.', imageFile: 'seekh_kabab_bbq.png' },

    // BBQ - Tikka
    { productName: 'Tikka Boti', productCategory: 'BBQ', productSubCategory: 'Tikka', productPrice: 400, productDescription: 'Boneless chicken marinated in spicy tikka masala.', imageFile: 'tikka_boti_bbq.png' },
    { productName: 'Tikka Wings', productCategory: 'BBQ', productSubCategory: 'Tikka', productPrice: 350, productDescription: 'BBQ grilled chicken wings.', imageFile: 'tikka_wings_bbq.png' },

    // Rice - Pulao
    { productName: 'Chana Pulao', productCategory: 'Rice', productSubCategory: 'Pulao', productPrice: 250, productDescription: 'Aromatic rice cooked with chickpeas and spices.', imageFile: 'chana_pulao_rice.png' },

    // Rice - Biryani
    { productName: 'Chicken Biryani', productCategory: 'Rice', productSubCategory: 'Biryani', productPrice: 350, productDescription: 'Spicy and flavorful chicken biryani layered with rice.', imageFile: 'chicken_biryani_rice.png' },
];

const seedAndUpload = async () => {
    try {
        await connectDb();
        console.log("Connected to DB...");

        console.log("Wiping existing menu items...");
        await Menu.deleteMany({});
        console.log("Menu cleared.");

        const publicFolderPath = path.resolve(__dirname, '../../hotel-management-system(reactJs)/public');

        for (const item of menuItems) {
            console.log(`Processing ${item.productName}...`);
            const imagePath = path.join(publicFolderPath, item.imageFile);

            let productUrl = null;

            if (fs.existsSync(imagePath)) {
                try {
                    const result = await cloudinary.uploader.upload(imagePath, {
                        folder: 'hotel-menu',
                        public_id: item.imageFile.split('.')[0] + "_" + Date.now(), // add timestamp to avoid caching issues on retry
                        overwrite: true,
                        resource_type: 'image',
                        transformation: [
                            { width: 600, height: 400, crop: 'fit', format: 'png' }
                        ],
                    });
                    productUrl = result.secure_url;
                    console.log(`✅ Image uploaded for ${item.productName}: ${productUrl}`);
                } catch (err) {
                    console.error(`❌ Cloudinary upload failed for ${item.imageFile}:`, err.message);
                }
            } else {
                console.warn(`⚠️ Warning: Image file not found: ${imagePath}`);
            }

            const newMenu = new Menu({
                productName: item.productName,
                productCategory: item.productCategory,
                productSubCategory: item.productSubCategory,
                productPrice: item.productPrice,
                productDescription: item.productDescription,
                productUrl: productUrl || ''
            });

            await newMenu.save();
            console.log(`🟢 Saved ${item.productName} to database.`);
        }
        console.log("All items processed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seedAndUpload();
