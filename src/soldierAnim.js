import { getBestHeadDataUrl } from './headAssets.js';
import { getSavedFaceDataUrl } from './facePixelate.js';
import { RETRO_PIXEL_HEAD } from '../shared/retroHead.js';

export const SOLDIER_TEXTURE = 'soldier';
export const SHEET_SRC_KEY = 'soldier-sheet-src';
export const SHEET_PATH = 'assets/Mainbody.png';

export const SRC_FRAME_W = 688;
export const SRC_FRAME_H = 768;
export const FRAME_W = 344;
export const FRAME_H = 384;
export const SHEET_COLS = 4;
export const SHEET_ROWS = 2;

// Small brown placeholder on the body (only this gets cleared).
const SOCKET_RADIUS = 28;
// Target height of the opaque head cutout on the soldier.
const HEAD_CONTENT_HEIGHT = 110;
/** Chunky pixel grid height before upscaling onto the body (retro mode). */
const RETRO_HEAD_PIXEL_H = 42;

const HEAD_FALLBACK = {
  right: { x: 159, y: 50 },
  left: { x: 170, y: 52 },
};

function loadImage(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export function preloadSoldierSheet(scene) {
  // Shared TextureManager — do not remove on every scene entry or the next
  // scene's create() can race / throw and leave a blank screen.
  if (!scene.textures.exists(SHEET_SRC_KEY)) {
    scene.load.image(SHEET_SRC_KEY, `${SHEET_PATH}?v=16`);
  }
}

export function hasSoldierSheet(scene) {
  return scene.textures.exists(SHEET_SRC_KEY) || scene.textures.exists(SOLDIER_TEXTURE);
}

/**
 * Builds the playable spritesheet from the original Mainbody.png,
 * then attaches an AI/pixel head onto each neck socket (gapless).
 */
export async function buildSoldierAnim(scene, faceDataUrl = getSavedFaceDataUrl()) {
  if (!scene.textures.exists(SHEET_SRC_KEY)) {
    // Re-entering a scene after Esc: sheet may still be loading, but an older
    // baked soldier texture is enough to play.
    if (scene.textures.exists(SOLDIER_TEXTURE)) {
      createSoldierAnims(scene);
      return true;
    }
    return false;
  }

  const source = scene.textures.get(SHEET_SRC_KEY).getSourceImage();
  const headImage = await loadImage(getBestHeadDataUrl(faceDataUrl));

  const srcFrameW = Math.floor(source.width / SHEET_COLS) || SRC_FRAME_W;
  const srcFrameH = Math.floor(source.height / SHEET_ROWS) || SRC_FRAME_H;

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * SHEET_COLS;
  canvas.height = FRAME_H * SHEET_ROWS;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  const tmp = document.createElement('canvas');
  tmp.width = FRAME_W;
  tmp.height = FRAME_H;
  const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });
  tmpCtx.imageSmoothingEnabled = false;

  for (let row = 0; row < SHEET_ROWS; row += 1) {
    for (let col = 0; col < SHEET_COLS; col += 1) {
      tmpCtx.clearRect(0, 0, FRAME_W, FRAME_H);
      tmpCtx.drawImage(
        source,
        col * srcFrameW,
        row * srcFrameH,
        srcFrameW,
        srcFrameH,
        0,
        0,
        FRAME_W,
        FRAME_H,
      );

      removeBlackCellBorder(tmpCtx, FRAME_W, FRAME_H);
      removeCheckerboard(tmpCtx, FRAME_W, FRAME_H);

      if (headImage) {
        const facing = row === 0 ? 'right' : 'left';
        const socket = findHeadSocket(tmpCtx, FRAME_W, FRAME_H) || HEAD_FALLBACK[facing];
        attachHeadGapless(tmpCtx, headImage, socket);
      }

      ctx.drawImage(tmp, col * FRAME_W, row * FRAME_H);
    }
  }

  replaceSoldierTexture(scene, canvas);
  createSoldierAnims(scene);
  return true;
}

