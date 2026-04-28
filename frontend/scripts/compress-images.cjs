/**
 * Image Compression Script
 * 
 * Compresses all large PNG images in the public/ folder to optimized WebP format.
 * This is a ONE-TIME script to fix the massive 7-8MB PNG files.
 * 
 * Usage: node scripts/compress-images.js
 * 
 * Prerequisites: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_SIZE_BYTES = 500 * 1024; // Only compress files > 500KB

async function compressImages() {
    const files = fs.readdirSync(PUBLIC_DIR);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    
    console.log(`\n🔍 Found ${imageFiles.length} image files in public/\n`);
    
    let totalSaved = 0;
    let compressedCount = 0;
    
    for (const file of imageFiles) {
        const filePath = path.join(PUBLIC_DIR, file);
        const stat = fs.statSync(filePath);
        
        if (stat.size < MAX_SIZE_BYTES) {
            console.log(`⏭️  SKIP: ${file} (${(stat.size / 1024).toFixed(0)}KB — already small)`);
            continue;
        }
        
        const originalSize = stat.size;
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        
        try {
            // Determine if it's a hero banner (needs to be larger) or menu item image
            const isHeroBanner = file.includes('hero-banner');
            const isLogo = file.includes('logo');
            
            let width, height, quality;
            if (isHeroBanner) {
                width = 1920;
                height = 800;
                quality = 80;
            } else if (isLogo) {
                width = 300;
                height = undefined;
                quality = 85;
            } else {
                // Menu item images
                width = 600;
                height = 400;
                quality = 80;
            }
            
            // Compress to WebP (keeps same filename but with .webp extension)
            const webpPath = path.join(PUBLIC_DIR, `${baseName}.webp`);
            
            const sharpInstance = sharp(filePath).resize(width, height, {
                fit: 'cover',
                withoutEnlargement: true,
            });
            
            await sharpInstance.webp({ quality }).toFile(webpPath);
            
            const webpStat = fs.statSync(webpPath);
            const saved = originalSize - webpStat.size;
            totalSaved += saved;
            compressedCount++;
            
            console.log(
                `✅ ${file} → ${baseName}.webp | ` + 
                `${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(webpStat.size / 1024).toFixed(0)}KB | ` +
                `Saved: ${(saved / 1024 / 1024).toFixed(1)}MB (${((saved / originalSize) * 100).toFixed(0)}%)`
            );
            
            // Also create an optimized PNG replacement (for browsers that don't support webp)
            const optimizedPngPath = filePath; // Overwrite original
            await sharp(filePath)
                .resize(width, height, { fit: 'cover', withoutEnlargement: true })
                .png({ quality: quality, compressionLevel: 9, adaptiveFiltering: true })
                .toFile(filePath + '.tmp');
            
            // Replace original with optimized version
            fs.renameSync(filePath + '.tmp', filePath);
            const newPngStat = fs.statSync(filePath);
            console.log(
                `   📦 PNG optimized: ${(newPngStat.size / 1024).toFixed(0)}KB`
            );
            
        } catch (err) {
            console.error(`❌ ERROR compressing ${file}:`, err.message);
        }
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 RESULTS:`);
    console.log(`   Files compressed: ${compressedCount}/${imageFiles.length}`);
    console.log(`   Total space saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
    console.log(`${'═'.repeat(60)}\n`);
    
    console.log('💡 TIP: Update your HeroSlider to use .webp extensions for even faster loading.');
    console.log('   Example: "/hero-banner.webp" instead of "/hero-banner.png"\n');
}

compressImages().catch(console.error);
