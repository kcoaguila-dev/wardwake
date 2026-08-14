import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcBuf = Buffer.alloc(4 + len);
  chunk.copy(crcBuf, 0, 4, 8 + len);
  const crc = crc32(crcBuf);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, getPixel) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = getPixel(x, y);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 1. Floor tile (16x16) - Clean anime/mystery dungeon stone floor
function generateFloorTile() {
  return createPng(16, 16, (x, y) => {
    if (x === 0 || x === 15 || y === 0 || y === 15) {
      return [36, 40, 52, 255]; // Slate border
    }
    if (x === 1 || y === 1) {
      return [72, 80, 102, 255]; // Top/left highlight
    }
    if (x === 14 || y === 14) {
      return [44, 48, 62, 255]; // Bottom/right shadow
    }
    if ((x === 4 && y === 4) || (x === 11 && y === 11) || (x === 4 && y === 11) || (x === 11 && y === 4)) {
      return [80, 92, 120, 255]; // Subtle corner accent studs
    }
    const n = ((x * 13 + y * 7) % 4);
    const b = 56 + n * 3;
    return [b, b + 6, b + 16, 255];
  });
}

// 2. Wall tile (16x16) - Mystery dungeon brick wall with top bevel
function generateWallTile() {
  return createPng(16, 16, (x, y) => {
    // Beveled top cap
    if (y === 0) return [130, 138, 155, 255];
    if (y === 1) return [98, 105, 120, 255];
    if (y === 2) return [75, 80, 95, 255];

    // Mortar lines
    if (y === 3 || y === 9 || y === 15) return [24, 26, 34, 255];
    if (y > 3 && y < 9 && x === 8) return [24, 26, 34, 255];
    if (y > 9 && y < 15 && (x === 0 || x === 4 || x === 12 || x === 15)) return [24, 26, 34, 255];

    // Brick shading
    if (y === 4 || y === 10) return [88, 95, 110, 255];
    const n = ((x * 9 + y * 11) % 3);
    return [55 + n * 4, 60 + n * 4, 72 + n * 4, 255];
  });
}

// Helper to build sprite from ASCII art
function buildSprite(map, palette) {
  return createPng(16, 16, (x, y) => {
    const char = (map[y] && map[y][x]) || '_';
    return palette[char] || palette._ || [0, 0, 0, 0];
  });
}

// 3. Anime Avatar Sword Hero (16x16)
// Azure hair, anime eyes, adventurer tunic, glowing sword
function generateSwordUnit() {
  const P = {
    _: [0, 0, 0, 0],
    O: [15, 18, 28, 255],     // Dark outline
    H: [70, 160, 245, 255],   // Vibrant azure anime hair
    h: [120, 200, 255, 255],  // Hair highlight
    S: [255, 224, 189, 255],  // Skin
    E: [20, 80, 200, 255],    // Big anime eye
    W: [255, 255, 255, 255],  // Eye gleam / blade shine
    C: [235, 240, 250, 255],  // White coat
    c: [60, 110, 220, 255],   // Blue trim / cape
    G: [255, 200, 50, 255],   // Gold hilt / brooch
    B: [80, 50, 40, 255],     // Brown boots
    K: [200, 230, 255, 255],  // Glowing blade
  };

  const map = [
    "____OHHHO_______",
    "___OhHHHHh______",
    "__OHHSSSSHO_W___",
    "__OhSESEEhO_K___",
    "__OHSSSSSsO_K___",
    "___OSSSSO___K___",
    "__OcCGGCO___K___",
    "_OcCCCCCCo__K___",
    "_OcCWCCCCO_OG___",
    "_OcCWCCCCO__O___",
    "___OccCO________",
    "___OSSSO________",
    "___OBBBO________",
    "___OBOBO________",
    "__OBBOBBO_______",
    "________________",
  ];
  return buildSprite(map, P);
}

// 4. Anime Avatar Lance Knight (16x16)
// Twin-tail rose hair, paladin plate, glowing lance
function generateLanceUnit() {
  const P = {
    _: [0, 0, 0, 0],
    O: [18, 15, 24, 255],
    H: [245, 120, 160, 255],  // Rose anime hair
    h: [255, 180, 210, 255],  // Rose hair highlight
    S: [255, 228, 195, 255],  // Skin
    E: [180, 40, 100, 255],   // Crimson anime eye
    W: [255, 255, 255, 255],  // Eye gleam
    A: [210, 220, 235, 255],  // Silver plate
    a: [150, 165, 185, 255],  // Shaded armor
    L: [230, 245, 255, 255],  // Lance tip
    P: [235, 60, 110, 255],   // Lance pennant
    M: [140, 100, 60, 255],   // Lance wood shaft
    B: [70, 75, 95, 255],     // Armored boots
  };

  const map = [
    "________L_______",
    "_______LLL______",
    "__OHhO_LML______",
    "_OhHhHO_M_PP____",
    "_OHSESHOM_P_____",
    "_OHSSSShM_______",
    "__OSSSSO_M______",
    "_OAAAAAAOM______",
    "OAaAAAAaOM______",
    "OAaAAAAaO_M_____",
    "_OAAAAAAO_______",
    "__OaAAaO________",
    "__OBBOBBO_______",
    "__OBBOBBO_______",
    "_OBBBOBBBO______",
    "________________",
  ];
  return buildSprite(map, P);
}

// 5. Anime Avatar Axe Warrior (16x16)
// Wild violet hair, eyepatch/determined look, battle coat, giant executioner axe
function generateAxeUnit() {
  const P = {
    _: [0, 0, 0, 0],
    O: [20, 15, 25, 255],
    H: [140, 70, 220, 255],   // Violet wild anime hair
    h: [190, 130, 255, 255],  // Hair highlight
    S: [255, 220, 180, 255],  // Skin
    E: [255, 50, 80, 255],    // Red fierce eye
    X: [25, 25, 30, 255],     // Eyepatch / dark band
    W: [255, 255, 255, 255],  // Eye gleam
    C: [180, 45, 45, 255],    // Crimson warrior coat
    c: [110, 30, 30, 255],    // Dark crimson shadow
    Z: [190, 200, 215, 255],  // Axe steel blade
    z: [240, 245, 255, 255],  // Axe edge gleam
    M: [110, 75, 45, 255],    // Axe shaft
    B: [50, 40, 35, 255],     // Heavy boots
  };

  const map = [
    "__h__h__________",
    "_OHhhHO_zZZ_____",
    "_OhHHHOzZZZZ____",
    "_OHSXSHO_M_ZZ___",
    "_OhSESHO_M______",
    "__OSSSSO_M______",
    "_OcCCCCO_M______",
    "_OcCCCCcOM______",
    "_OCCCCCO_M______",
    "_OcCCCCcO_______",
    "__OccccO________",
    "__OSSSSO________",
    "__OBBOBBO_______",
    "__OBBOBBO_______",
    "_OBBBOBBBO______",
    "________________",
  ];
  return buildSprite(map, P);
}

const outDir = path.resolve('public', 'assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'tile_floor.png'), generateFloorTile());
fs.writeFileSync(path.join(outDir, 'tile_wall.png'), generateWallTile());
fs.writeFileSync(path.join(outDir, 'unit_sword.png'), generateSwordUnit());
fs.writeFileSync(path.join(outDir, 'unit_lance.png'), generateLanceUnit());
fs.writeFileSync(path.join(outDir, 'unit_axe.png'), generateAxeUnit());

console.log('Successfully regenerated anime avatar assets in', outDir);
