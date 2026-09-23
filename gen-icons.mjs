import sharp from "sharp";
import { readFileSync } from "node:fs";
const svg = readFileSync("public/icon-source.svg");
const jobs = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/icon-maskable-512.png", 512],
  ["public/apple-touch-icon.png", 180],
];
for (const [out, size] of jobs) {
  await sharp(svg, { density: 400 }).resize(size, size).png().toFile(out);
  console.log("ok", out, size);
}