function ensurePlaceholderTexture(scene) {
  if (scene.textures.exists('__soldier_placeholder')) return;
  const stub = document.createElement('canvas');
  stub.width = 1;
  stub.height = 1;
  scene.textures.addCanvas('__soldier_placeholder', stub);
}

function replaceSoldierTexture(scene, canvas) {
  ensurePlaceholderTexture(scene);
  if (scene.anims.exists('walk-right') || scene.anims.exists('walk-left')) {
    scene.anims.pauseAll();
  }

  const users = [];
  scene.children.each((child) => {
    if (child.texture?.key === SOLDIER_TEXTURE) {
      users.push(child);
      if (child.anims) child.anims.stop();
      child.setTexture('__soldier_placeholder');
    }
  });

  if (scene.textures.exists(SOLDIER_TEXTURE)) {
    scene.textures.remove(SOLDIER_TEXTURE);
  }

  scene.textures.addSpriteSheet(SOLDIER_TEXTURE, canvas, {
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
  });
  scene.textures.get(SOLDIER_TEXTURE).setFilter(Phaser.Textures.FilterMode.NEAREST);

  users.forEach((child) => {
    child.setTexture(SOLDIER_TEXTURE, 0);
  });
  scene.anims.resumeAll();
}

export function createSoldierAnims(scene) {
  if (scene.anims.exists('walk-right')) scene.anims.remove('walk-right');
  if (scene.anims.exists('walk-left')) scene.anims.remove('walk-left');

  scene.anims.create({
    key: 'walk-right',
    frames: scene.anims.generateFrameNumbers(SOLDIER_TEXTURE, { start: 0, end: 3 }),
    frameRate: 9,
    repeat: -1,
  });

  scene.anims.create({
    key: 'walk-left',
    frames: scene.anims.generateFrameNumbers(SOLDIER_TEXTURE, { start: 4, end: 7 }),
    frameRate: 9,
    repeat: -1,
  });
}

export function playSoldierIdle(sprite, facing) {
  sprite.anims.stop();
  sprite.setFrame(facing === 'left' ? 4 : 0);
}

export function playSoldierWalk(sprite, facing) {
  const key = facing === 'left' ? 'walk-left' : 'walk-right';
  if (sprite.anims.currentAnim?.key !== key || !sprite.anims.isPlaying) {
    sprite.anims.play(key, true);
  }
}

function removeBlackCellBorder(ctx, width, height) {
  const border = 4;
  ctx.clearRect(0, 0, width, border);
  ctx.clearRect(0, height - border, width, border);
  ctx.clearRect(0, 0, border, height);
  ctx.clearRect(width - border, 0, border, height);
}

function findHeadSocket(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let best = null;
  let bestScore = 0;

  const yMin = Math.floor(height * 0.08);
  const yMax = Math.floor(height * 0.42);
  const xMin = Math.floor(width * 0.28);
  const xMax = Math.floor(width * 0.72);

  for (let cy = yMin; cy < yMax; cy += 2) {
    for (let cx = xMin; cx < xMax; cx += 2) {
      const i = (cy * width + cx) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 20) continue;

      const avg = (r + g + b) / 3;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (avg < 12 || avg > 70) continue;
      if (chroma <= 4 && avg > 40) continue;
      if (g > r + 8) continue;

      let same = 0;
      for (let dy = -12; dy <= 12; dy += 2) {
        for (let dx = -12; dx <= 12; dx += 2) {
          if (dx * dx + dy * dy > 144) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= width || y >= height) continue;
          const j = (y * width + x) * 4;
          if (
            Math.abs(data[j] - r) < 18 &&
            Math.abs(data[j + 1] - g) < 18 &&
            Math.abs(data[j + 2] - b) < 18 &&
            data[j + 3] > 20
          ) {
            same += 1;
          }
        }
      }

      if (same > bestScore) {
        bestScore = same;
        best = { x: cx, y: cy };
      }
    }
  }

  return bestScore >= 40 ? best : null;
}

