const sharp = require('sharp');
const path = require('path');

const inputPath = path.resolve(__dirname, '../public/tab_logo_v3.png');
const publicDir = path.resolve(__dirname, '../public');

async function generate() {
    // 32x32 favicon
    await sharp(inputPath)
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png generated');

    // 16x16 favicon
    await sharp(inputPath)
        .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ favicon-16x16.png generated');

    // 180x180 Apple touch icon
    await sharp(inputPath)
        .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png generated');

    // 192x192 for Android/PWA
    await sharp(inputPath)
        .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, 'favicon-192x192.png'));
    console.log('✅ favicon-192x192.png generated');

    console.log('\nAll favicons generated successfully!');
}

generate().catch(err => {
    console.error('Error generating favicons:', err);
    process.exit(1);
});
