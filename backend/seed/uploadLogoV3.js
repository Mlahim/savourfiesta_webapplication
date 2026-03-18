require('dotenv').config();
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const uploadLogo = async () => {
    try {
        const imagePath = path.resolve(__dirname, '../../hotel-management-system(reactJs)/public/fast food (3).png');
        console.log(`Uploading ${imagePath} to Cloudinary...`);

        const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'hotel-menu',
            public_id: 'navbar_logo_v3',
            overwrite: true,
            resource_type: 'image'
        });

        console.log('Upload successful!');
        console.log('Secure URL:', result.secure_url);
        fs.writeFileSync('logo_url_v3.txt', result.secure_url);
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

uploadLogo();
