#!/usr/bin/env node

/**
 * Generate favicon assets from public/favicon.svg:
 *   - .ico (multi-size)
 *   - .png (16, 32, 48, 180 apple-touch, 192 android)
 *   - .webp (16, 32, 192)
 *
 * Usage:
 *   node scripts/generate-favicon-ico.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import ico from "sharp-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const svgPath = path.join(rootDir, "public", "favicon.svg");
const faviconsDir = path.join(rootDir, "public", "favicons");

const ICO_SIZES = [256, 128, 64, 48, 32, 24, 16];
const resizeOpt = { fit: "contain" };

async function main() {
  // 1. ICO
  await ico.sharpsToIco([sharp(svgPath)], path.join(rootDir, "public", "favicon.ico"), {
    sizes: ICO_SIZES,
    resizeOptions: resizeOpt,
  });
  console.log("Wrote public/favicon.ico");

  await ico.sharpsToIco([sharp(svgPath)], path.join(faviconsDir, "favicon.ico"), {
    sizes: ICO_SIZES,
    resizeOptions: resizeOpt,
  });
  console.log("Wrote public/favicons/favicon.ico");

  // 2. PNG (standard favicon sizes + apple-touch + android)
  const pngSizes = [
    [16, "favicon-16x16.png"],
    [32, "favicon-32x32.png"],
    [48, "favicon-48x48.png"],
    [180, "apple-touch-icon.png"],
    [192, "android-chrome-192x192.png"],
    [384, "android-chrome-384x384.png"],
  ];
  for (const [size, name] of pngSizes) {
    await sharp(svgPath).resize(size, size, resizeOpt).png().toFile(path.join(faviconsDir, name));
    console.log(`Wrote public/favicons/${name}`);
  }

  // 3. WebP
  const webpSizes = [
    [16, "favicon-16x16.webp"],
    [32, "favicon-32x32.webp"],
    [192, "android-chrome-192x192.webp"],
  ];
  for (const [size, name] of webpSizes) {
    await sharp(svgPath).resize(size, size, resizeOpt).webp().toFile(path.join(faviconsDir, name));
    console.log(`Wrote public/favicons/${name}`);
  }

  // Copy source SVG into favicons for consistency
  fs.copyFileSync(svgPath, path.join(faviconsDir, "favicon.svg"));
  console.log("Wrote public/favicons/favicon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
