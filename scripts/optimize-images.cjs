
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CONFIG = {
    targetDirs: ['public', 'website/public', 'src/assets'],
    extensions: ['png', 'jpg', 'jpeg', 'webp'],
    quality: 80,
    maxWidth: 1920,
    thresholdBytes: 500 * 1024, // 500KB
};

async function optimizeImages() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        OTIMIZADOR DE IMAGENS (SHARP)          ║');
    console.log('╚═══════════════════════════════════════════════╝');

    let totalSaved = 0;
    let processedCount = 0;

    for (const dir of CONFIG.targetDirs) {
        const pattern = `${dir}/**/*.{${CONFIG.extensions.join(',')}}`;
        const files = glob.sync(pattern);

        for (const file of files) {
            try {
                const stats = fs.statSync(file);
                if (stats.size > CONFIG.thresholdBytes) {
                    const image = sharp(file);
                    const metadata = await image.metadata();

                    let pipeline = image;

                    // Resize if too big
                    if (metadata.width > CONFIG.maxWidth) {
                        pipeline = pipeline.resize({ width: CONFIG.maxWidth });
                    }

                    // Compress based on format
                    if (file.endsWith('.png')) {
                        pipeline = pipeline.png({ quality: CONFIG.quality, compressionLevel: 9 });
                    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
                        pipeline = pipeline.jpeg({ quality: CONFIG.quality, mozjpeg: true });
                    } else if (file.endsWith('.webp')) {
                        pipeline = pipeline.webp({ quality: CONFIG.quality });
                    }

                    const tempFile = file + '.tmp';
                    await pipeline.toFile(tempFile);

                    const newStats = fs.statSync(tempFile);
                    const saved = stats.size - newStats.size;

                    if (saved > 0) {
                        fs.renameSync(tempFile, file);
                        totalSaved += saved;
                        processedCount++;
                        console.log(`✓ Otimizado: ${file}`);
                        console.log(`  ${(stats.size / 1024).toFixed(2)}KB -> ${(newStats.size / 1024).toFixed(2)}KB (Economia: ${(saved / 1024).toFixed(2)}KB)`);
                    } else {
                        fs.unlinkSync(tempFile);
                        console.log(`- Ignorado (já otimizado): ${file}`);
                    }
                }
            } catch (err) {
                console.error(`✗ Erro ao processar ${file}:`, err.message);
            }
        }
    }

    console.log('\n------------------------------------------------');
    console.log(`Total de imagens processadas: ${processedCount}`);
    console.log(`Economia total de espaço: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log('------------------------------------------------\n');
}

optimizeImages();
