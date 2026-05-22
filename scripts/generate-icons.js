const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const svgPath = path.join(__dirname, "fridge-icon.svg");
const publicDir = path.join(__dirname, "..", "public");
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { name: "favicon-16x16.png",          size: 16 },
  { name: "favicon-32x32.png",          size: 32 },
  { name: "apple-touch-icon.png",       size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "logo192.png",                size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "logo512.png",                size: 512 },
];

(async () => {
  for (const { name, size } of sizes) {
    const out = path.join(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(out);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // favicon.ico = 32x32 PNG를 ICO로 (PNG 바이트를 ICO 래퍼로 감싸기)
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  // ICO 형식: ICONDIR + ICONDIRENTRY + PNG 데이터
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);   // reserved
  icoHeader.writeUInt16LE(1, 2);   // type: 1=ICO
  icoHeader.writeUInt16LE(1, 4);   // count: 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0);      // width
  icoEntry.writeUInt8(32, 1);      // height
  icoEntry.writeUInt8(0, 2);       // color count
  icoEntry.writeUInt8(0, 3);       // reserved
  icoEntry.writeUInt16LE(1, 4);    // planes
  icoEntry.writeUInt16LE(32, 6);   // bit count
  icoEntry.writeUInt32LE(png32.length, 8);     // size of image data
  icoEntry.writeUInt32LE(6 + 16, 12);          // offset of image data

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, png32]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  console.log("✅ favicon.ico (32x32)");

  console.log("\n🎉 모든 아이콘 생성 완료!");
})();
