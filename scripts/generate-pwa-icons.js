import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Generate 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Created public/pwa-192x192.png');

  // 2. Generate 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Created public/pwa-512x512.png');

  // 3. Generate apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Created public/apple-touch-icon.png');

  // 4. Generate maskable 512x512 with safe margin (Android adaptive icon safe zone is central 80%)
  // Inner icon size: 410x410 placed centered on 512x512 #312e81 background
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 49, g: 46, b: 129, alpha: 1 } // #312e81
    }
  })
    .composite([{ input: innerIcon, top: 51, left: 51 }])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Created public/pwa-maskable-512x512.png');

  // 5. Generate favicon 32x32 PNG and favicon.ico
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.ico');
  console.log('Created public/favicon.ico');
}

generateIcons().catch(console.error);
