const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const sourcePath = path.resolve('branding/dainik-manyavar-new-logo.png');
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Source logo not found at ' + sourcePath);
  }

  console.log('Loading source logo from:', sourcePath);

  // 1. Trim logo to get pure artwork
  const trimmedBuffer = await sharp(sourcePath).trim().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed artwork dimensions: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // 2. Prepare monochrome stencil buffer for Android 13+ themed icons
  const rawData = await sharp(trimmedBuffer).raw().toBuffer({ resolveWithObject: true });
  const monoData = Buffer.alloc(rawData.info.width * rawData.info.height * 4);
  for (let i = 0, j = 0; i < rawData.data.length; i += rawData.info.channels, j += 4) {
    const r = rawData.data[i];
    const g = rawData.data[i + 1];
    const b = rawData.data[i + 2];
    const isWhite = (r > 240 && g > 240 && b > 240);
    // Silhouette in white with transparent background
    monoData[j] = 255;
    monoData[j + 1] = 255;
    monoData[j + 2] = 255;
    monoData[j + 3] = isWhite ? 0 : 255;
  }
  const trimmedMonoBuffer = await sharp(monoData, {
    raw: { width: rawData.info.width, height: rawData.info.height, channels: 4 }
  }).png().toBuffer();

  // Densities according to Android specifications
  // For adaptive icons: total layer is 108dp. Safe zone is inner 66dp.
  // Ratio 751 / 958 = 0.7839. Logo width ~46dp fits within 66dp circle without clipping.
  const densities = [
    { name: 'mipmap-mdpi', legacySize: 48, adaptiveSize: 108, legacyLogoW: 40, roundLogoW: 34, adaptLogoW: 46 },
    { name: 'mipmap-hdpi', legacySize: 72, adaptiveSize: 162, legacyLogoW: 60, roundLogoW: 51, adaptLogoW: 69 },
    { name: 'mipmap-xhdpi', legacySize: 96, adaptiveSize: 216, legacyLogoW: 80, roundLogoW: 68, adaptLogoW: 92 },
    { name: 'mipmap-xxhdpi', legacySize: 144, adaptiveSize: 324, legacyLogoW: 120, roundLogoW: 102, adaptLogoW: 138 },
    { name: 'mipmap-xxxhdpi', legacySize: 192, adaptiveSize: 432, legacyLogoW: 160, roundLogoW: 136, adaptLogoW: 184 },
  ];

  const resBase = path.resolve('android/app/src/main/res');

  for (const d of densities) {
    const dir = path.join(resBase, d.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // A. ic_launcher.png (legacy rounded rectangle with white background)
    const legacyLogoH = Math.round(d.legacyLogoW * (trimmedMeta.height / trimmedMeta.width));
    const resizedLegacy = await sharp(trimmedBuffer).resize(d.legacyLogoW, legacyLogoH).toBuffer();
    const cornerRadius = Math.round(d.legacySize * 0.14);
    const rectSvg = Buffer.from(
      `<svg width="${d.legacySize}" height="${d.legacySize}">` +
      `<rect x="0" y="0" width="${d.legacySize}" height="${d.legacySize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>` +
      `</svg>`
    );
    await sharp(rectSvg)
      .composite([{ input: resizedLegacy, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (legacy round circle with white background)
    const roundLogoH = Math.round(d.roundLogoW * (trimmedMeta.height / trimmedMeta.width));
    const resizedRound = await sharp(trimmedBuffer).resize(d.roundLogoW, roundLogoH).toBuffer();
    const circleSvg = Buffer.from(
      `<svg width="${d.legacySize}" height="${d.legacySize}">` +
      `<circle cx="${d.legacySize / 2}" cy="${d.legacySize / 2}" r="${d.legacySize / 2}" fill="#ffffff"/>` +
      `</svg>`
    );
    await sharp(circleSvg)
      .composite([{ input: resizedRound, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // C. ic_launcher_foreground.png (adaptive foreground on transparent 108dp canvas)
    const adaptLogoH = Math.round(d.adaptLogoW * (trimmedMeta.height / trimmedMeta.width));
    const resizedAdapt = await sharp(trimmedBuffer).resize(d.adaptLogoW, adaptLogoH).toBuffer();
    await sharp({
      create: {
        width: d.adaptiveSize,
        height: d.adaptiveSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedAdapt, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    // D. ic_launcher_monochrome.png (adaptive themed monochrome on transparent 108dp canvas)
    const resizedMono = await sharp(trimmedMonoBuffer).resize(d.adaptLogoW, adaptLogoH).toBuffer();
    await sharp({
      create: {
        width: d.adaptiveSize,
        height: d.adaptiveSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedMono, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_monochrome.png'));

    console.log(`Generated all icon assets for ${d.name} (${d.legacySize}x${d.legacySize} legacy, ${d.adaptiveSize}x${d.adaptiveSize} adaptive)`);
  }

  console.log('All launcher icons successfully generated!');
}

run().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
