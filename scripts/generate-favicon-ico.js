#!/usr/bin/env node

/**
 * Generate favicon.ico from public/favicon.svg using sharp and sharp-ico.
 *
 * Usage:
 *   node scripts/generate-favicon-ico.js
 *
 * Output:
 *   public/favicon.ico
 *   public/favicons/favicon.ico (used by BaseHead.astro)
 */

import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import ico from "sharp-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const svgPath = path.join(rootDir, "public", "favicon.svg");
const icoRootPath = path.join(rootDir, "public", "favicon.ico");
const icoFaviconsPath = path.join(rootDir, "public", "favicons", "favicon.ico");

const SIZES = [256, 128, 64, 48, 32, 24, 16];

async function main() {
  const sharpInstance = sharp(svgPath);

  await ico.sharpsToIco([sharpInstance], icoRootPath, {
    sizes: SIZES,
    resizeOptions: { fit: "contain" },
  });
  console.log(`Wrote ${path.relative(rootDir, icoRootPath)}`);

  const sharpInstance2 = sharp(svgPath);
  await ico.sharpsToIco([sharpInstance2], icoFaviconsPath, {
    sizes: SIZES,
    resizeOptions: { fit: "contain" },
  });
  console.log(`Wrote ${path.relative(rootDir, icoFaviconsPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