/**
 * Clears ONLY the small placeholder socket, crops the AI head to opaque pixels,
 * then seats that content on the neck (ignores transparent padding).
 */
function attachHeadGapless(ctx, headImage, socket) {
  const x = socket.x;
  const y = socket.y;

  // 1) Remove only the small brown head placeholder — keep the torso.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, SOCKET_RADIUS + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2) Crop to real head pixels (AI images are mostly empty transparency).
  const crop = cropOpaqueBounds(headImage);
  if (!crop) return;

  const source = RETRO_PIXEL_HEAD
    ? retroPixelateHead(headImage, crop, RETRO_HEAD_PIXEL_H)
    : { image: headImage, sx: crop.x, sy: crop.y, sw: crop.w, sh: crop.h };

  const scale = HEAD_CONTENT_HEIGHT / source.sh;
  const drawW = Math.max(1, Math.round(source.sw * scale));
  const drawH = Math.max(1, Math.round(source.sh * scale));

  // Bottom of the opaque head overlaps into the neck stump (gapless).
  // Seat a bit lower so retro heads don't float above the neck.
  const overlap = Math.round(SOCKET_RADIUS * 2.25);
  const drawX = Math.round(x - drawW / 2);
  const drawY = Math.round(y + overlap - drawH) + 4;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    source.image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    drawX,
    drawY,
    drawW,
    drawH,
  );
}

/**
 * Downscale → nearest-neighbor upscale so the head reads as chunky 2D sprite art.
 * Returns a small canvas used as the drawImage source (full frame, sx/sy=0).
 */
function retroPixelateHead(headImage, crop, pixelH) {
  const aspect = crop.w / Math.max(1, crop.h);
  const smallH = Math.max(16, pixelH);
  const smallW = Math.max(12, Math.round(smallH * aspect));

  const small = document.createElement('canvas');
  small.width = smallW;
  small.height = smallH;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  sctx.imageSmoothingEnabled = false;
  sctx.clearRect(0, 0, smallW, smallH);
  sctx.drawImage(
    headImage,
    crop.x,
    crop.y,
    crop.w,
    crop.h,
    0,
    0,
    smallW,
    smallH,
  );

  // Light palette crunch: snap RGB to coarser steps for flatter cel look.
  const img = sctx.getImageData(0, 0, smallW, smallH);
  const { data } = img;
  const step = 24;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
    data[i + 3] = data[i + 3] > 128 ? 255 : 0;
  }
  sctx.putImageData(img, 0, 0);

  return { image: small, sx: 0, sy: 0, sw: smallW, sh: smallH };
}

/** Bounding box of non-transparent pixels in an image. */
function cropOpaqueBounds(image) {
  const w = image.naturalWidth || image.width;
  const h = image.naturalHeight || image.height;
  if (!w || !h) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d', { willReadFrequently: true });
  c.drawImage(image, 0, 0);
  const { data } = c.getImageData(0, 0, w, h);

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let py = 0; py < h; py += 1) {
    for (let px = 0; px < w; px += 1) {
      const a = data[(py * w + px) * 4 + 3];
      if (a < 16) continue;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
  }

  if (maxX < 0) return null;

  // Small pad so we don't clip outline pixels.
  const pad = 2;
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const right = Math.min(w - 1, maxX + pad);
  const bottom = Math.min(h - 1, maxY + pad);

  return {
    x,
    y,
    w: right - x + 1,
    h: bottom - y + 1,
  };
}

function removeCheckerboard(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  const total = width * height;
  const marked = new Uint8Array(total);

  const isCheckerSquare = (i) => {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a < 20) return true;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    const chroma = max - min;

    if (chroma > 16) return false;
    if (avg < 80) return false;
    if (avg > 175) return true;
    return avg >= 85 && avg <= 165;
  };

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (marked[i] || !isCheckerSquare(i)) return;
    marked[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < total; i += 1) {
    if (!marked[i]) continue;
    data[i * 4 + 3] = 0;
  }

  ctx.putImageData(image, 0, 0);
}
