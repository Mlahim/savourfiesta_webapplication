require('dotenv').config();
const { cloudinary } = require('../config/cloudinary');
const path = require('path');

const uploadLogo = async () => {
    try {
        const imagePath = path.resolve(__dirname, '../../hotel-management-system(reactJs)/public/tab_logo_v2.png');
        console.log(`Uploading ${imagePath} to Cloudinary...`);

        const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'hotel-menu',
            public_id: 'navbar_logo_v2',
            overwrite: true,
            resource_type: 'image'
        });

        console.log('Upload successful!');
        console.log('Secure URL:', result.secure_url);
        require('fs').writeFileSync('logo_url.txt', result.secure_url);
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

uploadLogo();
