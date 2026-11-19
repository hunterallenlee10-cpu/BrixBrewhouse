// Encode chosen stills to WebP + AVIF for the site. (Food photos: see encode-food.mjs.)
import sharp from "sharp";
import { statSync } from "node:fs";
const jobs = [
  ["assets/raw/N1_a.png", "public/img/night-exterior", 1920],
  ["assets/raw/N1p_a.png", "public/img/night-exterior-portrait", 900],
  ["assets/raw/H4_b.png", "public/img/pint-h4", 1920],
];
for (const [src, out, w] of jobs) {
  await sharp(src).resize({ width: w }).webp({ quality: 74 }).toFile(`${out}.webp`);
  await sharp(src).resize({ width: w }).avif({ quality: 52 }).toFile(`${out}.avif`);
  const m = await sharp(`${out}.webp`).metadata();
  console.log(out, `${m.width}x${m.height}`, Math.round(statSync(`${out}.webp`).size / 1024) + "KB webp", Math.round(statSync(`${out}.avif`).size / 1024) + "KB avif");
}
