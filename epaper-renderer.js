const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

// Required Polyfills for pdfjs-dist v6 in Node environment
if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function() {
    return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
  };
}
if (!Math.sumPrecise) {
  Math.sumPrecise = function(iterable) {
    let sum = 0;
    for (const num of iterable) sum += Number(num) || 0;
    return sum;
  };
}
if (!Map.prototype.getOrInsertComputed) {
  Map.prototype.getOrInsertComputed = function(key, callback) {
    if (this.has(key)) return this.get(key);
    const val = callback(key);
    this.set(key, val);
    return val;
  };
}

async function renderPdfPages(pdfFilePath, outputDir, webPathPrefix, scale = 1.5) {
  try {
    const { createCanvas, Path2D } = await import('@napi-rs/canvas');
    globalThis.Path2D = Path2D;

    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

    const wasmUrl = pathToFileURL(path.resolve(__dirname, 'node_modules/pdfjs-dist/wasm')).href + '/';
    const cMapUrl = pathToFileURL(path.resolve(__dirname, 'node_modules/pdfjs-dist/cmaps')).href + '/';
    const standardFontDataUrl = pathToFileURL(path.resolve(__dirname, 'node_modules/pdfjs-dist/standard_fonts')).href + '/';

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const data = new Uint8Array(fs.readFileSync(pdfFilePath));
    const doc = await pdfjsLib.getDocument({
      data,
      cMapUrl,
      cMapPacked: true,
      standardFontDataUrl,
      wasmUrl,
      disableFontFace: true
    }).promise;

    const pages = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvasContext: ctx,
        viewport
      }).promise;

      const filename = `page-${pageNum}.jpg`;
      const outPath = path.join(outputDir, filename);
      const buf = canvas.toBuffer('image/jpeg', 88);
      fs.writeFileSync(outPath, buf);

      pages.push({
        page: pageNum,
        title: `पेज ${pageNum}`,
        image: `${webPathPrefix}/${filename}`
      });
    }

    return pages;
  } catch (err) {
    console.error('Error rendering PDF pages:', err);
    return [];
  }
}

module.exports = { renderPdfPages };
