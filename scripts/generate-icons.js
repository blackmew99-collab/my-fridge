const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const srcPath  = path.join(__dirname, "fridge-source.png");
const publicDir = path.join(__dirname, "..", "public");

const SIZES = [
  { name: "favicon-16x16.png",           size: 16  },
  { name: "favicon-32x32.png",           size: 32  },
  { name: "apple-touch-icon.png",        size: 180 },
  { name: "android-chrome-192x192.png",  size: 192 },
  { name: "logo192.png",                 size: 192 },
  { name: "android-chrome-512x512.png",  size: 512 },
  { name: "logo512.png",                 size: 512 },
];

const BG_COLOR = { r: 253, g: 232, b: 242, alpha: 1 }; // #fde8f2

/** 흰 배경 픽셀을 투명으로 변환 */
async function removeWhiteBg(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) {
      data[i + 3] = 0; // 투명
    }
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

/** 둥근 마스크(클리핑) SVG */
function roundedMask(size, radius) {
  return Buffer.from(
    `<svg width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  );
}

async function buildIcon(size) {
  const pad    = Math.round(size * 0.08);   // 8% 여백
  const inner  = size - pad * 2;
  const radius = Math.round(size * 0.225);  // 배경 모서리 반경

  // 1) 흰 배경 제거한 냉장고 이미지 → inner 크기로 리사이즈
  const noWhite = await removeWhiteBg(fs.readFileSync(srcPath));
  const fridgeBuf = await sharp(noWhite)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 2) 파스텔 핑크 배경 생성
  const bgBuf = await sharp({
    create: { width: size, height: size, channels: 4, background: BG_COLOR },
  })
    .png()
    .toBuffer();

  // 3) 배경 위에 냉장고 합성 (중앙 배치)
  const composed = await sharp(bgBuf)
    .composite([{ input: fridgeBuf, top: pad, left: pad }])
    .png()
    .toBuffer();

  // 4) 둥근 모서리 마스크 적용
  const mask = roundedMask(size, radius);
  return sharp(composed)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

(async () => {
  for (const { name, size } of SIZES) {
    const buf = await buildIcon(size);
    fs.writeFileSync(path.join(publicDir, name), buf);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // favicon.ico (32×32)
  const ico32 = await buildIcon(32);
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0);
  icoEntry.writeUInt8(32, 1);
  icoEntry.writeUInt8(0, 2);
  icoEntry.writeUInt8(0, 3);
  icoEntry.writeUInt16LE(1, 4);
  icoEntry.writeUInt16LE(32, 6);
  icoEntry.writeUInt32LE(ico32.length, 8);
  icoEntry.writeUInt32LE(22, 12);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), Buffer.concat([icoHeader, icoEntry, ico32]));
  console.log("✅ favicon.ico (32x32)");

  console.log("\n🎉 모든 아이콘 생성 완료!");
})();
