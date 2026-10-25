import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const pub = (name: string) => new URL(`../../public/${name}`, import.meta.url);
const svg = await readFile(pub('favicon.svg'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
async function png(size: number) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  return page.screenshot();
}

await writeFile(pub('favicon-32x32.png'), await png(32));
await writeFile(pub('apple-touch-icon.png'), await png(180));

// An .ico is a directory of embedded PNGs.
const sizes = [16, 32, 48];
const images: Buffer[] = [];
for (const size of sizes) images.push(await png(size));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((size, i) => {
  const at = 6 + 16 * i;
  head.writeUInt8(size, at);
  head.writeUInt8(size, at + 1);
  head.writeUInt16LE(1, at + 4);
  head.writeUInt16LE(32, at + 6);
  head.writeUInt32LE(images[i].length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([head, ...images]));

await browser.close();
