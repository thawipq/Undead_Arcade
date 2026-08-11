import { FRAME_H, FRAME_W } from './soldierAnim.js';

const ZOMBIE_SPEED_MIN = 45;
const ZOMBIE_SPEED_MAX = 75;
const ZOMBIE_MAX = 28;
/** How far ahead walkers lead the player's movement (seconds). */
const WALKER_LEAD_SEC = 0.7;
/** Keep rushers from stacking on the same pixel. */
const WALKER_SEP_RADIUS = 64;
const WALKER_SEP_STRENGTH = 110;
export const ZOMBIE_MAX_HP = 3;
export const SHOOTER_MAX_HP = 2;
export const BOSS_MAX_HP = 70;
const HEALTH_BAR_WIDTH = 42;
const HEALTH_BAR_HEIGHT = 5;
const HEALTH_BAR_Y_OFFSET = 58;
const BOSS_HEALTH_BAR_WIDTH = 120;
const SPAWN_INTERVAL_START = 2800;
const SPAWN_INTERVAL_MIN = 1200;
const SPAWN_SPEEDUP_PER_SEC = 12;

const SHEET_COLS = 4;
const SHEET_ROWS = 2;
const SRC_FRAME_W = 688;
const SRC_FRAME_H = 768;

export const ZOMBIE_TYPE_WALKER = 'walker';
export const ZOMBIE_TYPE_SHOOTER = 'shooter';
export const ZOMBIE_TYPE_BOSS = 'boss';
export const ZOMBIE_TYPE_BOMBER = 'bomber';
export const ZOMBIE_TYPE_SPITTER = 'spitter';
export const ZOMBIE_TYPE_CRAWLER = 'crawler';

/** Shooters unlock after this much run time. */
export const SHOOTER_UNLOCK_MS = 40_000;
export const SHOOTER_SPAWN_INTERVAL_MS = 6000;
export const MAX_SHOOTERS_ALIVE = 3;
/** Level 2+: spitters replace bone throwers. */
export const MAX_SPITTERS_ALIVE = 2;
export const MAX_BOMBERS_ALIVE = 1;
export const SPITTER_UNLOCK_MS = 18_000;
export const SPITTER_SPAWN_INTERVAL_MS = 9_000;
export const SHOOTER_FIRE_RATE_MS = 1700;
export const SHOOTER_BULLET_SPEED = 260;
export const SHOOTER_SPEED_MIN = 28;
export const SHOOTER_SPEED_MAX = 42;
export const SHOOTER_IDEAL_RANGE = 320;
export const SHOOTER_STOP_RANGE = 260;

/** Acid spitters (Level 2+ ranged). */
export const SPITTER_MAX_HP = 3;
export const SPITTER_SPEED_MIN = 32;
export const SPITTER_SPEED_MAX = 48;
export const SPITTER_FIRE_RATE_MS = 3200;
export const SPITTER_BULLET_SPEED = 300;
export const SPITTER_IDEAL_RANGE = 420;
export const SPITTER_STOP_RANGE = 300;
/** Slightly smaller than walkers. */
export const SPITTER_SCALE = 0.28;
export const ACID_PUDDLE_RADIUS = 52;
export const ACID_PUDDLE_DURATION_MS = 4200;
export const ACID_PUDDLE_TICK_MS = 450;

/** Level 2+ exploding rushers. */
export const BOMBER_MAX_HP = 7;
export const BOMBER_SPEED_MIN = 120;
export const BOMBER_SPEED_MAX = 150;
export const BOMBER_BLAST_RADIUS = 118;
/** Auto-detonate when the player enters this range (inside blast so damage lands). */
export const BOMBER_TRIGGER_RADIUS = 78;
/** Slightly smaller than walkers — fat silhouette still reads. */
export const BOMBER_SCALE = 0.29;
/** Chance a Level 2+ walker slot becomes a bomber (higher early). */
export const BOMBER_SPAWN_CHANCE = 0.22;
export const BOMBER_SPAWN_CHANCE_EARLY = 0.32;
export const BOMBER_EARLY_WINDOW_MS = 25_000;

/** Level 2+ low/fast crawlers. */
export const CRAWLER_MAX_HP = 2;
export const CRAWLER_SPEED_MIN = 155;
export const CRAWLER_SPEED_MAX = 190;
export const CRAWLER_SCALE = 0.26;
/** Baked-frame hitbox — taller so close-range shots still register. */
const CRAWLER_BODY_W = 210;
const CRAWLER_BODY_H = 150;
const CRAWLER_BODY_OFFSET_X = 67;
const CRAWLER_BODY_OFFSET_Y = 128;
/** Stop stacking on the player so the gun tip isn't past the hitbox. */
export const CRAWLER_HOLD_RANGE = 62;
export const CRAWLER_SPAWN_CHANCE = 0.4;
export const CRAWLER_UNLOCK_MS = 8_000;
export const MAX_CRAWLERS_ALIVE = 4;
/** Soft cap so L2 isn't a walker flood before the 2:00 clear. */
export const MAX_WALKERS_ALIVE_L2 = 7;

/** After this, normal/shooter spawns stop so the arena can be cleared. */
export const SPAWN_STOP_MS = 60_000;
/** Boss appears after the cleanup window. */
export const BOSS_UNLOCK_MS = 90_000;
/** Level 2+ gets a longer arena before the boss. */
export const SPAWN_STOP_MS_L2 = 120_000;
export const BOSS_UNLOCK_MS_L2 = 150_000;
// Boss art is baked at native cell size (688×256) with the body ~231px tall,
// so this scale puts him at roughly 2.2× the soldier's on-screen height.
export const BOSS_SCALE = 0.92;
// Fallback sheet is a recolored walker on the 344×384 grid.
const BOSS_FALLBACK_SCALE = 0.62;
// Keep chase a bit under player speed (GameScene PLAYER_SPEED = 155).
export const BOSS_SPEED_MIN = 115;
export const BOSS_SPEED_MAX = 130;
export const BOSS_FIRE_RATE_MIN_MS = 4500;
export const BOSS_FIRE_RATE_MAX_MS = 6500;
/** Readable boss loop: telegraph → charge → recover → chase/throw. */
export const BOSS_CHARGE_INTERVAL_MS = 5_500;
export const BOSS_TELEGRAPH_MS = 500;
export const BOSS_CHARGE_DURATION_MS = 950;
export const BOSS_RECOVER_MS = 380;
export const BOSS_CHARGE_SPEED = 400;
export const BOSS_THROW_DURATION_MS = 360;

// Match current player scale (GameScene PLAYER_SCALE). Rollback: 0.28
export const ZOMBIE_SCALE = 0.31;
export const ZOMBIE_TEXTURE_KEY = 'zombie';
export const ZOMBIE_SRC_KEY = 'zombie-sheet-src';
export const ZOMBIE_SHEET_PATH = 'assets/zombie/Zombie1.png';
export const ZOMBIE_WALK_RIGHT = 'zombie-walk-right';

export const SHOOTER_TEXTURE_KEY = 'zombie-shooter';
export const SHOOTER_SRC_KEY = 'zombie-shooter-sheet-src';
export const SHOOTER_SHEET_PATH = 'assets/zombie/Zombie2.png';
export const SHOOTER_WALK_RIGHT = 'zombie-shooter-walk-right';

export const BOMBER_TEXTURE_KEY = 'zombie-bomber';
export const BOMBER_SRC_KEY = 'zombie-bomber-sheet-src';
export const BOMBER_SHEET_PATH = 'assets/zombie/Exploder.png?v=2';
export const BOMBER_WALK_RIGHT = 'zombie-bomber-walk-right';

export const SPITTER_TEXTURE_KEY = 'zombie-spitter';
export const SPITTER_SRC_KEY = 'zombie-spitter-sheet-src';
export const SPITTER_SHEET_PATH = 'assets/zombie/Acid_spitter.png?v=2';
export const SPITTER_WALK_RIGHT = 'zombie-spitter-walk-right';

export const CRAWLER_TEXTURE_KEY = 'zombie-crawler';
export const CRAWLER_SRC_KEY = 'zombie-crawler-sheet-src';
/** Custom crawl sheet (right-facing frames; left row is mirrored at bake). */
export const CRAWLER_SHEET_PATH = 'assets/zombie/crawler.png?v=5';
export const CRAWLER_WALK_RIGHT = 'zombie-crawler-walk-right';

export const BOSS_TEXTURE_KEY = 'zombie-boss';
export const BOSS_SRC_KEY = 'zombie-boss-sheet-src';
export const BOSS_SHEET_PATH = 'assets/zombie/Boss1.png';
export const BOSS_WALK_RIGHT = 'zombie-boss-walk-right';
export const BOSS_CHARGE_ANIM = 'zombie-boss-charge';
export const BOSS_THROW_ANIM = 'zombie-boss-throw';

/** Level 2 Acid Broodmother. */
export const BOSS2_TEXTURE_KEY = 'zombie-boss-2';
export const BOSS2_SRC_KEY = 'zombie-boss-2-sheet-src';
export const BOSS2_SHEET_PATH = 'assets/zombie/boss2.png?v=3';
export const BOSS2_WALK = 'zombie-boss2-walk';
export const BOSS2_SPIT_ANIM = 'zombie-boss2-spit';
export const BOSS2_BIRTH_ANIM = 'zombie-boss2-birth';
export const BOSS2_BURROW_ANIM = 'zombie-boss2-burrow';
export const BOSS2_EMERGE_ANIM = 'zombie-boss2-emerge';
export const BOSS2_MAX_HP = 95;
export const BOSS2_SPEED_MIN = 95;
export const BOSS2_SPEED_MAX = 115;
export const BOSS2_SPIT_INTERVAL_MIN_MS = 7_000;
export const BOSS2_SPIT_INTERVAL_MAX_MS = 9_500;
export const BOSS2_BIRTH_INTERVAL_MS = 10_000;
export const BOSS2_BURROW_INTERVAL_MS = 5_500;
/** Burrow only when the player is at least this far (closing tool). */
export const BOSS2_BURROW_RANGE = 310;
/** Don't birth crawlers when the player is this close (keeps boss shootable). */
export const BOSS2_BIRTH_MIN_RANGE = 280;
export const BOSS2_BURROW_UNDER_MS = 650;
export const BOSS2_EMERGE_MS = 480;
export const BOSS2_BIRTH_MS = 780;
export const BOSS2_SPIT_MS = 720;
export const BOSS2_BIRTH_COUNT = 2;
export const BOSS2_EMERGE_TELEGRAPH_RADIUS = 56;
/** Set false to disable thrown-exploder without reverting other Boss2 work. */
export const BOSS2_ENABLE_EXPLODER_THROW = true;
export const BOSS2_THROW_BOMBER_INTERVAL_MS = 13_000;
export const BOSS2_THROW_WINDUP_MS = 420;
export const BOSS2_THROW_FLIGHT_MS = 780;
export const BOSS2_THROW_LAND_RADIUS = 42;
/** Min gap between exploder throw and crawler birth (either order). */
export const BOSS2_SPAWN_ATTACK_GAP_MS = 4000;
export const BOSS_KIND_CHARGER = 'charger';
export const BOSS_KIND_BROODMOTHER = 'broodmother';

// Boss1.png is 2752×1536 laid out as 4×6 cells of 688×256.
// Row 0 idle, 1 walk, 2-3 bone throw, 4 leap/slam, 5 lunge.
const BOSS_SHEET_COLS = 4;
const BOSS_SHEET_ROWS = 6;
// Baked 1:1 from the source cells so the boss is never squashed.
const BOSS_FRAME_W = 688;
const BOSS_FRAME_H = 256;
// Body occupies roughly x 248-430, y 20-250 inside a cell.
const BOSS_BODY_W = 110;
const BOSS_BODY_H = 190;
const BOSS_FEET_Y = 250;

export function preloadZombieSheet(scene) {
  if (!scene.textures.exists(ZOMBIE_SRC_KEY)) {
    scene.load.image(ZOMBIE_SRC_KEY, ZOMBIE_SHEET_PATH);
  }
  // Optional until you upload it — missing file is fine.
  if (!scene.textures.exists(SHOOTER_SRC_KEY)) {
    scene.load.image(SHOOTER_SRC_KEY, SHOOTER_SHEET_PATH);
  }
  if (!scene.textures.exists(BOMBER_SRC_KEY)) {
    scene.load.image(BOMBER_SRC_KEY, BOMBER_SHEET_PATH);
  }
  if (!scene.textures.exists(SPITTER_SRC_KEY)) {
    scene.load.image(SPITTER_SRC_KEY, SPITTER_SHEET_PATH);
  }
  if (!scene.textures.exists(CRAWLER_SRC_KEY)) {
    scene.load.image(CRAWLER_SRC_KEY, CRAWLER_SHEET_PATH);
  }
  if (!scene.textures.exists(BOSS_SRC_KEY)) {
    scene.load.image(BOSS_SRC_KEY, BOSS_SHEET_PATH);
  }
  if (!scene.textures.exists(BOSS2_SRC_KEY)) {
    scene.load.image(BOSS2_SRC_KEY, BOSS2_SHEET_PATH);
  }
}

export function buildZombieSheet(scene) {
  // Keep walker source until every tinted fallback that needs it is baked.
  bakeSheet(scene, {
    srcKey: ZOMBIE_SRC_KEY,
    textureKey: ZOMBIE_TEXTURE_KEY,
    animKey: ZOMBIE_WALK_RIGHT,
    required: true,
    disposeSource: false,
  });

  const hasShooterArt = scene.textures.exists(SHOOTER_SRC_KEY);
  bakeSheet(scene, {
    srcKey: hasShooterArt ? SHOOTER_SRC_KEY : ZOMBIE_SRC_KEY,
    textureKey: SHOOTER_TEXTURE_KEY,
    animKey: SHOOTER_WALK_RIGHT,
    required: false,
    // Temporary look until Zombie2.png is uploaded.
    tintFallback: hasShooterArt ? null : { r: 1.15, g: 0.75, b: 1.25 },
    disposeSource: hasShooterArt,
  });

  // Exploding variant — custom sheet if present, else volatile orange recolor.
  const hasBomberArt = scene.textures.exists(BOMBER_SRC_KEY);
  bakeSheet(scene, {
    srcKey: hasBomberArt ? BOMBER_SRC_KEY : ZOMBIE_SRC_KEY,
    textureKey: BOMBER_TEXTURE_KEY,
    animKey: BOMBER_WALK_RIGHT,
    required: false,
    tintFallback: hasBomberArt ? null : { r: 1.45, g: 0.55, b: 0.35 },
    disposeSource: hasBomberArt,
  });

  // Acid spitter — custom sheet if present, else toxic-green recolor.
  const hasSpitterArt = scene.textures.exists(SPITTER_SRC_KEY);
  bakeSheet(scene, {
    srcKey: hasSpitterArt ? SPITTER_SRC_KEY : ZOMBIE_SRC_KEY,
    textureKey: SPITTER_TEXTURE_KEY,
    animKey: SPITTER_WALK_RIGHT,
    required: false,
    tintFallback: hasSpitterArt ? null : { r: 0.55, g: 1.35, b: 0.45 },
    disposeSource: hasSpitterArt,
  });

  // Crawler — custom sheet when present, else purple-tinted walker.
  // Source often only has right-facing crawls; bake mirrors them into the left row.
  const hasCrawlerArt = scene.textures.exists(CRAWLER_SRC_KEY);
  if (hasCrawlerArt) {
    bakeCrawlerSheet(scene);
  } else {
    bakeSheet(scene, {
      srcKey: ZOMBIE_SRC_KEY,
      textureKey: CRAWLER_TEXTURE_KEY,
      animKey: CRAWLER_WALK_RIGHT,
      required: false,
      tintFallback: { r: 0.55, g: 0.45, b: 0.75 },
      disposeSource: false,
    });
  }

  if (scene.textures.exists(BOSS_SRC_KEY)) {
    bakeBossSheet(scene, {
      srcKey: BOSS_SRC_KEY,
      textureKey: BOSS_TEXTURE_KEY,
      walkKey: BOSS_WALK_RIGHT,
      throwKey: BOSS_THROW_ANIM,
      chargeKey: BOSS_CHARGE_ANIM,
      // Boss1: walk from lunge row; throw row 2; charge row 5.
      walkFrames: [20, 21],
      throwRow: 2,
      chargeRow: 5,
    });
  } else {
    bakeSheet(scene, {
      srcKey: ZOMBIE_SRC_KEY,
      textureKey: BOSS_TEXTURE_KEY,
      animKey: BOSS_WALK_RIGHT,
      required: false,
      tintFallback: { r: 1.35, g: 0.55, b: 0.55 },
      disposeSource: false,
    });
  }

  if (scene.textures.exists(BOSS2_SRC_KEY)) {
    bakeBossSheet(scene, {
      srcKey: BOSS2_SRC_KEY,
      textureKey: BOSS2_TEXTURE_KEY,
      walkKey: BOSS2_WALK,
      throwKey: BOSS2_SPIT_ANIM,
      chargeKey: BOSS2_EMERGE_ANIM,
      // Boss2: row1 walk, row2 spit, row3 birth, row4 burrow, row5 emerge.
      // Idle+walk rows are subtle — use both for a longer chase cycle.
      walkFrames: [0, 1, 2, 3, 4, 5, 6, 7],
      throwRow: 2,
      chargeRow: 5,
      stripGreyPad: true,
      extraAnims: [
        { key: BOSS2_BIRTH_ANIM, sheetRow: 3, frameRate: 9, repeat: 0 },
        { key: BOSS2_BURROW_ANIM, sheetRow: 4, frameRate: 9, repeat: 0 },
      ],
    });
  }

  if (scene.textures.exists(ZOMBIE_SRC_KEY)) {
    scene.textures.remove(ZOMBIE_SRC_KEY);
  }
}

/**
 * Crawler sheets from Sorceress often ship all frames facing right.
 * Bake row 0 from the best right-facing crawl cells, then mirror into row 1.
 * Game anim uses frames 0–3 + flipX; mirrored row keeps the sheet consistent.
 */
function bakeCrawlerSheet(scene) {
  const source = scene.textures.get(CRAWLER_SRC_KEY).getSourceImage();
  const cols = SHEET_COLS;
  const rows = SHEET_ROWS;
  const srcFrameW = Math.floor(source.width / cols) || SRC_FRAME_W;
  const srcFrameH = Math.floor(source.height / rows) || SRC_FRAME_H;

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * cols;
  canvas.height = FRAME_H * rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  const tmp = document.createElement('canvas');
  tmp.width = FRAME_W;
  tmp.height = FRAME_H;
  const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });
  tmpCtx.imageSmoothingEnabled = false;

  const flip = document.createElement('canvas');
  flip.width = FRAME_W;
  flip.height = FRAME_H;
  const flipCtx = flip.getContext('2d', { willReadFrequently: true });
  flipCtx.imageSmoothingEnabled = false;

  for (let col = 0; col < cols; col += 1) {
    // Prefer top-row crawl; if empty, fall back to bottom-row source cell.
    let srcRow = 0;
    tmpCtx.clearRect(0, 0, FRAME_W, FRAME_H);
    tmpCtx.drawImage(
      source,
      col * srcFrameW,
      srcRow * srcFrameH,
      srcFrameW,
      srcFrameH,
      0,
      0,
      FRAME_W,
      FRAME_H,
    );
    if (frameOpaqueRatio(tmpCtx, FRAME_W, FRAME_H) < 0.02) {
      srcRow = 1;
      tmpCtx.clearRect(0, 0, FRAME_W, FRAME_H);
      tmpCtx.drawImage(
        source,
        col * srcFrameW,
        srcRow * srcFrameH,
        srcFrameW,
        srcFrameH,
        0,
        0,
        FRAME_W,
        FRAME_H,
      );
    }

    // Strip flat grey pad before clearing the cell border (border clear
    // zeros corner samples and broke backdrop matching).
    removeFlatGreyBackdrop(tmpCtx, FRAME_W, FRAME_H);
    removeBlackCellBorder(tmpCtx, FRAME_W, FRAME_H);
    punchUpCrawlerPixels(tmpCtx, FRAME_W, FRAME_H);
    ctx.drawImage(tmp, col * FRAME_W, 0);

    // Mirrored left-facing cell for bottom row.
    flipCtx.clearRect(0, 0, FRAME_W, FRAME_H);
    flipCtx.save();
    flipCtx.translate(FRAME_W, 0);
    flipCtx.scale(-1, 1);
    flipCtx.drawImage(tmp, 0, 0);
    flipCtx.restore();
    ctx.drawImage(flip, col * FRAME_W, FRAME_H);
  }

  if (scene.textures.exists(CRAWLER_TEXTURE_KEY)) {
    scene.textures.remove(CRAWLER_TEXTURE_KEY);
  }
  scene.textures.addSpriteSheet(CRAWLER_TEXTURE_KEY, canvas, {
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
  });
  scene.textures.get(CRAWLER_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
  createWalkAnim(scene, CRAWLER_TEXTURE_KEY, CRAWLER_WALK_RIGHT, 0, 3);

  if (scene.textures.exists(CRAWLER_SRC_KEY)) {
    scene.textures.remove(CRAWLER_SRC_KEY);
  }
  return true;
}

function frameOpaqueRatio(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 20) opaque += 1;
  }
  return opaque / (width * height);
}

/** Kill soft AA fringes so crawlers don't look washed out / ghostly. */
function solidifySpriteAlpha(ctx, width, height, threshold = 48) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = data[i + 3] > threshold ? 255 : 0;
  }
  ctx.putImageData(image, 0, 0);
}

/** Slight contrast + denser alpha so muted grey-green skin reads solid in-game. */
function punchUpCrawlerPixels(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) {
      data[i + 3] = 0;
      continue;
    }
    // Force full opacity on any kept pixel.
    data[i + 3] = 255;
    // Mild contrast so body doesn't look washed into the map.
    for (let c = 0; c < 3; c += 1) {
      const v = data[i + c];
      data[i + c] = Math.max(0, Math.min(255, Math.round((v - 128) * 1.18 + 128)));
    }
  }
  ctx.putImageData(image, 0, 0);
}

/**
 * Crawler sheet uses a flat dark-grey fill (~rgb 72–76), not a checkerboard.
 * Sample opaque inset pixels for the fill color, then flood from the border.
 */
/**
 * Boss2 pad is a coarse dual-grey fill (~74 and ~120), which leaves boxy crumbs
 * if only the fine checker flood runs. Flood low-chroma greys from the border,
 * but keep green flesh / neon acid / brown mud.
 */
function removeBossGreyPad(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  const total = width * height;
  const marked = new Uint8Array(total);

  const isPad = (i) => {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a < 28) return true;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    const chroma = max - min;
    // Keep toxic green flesh / acid spray / eyes.
    if (g > r + 10 && g > b + 6) return false;
    if (g > 160 && chroma > 35) return false;
    // Keep brown burrow mud.
    if (r > g + 12 && r > b + 8) return false;
    if (chroma > 18) return false;
    // Dual-grey pad (~74 / ~120). Keep near-black outlines / hair.
    return avg >= 48 && avg <= 150;
  };

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (marked[i] || !isPad(i)) return;
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

  // Grow into leftover pad islands touching cleared pixels.
  let grew = true;
  while (grew) {
    grew = false;
    for (let i = 0; i < total; i += 1) {
      if (marked[i] || !isPad(i)) continue;
      const x = i % width;
      const y = (i / width) | 0;
      let touches = false;
      for (let dy = -1; dy <= 1 && !touches; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (marked[ny * width + nx]) {
            touches = true;
            break;
          }
        }
      }
      if (touches) {
        marked[i] = 1;
        grew = true;
      }
    }
  }

  for (let i = 0; i < total; i += 1) {
    if (!marked[i]) continue;
    data[i * 4 + 3] = 0;
  }
  ctx.putImageData(image, 0, 0);
}

function removeFlatGreyBackdrop(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  const total = width * height;
  const marked = new Uint8Array(total);

  const sample = (x, y) => {
    const o = (y * width + x) * 4;
    return [data[o], data[o + 1], data[o + 2], data[o + 3]];
  };
  // Inset samples only — border may already be cleared by removeBlackCellBorder.
  const probes = [
    [18, 18],
    [width - 19, 18],
    [18, height - 19],
    [width - 19, height - 19],
    [width >> 2, 22],
    [(width * 3) >> 2, 22],
    [22, height >> 2],
    [22, (height * 3) >> 2],
  ];
  const samples = [];
  for (const [x, y] of probes) {
    const [r, g, b, a] = sample(x, y);
    if (a < 200) continue;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    // Backdrop is flat grey; skip if we accidentally hit the body.
    if (chroma > 14) continue;
    samples.push([r, g, b]);
  }
  if (!samples.length) {
    // Fallback: typical Sorceress pad for this sheet.
    samples.push([74, 74, 78]);
  }
  const br = samples.reduce((s, c) => s + c[0], 0) / samples.length;
  const bg = samples.reduce((s, c) => s + c[1], 0) / samples.length;
  const bb = samples.reduce((s, c) => s + c[2], 0) / samples.length;
  const maxDist = 36;

  const isBackdrop = (i) => {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a < 28) return true;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (chroma > 16) return false;
    // Keep greenish flesh / warm cloth even when near-grey.
    if (g > r + 7 && g > b + 4) return false;
    if (r > g + 10 && r > b + 6) return false;
    const dist = Math.hypot(r - br, g - bg, b - bb);
    return dist <= maxDist;
  };

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (marked[i] || !isBackdrop(i)) return;
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
  solidifySpriteAlpha(ctx, width, height, 32);
}

/**
 * The boss cells are wide and short, so slicing them into the 344×384 walker
 * grid squashed him. Bake 1:1 instead and let BOSS_SCALE size him.
 */
function bakeBossSheet(scene, {
  srcKey,
  textureKey,
  walkKey,
  throwKey,
  chargeKey,
  walkFrames = null,
  walkRow = 1,
  throwRow = 2,
  chargeRow = 5,
  stripGreyPad = false,
  extraAnims = [],
}) {
  const source = scene.textures.get(srcKey).getSourceImage();
  const srcFrameW = Math.floor(source.width / BOSS_SHEET_COLS) || BOSS_FRAME_W;
  const srcFrameH = Math.floor(source.height / BOSS_SHEET_ROWS) || BOSS_FRAME_H;

  const canvas = document.createElement('canvas');
  canvas.width = BOSS_FRAME_W * BOSS_SHEET_COLS;
  canvas.height = BOSS_FRAME_H * BOSS_SHEET_ROWS;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  const tmp = document.createElement('canvas');
  tmp.width = BOSS_FRAME_W;
  tmp.height = BOSS_FRAME_H;
  const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });
  tmpCtx.imageSmoothingEnabled = false;

  for (let row = 0; row < BOSS_SHEET_ROWS; row += 1) {
    for (let col = 0; col < BOSS_SHEET_COLS; col += 1) {
      tmpCtx.clearRect(0, 0, BOSS_FRAME_W, BOSS_FRAME_H);
      tmpCtx.drawImage(
        source,
        col * srcFrameW,
        row * srcFrameH,
        srcFrameW,
        srcFrameH,
        0,
        0,
        BOSS_FRAME_W,
        BOSS_FRAME_H,
      );
      removeBlackCellBorder(tmpCtx, BOSS_FRAME_W, BOSS_FRAME_H);
      if (stripGreyPad) {
        // Boss2 uses flat dual-grey pad (~74 / ~120), not a fine checker.
        removeBossGreyPad(tmpCtx, BOSS_FRAME_W, BOSS_FRAME_H);
        // Sorceress leaves solid black grid rules under each cell.
        clearBossGridRules(tmpCtx, BOSS_FRAME_W, BOSS_FRAME_H);
      } else {
        removeCheckerboard(tmpCtx, BOSS_FRAME_W, BOSS_FRAME_H);
      }
      ctx.drawImage(tmp, col * BOSS_FRAME_W, row * BOSS_FRAME_H);
    }
  }

  if (scene.textures.exists(textureKey)) scene.textures.remove(textureKey);
  scene.textures.addSpriteSheet(textureKey, canvas, {
    frameWidth: BOSS_FRAME_W,
    frameHeight: BOSS_FRAME_H,
  });
  scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);

  if (scene.textures.exists(srcKey)) {
    scene.textures.remove(srcKey);
  }

  if (walkFrames) {
    createBossAnim(scene, textureKey, walkKey, {
      frames: walkFrames,
      frameRate: walkFrames.length > 4 ? 9 : 7,
      repeat: -1,
      yoyo: walkFrames.length <= 4,
    });
  } else {
    createBossAnim(scene, textureKey, walkKey, {
      sheetRow: walkRow,
      frameRate: 7,
      repeat: -1,
    });
  }
  createBossAnim(scene, textureKey, throwKey, {
    sheetRow: throwRow,
    frameRate: 10,
    repeat: 0,
  });
  createBossAnim(scene, textureKey, chargeKey, {
    sheetRow: chargeRow,
    frameRate: 10,
    repeat: 0,
  });
  extraAnims.forEach((anim) => {
    createBossAnim(scene, textureKey, anim.key, {
      sheetRow: anim.sheetRow,
      frameRate: anim.frameRate ?? 9,
      repeat: anim.repeat ?? 0,
    });
  });
}

function createBossAnim(scene, textureKey, animKey, {
  sheetRow = null,
  frames = null,
  frameRate = 8,
  repeat = -1,
  yoyo = false,
} = {}) {
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
  if (!scene.textures.exists(textureKey)) return;

  const maxFrame = Math.max(0, scene.textures.get(textureKey).frameTotal - 2);
  let animFrames;
  if (frames) {
    animFrames = frames
      .map((n) => Math.min(Math.max(0, n), maxFrame))
      .map((frame) => ({ key: textureKey, frame }));
  } else {
    const start = Math.min((sheetRow ?? 0) * BOSS_SHEET_COLS, maxFrame);
    const end = Math.min(start + BOSS_SHEET_COLS - 1, maxFrame);
    animFrames = scene.anims.generateFrameNumbers(textureKey, { start, end });
  }

  scene.anims.create({
    key: animKey,
    frames: animFrames,
    frameRate,
    repeat,
    yoyo,
  });
}

function sceneHasBomberTexture(scene) {
  return !!scene?.textures?.exists(BOMBER_TEXTURE_KEY);
}

function launchBroodmotherBomberThrow(zombie, player) {
  const scene = zombie.scene;
  const group = scene?.zombies;
  if (!scene?.add || !group || !sceneHasBomberTexture(scene)) return;
  if (countActiveZombies(group, ZOMBIE_TYPE_BOMBER) >= MAX_BOMBERS_ALIVE) return;

  clearBroodmotherBomberThrow(zombie);

  const dir = zombie.facing === 'left' ? -1 : 1;
  const sx = zombie.x + dir * Math.min(55, zombie.displayWidth * 0.18);
  const sy = zombie.y - zombie.displayHeight * 0.12;

  const offset = 50 + Math.random() * 70;
  const a = Math.random() * Math.PI * 2;
  const bounds = scene.physics?.world?.bounds;
  let lx = player.x + Math.cos(a) * offset;
  let ly = player.y + Math.sin(a) * offset;
  if (bounds) {
    lx = Phaser.Math.Clamp(lx, bounds.x + 40, bounds.right - 40);
    ly = Phaser.Math.Clamp(ly, bounds.y + 40, bounds.bottom - 40);
  }

  const marker = scene.add
    .circle(lx, ly, BOSS2_THROW_LAND_RADIUS, 0xff3a1a, 0.22)
    .setDepth(4);
  marker.setStrokeStyle(2, 0xff7755, 0.9);
  scene.tweens.add({
    targets: marker,
    scale: 1.12,
    alpha: 0.4,
    duration: 280,
    yoyo: true,
    repeat: -1,
  });

  const flyer = scene.add.sprite(sx, sy, BOMBER_TEXTURE_KEY, 0);
  flyer.setDepth(16);
  flyer.setScale(BOMBER_SCALE * 0.95);
  flyer.setTint(0xffaa88);
  if (scene.anims.exists(BOMBER_WALK_RIGHT)) {
    flyer.anims.play(BOMBER_WALK_RIGHT, true);
  }

  const flight = { t: 0 };
  const tween = scene.tweens.add({
    targets: flight,
    t: 1,
    duration: BOSS2_THROW_FLIGHT_MS,
    ease: 'Sine.easeIn',
    onUpdate: () => {
      const t = flight.t;
      flyer.x = sx + (lx - sx) * t;
      flyer.y = sy + (ly - sy) * t - Math.sin(t * Math.PI) * 150;
      flyer.rotation = t * Math.PI * 2.2 * dir;
    },
    onComplete: () => {
      clearBroodmotherBomberThrow(zombie);
      const bomber = spawnZombie(scene, group, ZOMBIE_TYPE_BOMBER);
      if (!bomber) return;
      bomber.setPosition(lx, ly);
      bomber.setTint(0xff6644);
      scene.time.delayedCall(220, () => {
        if (bomber.active) bomber.clearTint();
      });
      // Brief arming flash so the landed throw reads.
      scene.cameras?.main?.shake(80, 0.0025);
    },
  });

  zombie.bomberThrowFx = { flyer, marker, tween };
}

function clearBroodmotherBomberThrow(zombie) {
  const fx = zombie.bomberThrowFx;
  if (!fx) return;
  fx.tween?.stop();
  zombie.scene?.tweens?.killTweensOf(fx.marker);
  fx.flyer?.destroy();
  fx.marker?.destroy();
  zombie.bomberThrowFx = null;
}

function pickBroodmotherEmergePoint(zombie, player) {
  const offset = 90 + Math.random() * 70;
  const a = Math.random() * Math.PI * 2;
  const bounds = zombie.scene?.physics?.world?.bounds;
  let nx = player.x + Math.cos(a) * offset;
  let ny = player.y + Math.sin(a) * offset;
  if (bounds) {
    nx = Phaser.Math.Clamp(nx, bounds.x + 40, bounds.right - 40);
    ny = Phaser.Math.Clamp(ny, bounds.y + 40, bounds.bottom - 40);
  }
  return { x: nx, y: ny };
}

function showBroodmotherEmergeTelegraph(zombie, x, y) {
  clearBroodmotherEmergeTelegraph(zombie);
  const scene = zombie.scene;
  if (!scene?.add) return;

  const radius = BOSS2_EMERGE_TELEGRAPH_RADIUS;
  const fill = scene.add.circle(x, y, radius, 0xff1a1a, 0.28).setDepth(4);
  const ring = scene.add.circle(x, y, radius, 0xff1a1a, 0).setDepth(5);
  ring.setStrokeStyle(3, 0xff5555, 0.95);

  scene.tweens.add({
    targets: [fill, ring],
    scale: 1.18,
    alpha: 0.55,
    duration: 320,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  zombie.burrowTelegraph = { fill, ring };
}

function clearBroodmotherEmergeTelegraph(zombie) {
  const fx = zombie.burrowTelegraph;
  if (!fx) return;
  zombie.scene?.tweens?.killTweensOf(fx.fill);
  zombie.scene?.tweens?.killTweensOf(fx.ring);
  fx.fill?.destroy();
  fx.ring?.destroy();
  zombie.burrowTelegraph = null;
}

function faceBoss(zombie, dx) {
  // Boss1 art faces right in every usable row — mirror for left.
  if (dx < -8) zombie.facing = 'left';
  else if (dx > 8) zombie.facing = 'right';
  zombie.setFlipX(zombie.facing === 'left');
}

function bakeSheet(scene, {
  srcKey,
  textureKey,
  animKey,
  required,
  tintFallback = null,
  cols = SHEET_COLS,
  rows = SHEET_ROWS,
  animStart = 0,
  animEnd = 3,
  disposeSource = true,
}) {
  if (!scene.textures.exists(srcKey)) {
    if (required) {
      createPlaceholderZombieTexture(scene, textureKey);
      createWalkAnim(scene, textureKey, animKey, 0, 0);
    } else if (scene.textures.exists(ZOMBIE_TEXTURE_KEY)) {
      // Clone walker sheet as shooter fallback.
      cloneTextureAsSheet(scene, ZOMBIE_TEXTURE_KEY, textureKey, tintFallback);
      createWalkAnim(scene, textureKey, animKey, 0, 3);
    } else {
      createPlaceholderZombieTexture(scene, textureKey);
      createWalkAnim(scene, textureKey, animKey, 0, 0);
    }
    return false;
  }

  const source = scene.textures.get(srcKey).getSourceImage();
  const srcFrameW = Math.floor(source.width / cols) || SRC_FRAME_W;
  const srcFrameH = Math.floor(source.height / rows) || SRC_FRAME_H;

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * cols;
  canvas.height = FRAME_H * rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  const tmp = document.createElement('canvas');
  tmp.width = FRAME_W;
  tmp.height = FRAME_H;
  const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });
  tmpCtx.imageSmoothingEnabled = false;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
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
      if (tintFallback) applyTint(tmpCtx, FRAME_W, FRAME_H, tintFallback);
      ctx.drawImage(tmp, col * FRAME_W, row * FRAME_H);
    }
  }

  if (scene.textures.exists(textureKey)) {
    scene.textures.remove(textureKey);
  }
  scene.textures.addSpriteSheet(textureKey, canvas, {
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
  });
  scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
  createWalkAnim(scene, textureKey, animKey, animStart, animEnd);
  // Drop the full-res source after baking so maps / other sheets can stay on GPU.
  if (disposeSource && srcKey !== textureKey && scene.textures.exists(srcKey)) {
    scene.textures.remove(srcKey);
  }
  return true;
}

function cloneTextureAsSheet(scene, fromKey, toKey, tintFallback) {
  const from = scene.textures.get(fromKey).getSourceImage();
  const canvas = document.createElement('canvas');
  canvas.width = from.width;
  canvas.height = from.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(from, 0, 0);
  if (tintFallback) applyTint(ctx, canvas.width, canvas.height, tintFallback);

  if (scene.textures.exists(toKey)) scene.textures.remove(toKey);
  scene.textures.addSpriteSheet(toKey, canvas, {
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
  });
  scene.textures.get(toKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function applyTint(ctx, width, height, tint) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    data[i] = Math.min(255, data[i] * tint.r);
    data[i + 1] = Math.min(255, data[i + 1] * tint.g);
    data[i + 2] = Math.min(255, data[i + 2] * tint.b);
  }
  ctx.putImageData(image, 0, 0);
}

function createPlaceholderZombieTexture(scene, textureKey = ZOMBIE_TEXTURE_KEY) {
  if (scene.textures.exists(textureKey)) {
    scene.textures.remove(textureKey);
  }

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const cx = FRAME_W / 2;
  g.fillStyle(0x3a5a2a, 1);
  g.fillRoundedRect(cx - 55, 155, 110, 150, 18);
  g.fillStyle(0x6a8a3a, 1);
  g.fillCircle(cx, 118, 48);
  g.generateTexture(textureKey, FRAME_W, FRAME_H);
  g.destroy();
}

function createWalkAnim(scene, textureKey, animKey, start = 0, end = 3) {
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey);

  const maxFrame = scene.textures.exists(textureKey)
    ? Math.max(0, scene.textures.get(textureKey).frameTotal - 2)
    : 0;
  const safeStart = Phaser.Math.Clamp(start, 0, maxFrame);
  const safeEnd = Phaser.Math.Clamp(end, safeStart, maxFrame);

  scene.anims.create({
    key: animKey,
    frames: scene.anims.generateFrameNumbers(textureKey, {
      start: safeStart,
      end: safeEnd,
    }),
    frameRate: 8,
    repeat: -1,
  });
}

export function createZombieGroup(scene) {
  return scene.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    maxSize: ZOMBIE_MAX,
    runChildUpdate: false,
  });
}

/** Spawn just outside the current camera view, clamped to the world. */
export function randomCameraBorderPoint(camera, worldBounds, margin = 48) {
  const left = camera.worldView.x;
  const top = camera.worldView.y;
  const right = left + camera.worldView.width;
  const bottom = top + camera.worldView.height;
  const side = Phaser.Math.Between(0, 3);

  let x;
  let y;
  if (side === 0) {
    x = Phaser.Math.Between(left, right);
    y = top - margin;
  } else if (side === 1) {
    x = Phaser.Math.Between(left, right);
    y = bottom + margin;
  } else if (side === 2) {
    x = left - margin;
    y = Phaser.Math.Between(top, bottom);
  } else {
    x = right + margin;
    y = Phaser.Math.Between(top, bottom);
  }

  return {
    x: Phaser.Math.Clamp(x, worldBounds.x, worldBounds.right),
    y: Phaser.Math.Clamp(y, worldBounds.y, worldBounds.bottom),
  };
}

export function spawnIntervalForElapsed(elapsedMs, level = 1) {
  const t = elapsedMs / 1000;
  let interval = Math.max(
    SPAWN_INTERVAL_MIN,
    SPAWN_INTERVAL_START - t * SPAWN_SPEEDUP_PER_SEC,
  );
  if (level >= 2) {
    // Longer L2 arena — keep pressure varied, not a walker carpet.
    interval *= 1.55;
    if (elapsedMs >= SPITTER_UNLOCK_MS) interval *= 1.2;
  } else if (elapsedMs >= SHOOTER_UNLOCK_MS) {
    // Once bone-throwers are in play, slow walker waves so the map stays readable.
    interval *= 1.35;
  }
  return interval;
}

/** Extra zombies per spawn wave as time goes on. */
export function spawnCountForElapsed(elapsedMs) {
  const t = elapsedMs / 1000;
  if (t > 180) return 2;
  return 1;
}

export function countActiveZombies(group, type) {
  let count = 0;
  group.children.each((zombie) => {
    if (!zombie.active) return;
    if (type != null && zombie.zombieType !== type) return;
    count += 1;
  });
  return count;
}

export function spawnZombie(scene, group, type = ZOMBIE_TYPE_WALKER) {
  const isShooter = type === ZOMBIE_TYPE_SHOOTER;
  const isBoss = type === ZOMBIE_TYPE_BOSS;
  const isBomber = type === ZOMBIE_TYPE_BOMBER;
  const isSpitter = type === ZOMBIE_TYPE_SPITTER;
  const isCrawler = type === ZOMBIE_TYPE_CRAWLER;

  if (isShooter && countActiveZombies(group, ZOMBIE_TYPE_SHOOTER) >= MAX_SHOOTERS_ALIVE) {
    return null;
  }
  if (isSpitter && countActiveZombies(group, ZOMBIE_TYPE_SPITTER) >= MAX_SPITTERS_ALIVE) {
    return null;
  }
  if (isBomber && countActiveZombies(group, ZOMBIE_TYPE_BOMBER) >= MAX_BOMBERS_ALIVE) {
    return null;
  }
  if (isCrawler && countActiveZombies(group, ZOMBIE_TYPE_CRAWLER) >= MAX_CRAWLERS_ALIVE) {
    return null;
  }
  if (isBoss && countActiveZombies(group, ZOMBIE_TYPE_BOSS) >= 1) {
    return null;
  }

  const level = scene.level || 1;
  const useBroodmother =
    isBoss && level >= 2 && scene.textures.exists(BOSS2_TEXTURE_KEY);
  const bossKind = isBoss
    ? useBroodmother
      ? BOSS_KIND_BROODMOTHER
      : BOSS_KIND_CHARGER
    : null;

  const textureKey = isBoss
    ? useBroodmother
      ? BOSS2_TEXTURE_KEY
      : BOSS_TEXTURE_KEY
    : isShooter
      ? SHOOTER_TEXTURE_KEY
      : isSpitter
        ? SPITTER_TEXTURE_KEY
        : isBomber
          ? BOMBER_TEXTURE_KEY
          : isCrawler
            ? CRAWLER_TEXTURE_KEY
            : ZOMBIE_TEXTURE_KEY;
  const animKey = isBoss
    ? useBroodmother
      ? BOSS2_WALK
      : BOSS_WALK_RIGHT
    : isShooter
      ? SHOOTER_WALK_RIGHT
      : isSpitter
        ? SPITTER_WALK_RIGHT
        : isBomber
          ? BOMBER_WALK_RIGHT
          : isCrawler
            ? CRAWLER_WALK_RIGHT
            : ZOMBIE_WALK_RIGHT;

  if (!scene.textures.exists(textureKey)) return null;

  const point = randomCameraBorderPoint(scene.cameras.main, scene.physics.world.bounds);
  const zombie = group.get(point.x, point.y, textureKey, 0);
  if (!zombie) return null;

  zombie.setActive(true);
  zombie.setVisible(true);
  zombie.setAlpha(1);
  zombie.setDepth(isBoss ? 11 : isCrawler ? 7 : 8);
  // Pooled sprites may still carry another type's sheet; set it before sizing.
  zombie.anims?.stop();
  zombie.setTexture(textureKey, 0);
  const bossNativeSheet = isBoss && zombie.frame.width === BOSS_FRAME_W;
  const scale = isBoss
    ? bossNativeSheet
      ? BOSS_SCALE
      : BOSS_FALLBACK_SCALE
    : isBomber
      ? BOMBER_SCALE
      : isSpitter
        ? SPITTER_SCALE
        : isCrawler
          ? CRAWLER_SCALE
          : ZOMBIE_SCALE;
  zombie.setScale(scale);
  zombie.body.enable = true;
  zombie.body.moves = true;
  zombie.body.setAllowGravity(false);
  zombie.body.setImmovable(false);
  zombie.body.setDrag(0);
  zombie.body.setMaxVelocity(600, 600);
  if (bossNativeSheet) {
    zombie.body.setSize(BOSS_BODY_W, BOSS_BODY_H);
    zombie.body.setOffset((BOSS_FRAME_W - BOSS_BODY_W) / 2, BOSS_FEET_Y - BOSS_BODY_H);
  } else if (isCrawler) {
    zombie.body.setSize(CRAWLER_BODY_W, CRAWLER_BODY_H);
    zombie.body.setOffset(CRAWLER_BODY_OFFSET_X, CRAWLER_BODY_OFFSET_Y);
  } else {
    zombie.body.setSize(90, 170);
    zombie.body.setOffset(127, 120);
  }
  zombie.setCollideWorldBounds(false);
  zombie.zombieType = type;
  zombie.bossKind = bossKind;
  zombie.maxHp = isBoss
    ? useBroodmother
      ? BOSS2_MAX_HP
      : BOSS_MAX_HP
    : isShooter
      ? SHOOTER_MAX_HP
      : isSpitter
        ? SPITTER_MAX_HP
        : isBomber
          ? BOMBER_MAX_HP
          : isCrawler
            ? CRAWLER_MAX_HP
            : ZOMBIE_MAX_HP;
  zombie.hp = zombie.maxHp;
  zombie.moveSpeed = isBoss
    ? useBroodmother
      ? Phaser.Math.Between(BOSS2_SPEED_MIN, BOSS2_SPEED_MAX)
      : Phaser.Math.Between(BOSS_SPEED_MIN, BOSS_SPEED_MAX)
    : isShooter
      ? Phaser.Math.Between(SHOOTER_SPEED_MIN, SHOOTER_SPEED_MAX)
      : isSpitter
        ? Phaser.Math.Between(SPITTER_SPEED_MIN, SPITTER_SPEED_MAX)
        : isBomber
          ? Phaser.Math.Between(BOMBER_SPEED_MIN, BOMBER_SPEED_MAX)
          : isCrawler
            ? Phaser.Math.Between(CRAWLER_SPEED_MIN, CRAWLER_SPEED_MAX)
            : Phaser.Math.Between(ZOMBIE_SPEED_MIN, ZOMBIE_SPEED_MAX);
  zombie.facing = 'right';
  zombie.walkAnim = animKey;
  // Per-walker personality so the pack doesn't move like one brain.
  zombie.packSlot = Phaser.Math.Between(0, 23);
  zombie.leadBias = 0.25 + Math.random() * 1.0;
  zombie.wanderPhase = Math.random() * Math.PI * 2;
  zombie.wanderRate = 0.0012 + Math.random() * 0.0028;
  zombie.wanderAmp = 22 + Math.random() * 48;
  zombie.strafeSign = Math.random() < 0.5 ? -1 : 1;
  zombie.aimJitterX = (Math.random() - 0.5) * 80;
  zombie.aimJitterY = (Math.random() - 0.5) * 80;
  zombie.nextWanderAt = 0;
  zombie.speedWobble = 0.85 + Math.random() * 0.3;
  zombie.fireRateMs = isSpitter
    ? SPITTER_FIRE_RATE_MS
    : isBoss
      ? null
      : SHOOTER_FIRE_RATE_MS;
  zombie.nextShotAt = isBoss
    ? scene.time.now +
      Phaser.Math.Between(
        useBroodmother ? 2000 : 2500,
        useBroodmother ? 3200 : 4000,
      )
    : scene.time.now + Phaser.Math.Between(400, 1200);
  zombie.bossPhase = isBoss ? 'chase' : null;
  zombie.isTelegraphing = false;
  zombie.isCharging = false;
  zombie.isRecovering = false;
  zombie.phaseUntil = 0;
  zombie.chargeUntil = 0;
  zombie.nextChargeAt = isBoss
    ? scene.time.now +
      (useBroodmother
        ? BOSS2_BURROW_INTERVAL_MS
        : Phaser.Math.Between(2800, 3800))
    : 0;
  zombie.nextBirthAt = isBoss && useBroodmother
    ? scene.time.now + BOSS2_BIRTH_INTERVAL_MS * 0.6
    : 0;
  zombie.nextBomberThrowAt =
    isBoss && useBroodmother && BOSS2_ENABLE_EXPLODER_THROW
      ? scene.time.now + BOSS2_THROW_BOMBER_INTERVAL_MS * 0.55
      : 0;
  clearBroodmotherBomberThrow(zombie);
  zombie.chargeAngle = 0;
  zombie.isAttacking = false;
  zombie.attackUntil = 0;
  zombie.detonated = false;
  zombie.burrowed = false;
  zombie.setFlipX(false);
  // Pooled zombies can keep a white hit-flash tint — always reset.
  cancelZombieFlash(zombie);
  zombie.clearTint();
  zombie.anims?.play(animKey, true);

  if (zombie.healthBar) {
    zombie.healthBar.destroy();
  }
  zombie.healthBar = scene.add.graphics();
  zombie.healthBar.setDepth(isBoss ? 12 : 9);
  drawZombieHealthBar(zombie);

  return zombie;
}

/**
 * @param {(zombie: Phaser.Physics.Arcade.Sprite, angle: number) => void} [onShooterFire]
 */
export function updateZombies(group, player, time, onShooterFire) {
  if (!player?.active) return;

  group.children.each((zombie) => {
    if (!zombie.active || !zombie.body) return;

    const angle = Phaser.Math.Angle.Between(zombie.x, zombie.y, player.x, player.y);
    const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, player.x, player.y);

    if (zombie.zombieType === ZOMBIE_TYPE_SHOOTER || zombie.zombieType === ZOMBIE_TYPE_SPITTER) {
      const ideal =
        zombie.zombieType === ZOMBIE_TYPE_SPITTER ? SPITTER_IDEAL_RANGE : SHOOTER_IDEAL_RANGE;
      const stop =
        zombie.zombieType === ZOMBIE_TYPE_SPITTER ? SPITTER_STOP_RANGE : SHOOTER_STOP_RANGE;
      // Keep mid-range and shoot; don't just rush the player.
      if (dist > ideal) {
        zombie.body.setVelocity(
          Math.cos(angle) * zombie.moveSpeed,
          Math.sin(angle) * zombie.moveSpeed,
        );
      } else if (dist < stop) {
        zombie.body.setVelocity(
          Math.cos(angle) * -zombie.moveSpeed * 0.7,
          Math.sin(angle) * -zombie.moveSpeed * 0.7,
        );
      } else {
        zombie.body.setVelocity(0, 0);
      }

      if (typeof onShooterFire === 'function' && time >= zombie.nextShotAt) {
        onShooterFire(zombie, angle);
        zombie.nextShotAt =
          time +
          (zombie.fireRateMs ||
            (zombie.zombieType === ZOMBIE_TYPE_SPITTER
              ? SPITTER_FIRE_RATE_MS
              : SHOOTER_FIRE_RATE_MS));
      }
    } else if (zombie.zombieType === ZOMBIE_TYPE_BOSS) {
      updateBoss(zombie, player, time, angle, onShooterFire);
    } else {
      // Walkers lead the player's path + separate so packs don't stack.
      // Bombers still rush hard, but share separation so they don't clip walkers.
      if (zombie.zombieType === ZOMBIE_TYPE_WALKER) {
        steerWalker(zombie, player, group, time);
      } else if (zombie.zombieType === ZOMBIE_TYPE_CRAWLER) {
        steerCrawler(zombie, player, group);
      } else {
        const { x: tx, y: ty } = predictPlayerPoint(player, zombie, 0.35);
        const aim = Math.atan2(ty - zombie.y, tx - zombie.x);
        let vx = Math.cos(aim) * zombie.moveSpeed;
        let vy = Math.sin(aim) * zombie.moveSpeed;
        const sep = separationSteer(zombie, group);
        vx += sep.x;
        vy += sep.y;
        const len = Math.hypot(vx, vy) || 1;
        zombie.body.setVelocity((vx / len) * zombie.moveSpeed, (vy / len) * zombie.moveSpeed);
      }
      if (zombie.zombieType === ZOMBIE_TYPE_BOMBER) {
        // Subtle red flash only — no scale throb.
        zombie.setScale(BOMBER_SCALE);
        const flash = 0.5 + 0.5 * Math.sin(time / 140);
        const r = 255;
        const g = Math.floor(255 - 95 * flash);
        const b = Math.floor(255 - 110 * flash);
        zombie.setTint(Phaser.Display.Color.GetColor(r, g, b));
      }
    }

    if (zombie.zombieType !== ZOMBIE_TYPE_BOSS) {
      // Face toward chase target / player with hysteresis.
      const dx = player.x - zombie.x;
      if (dx < -10) zombie.facing = 'left';
      else if (dx > 10) zombie.facing = 'right';

      zombie.setFlipX(zombie.facing === 'left');
      const animKey = zombie.walkAnim || ZOMBIE_WALK_RIGHT;
      if (zombie.anims?.currentAnim?.key !== animKey || !zombie.anims.isPlaying) {
        zombie.anims.play(animKey, true);
      }
      if (zombie.anims) {
        zombie.anims.timeScale = zombie.zombieType === ZOMBIE_TYPE_CRAWLER ? 1.75 : 1;
      }
    }

    drawZombieHealthBar(zombie);
  });
}

function predictPlayerPoint(player, zombie, leadScale = 1) {
  const pvx = player.body?.velocity?.x || 0;
  const pvy = player.body?.velocity?.y || 0;
  const speed = Math.max(zombie.moveSpeed || ZOMBIE_SPEED_MIN, 1);
  const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, player.x, player.y);
  const eta = Math.min(WALKER_LEAD_SEC, dist / speed);
  const lead = eta * leadScale;
  return {
    x: player.x + pvx * lead,
    y: player.y + pvy * lead,
  };
}

function separationSteer(zombie, group) {
  let sx = 0;
  let sy = 0;
  group.children.each((other) => {
    if (!other?.active || other === zombie || !other.body) return;
    if (
      other.zombieType === ZOMBIE_TYPE_SHOOTER ||
      other.zombieType === ZOMBIE_TYPE_SPITTER ||
      other.zombieType === ZOMBIE_TYPE_BOSS
    ) {
      return;
    }
    const d = Phaser.Math.Distance.Between(zombie.x, zombie.y, other.x, other.y);
    if (d <= 0 || d >= WALKER_SEP_RADIUS) return;
    const push = (WALKER_SEP_RADIUS - d) / WALKER_SEP_RADIUS;
    sx += ((zombie.x - other.x) / d) * push;
    sy += ((zombie.y - other.y) / d) * push;
  });
  return {
    x: sx * WALKER_SEP_STRENGTH,
    y: sy * WALKER_SEP_STRENGTH,
  };
}

function steerWalker(zombie, player, group, time) {
  // Refresh personal aim noise on a staggered timer so each zombie drifts differently.
  if (time >= (zombie.nextWanderAt || 0)) {
    zombie.nextWanderAt = time + 320 + Math.random() * 900;
    const ang = Math.random() * Math.PI * 2;
    const r = 16 + Math.random() * 72;
    zombie.aimJitterX = Math.cos(ang) * r;
    zombie.aimJitterY = Math.sin(ang) * r;
    if (Math.random() < 0.3) zombie.strafeSign *= -1;
    zombie.speedWobble = 0.78 + Math.random() * 0.4;
    zombie.leadBias = 0.2 + Math.random() * 1.05;
  }

  const pred = predictPlayerPoint(player, zombie, zombie.leadBias ?? 0.7);
  const toPredX = pred.x - zombie.x;
  const toPredY = pred.y - zombie.y;
  const heading = Math.atan2(toPredY, toPredX);
  const side = heading + (Math.PI / 2) * (zombie.strafeSign || 1);
  const sway =
    (zombie.wanderAmp || 30) *
    Math.sin(time * (zombie.wanderRate || 0.002) + (zombie.wanderPhase || 0));

  const tx =
    pred.x +
    (zombie.aimJitterX || 0) +
    Math.cos(side) * sway * 0.45;
  const ty =
    pred.y +
    (zombie.aimJitterY || 0) +
    Math.sin(side) * sway * 0.45;

  // Mostly chase the player; keep a little pull to true player so they don't get lost.
  let vx = (tx - zombie.x) * 0.78 + (player.x - zombie.x) * 0.22;
  let vy = (ty - zombie.y) * 0.78 + (player.y - zombie.y) * 0.22;
  const sep = separationSteer(zombie, group);
  vx += sep.x;
  vy += sep.y;

  const len = Math.hypot(vx, vy) || 1;
  const speed = zombie.moveSpeed * (zombie.speedWobble || 1);
  zombie.body.setVelocity((vx / len) * speed, (vy / len) * speed);
}

/** Fast low rushers — close the gap, then hold bite range (still touchable). */
function steerCrawler(zombie, player, group) {
  const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, player.x, player.y);
  const sep = separationSteer(zombie, group);

  if (dist <= CRAWLER_HOLD_RANGE) {
    // Back off slightly + circle so they don't sit under the muzzle spawn.
    const away = Math.atan2(zombie.y - player.y, zombie.x - player.x);
    const tangent = away + Math.PI / 2;
    let vx =
      Math.cos(away) * zombie.moveSpeed * 0.35 +
      Math.cos(tangent) * zombie.moveSpeed * 0.55;
    let vy =
      Math.sin(away) * zombie.moveSpeed * 0.35 +
      Math.sin(tangent) * zombie.moveSpeed * 0.55;
    vx += sep.x * 0.85;
    vy += sep.y * 0.85;
    const len = Math.hypot(vx, vy) || 1;
    const holdSpeed = zombie.moveSpeed * 0.7;
    zombie.body.setVelocity((vx / len) * holdSpeed, (vy / len) * holdSpeed);
    return;
  }

  const pred = predictPlayerPoint(player, zombie, 0.55);
  let vx = pred.x - zombie.x;
  let vy = pred.y - zombie.y;
  vx += sep.x * 0.7;
  vy += sep.y * 0.7;
  const len = Math.hypot(vx, vy) || 1;
  zombie.body.setVelocity((vx / len) * zombie.moveSpeed, (vy / len) * zombie.moveSpeed);
}

function updateBoss(zombie, player, time, angle, onShooterFire) {
  if (zombie.bossKind === BOSS_KIND_BROODMOTHER) {
    updateBroodmotherBoss(zombie, player, time, angle, onShooterFire);
    return;
  }

  const dx = player.x - zombie.x;
  faceBoss(zombie, dx);

  // Planted mid-throw: hold still until the wind-up finishes.
  if (zombie.isAttacking) {
    if (time < zombie.attackUntil) {
      zombie.body.setVelocity(0, 0);
      return;
    }
    zombie.isAttacking = false;
    zombie.bossPhase = 'chase';
    zombie.anims?.play(zombie.walkAnim || BOSS_WALK_RIGHT, true);
  }

  // telegraph → charge → recover cycle.
  if (zombie.bossPhase === 'telegraph') {
    zombie.body.setVelocity(0, 0);
    pulseBossTelegraph(zombie, time);
    if (time >= zombie.phaseUntil) {
      beginBossCharge(zombie, time);
    }
    return;
  }

  if (zombie.bossPhase === 'charge') {
    if (time >= zombie.phaseUntil) {
      beginBossRecover(zombie, time);
      return;
    }
    zombie.body.setVelocity(
      Math.cos(zombie.chargeAngle) * BOSS_CHARGE_SPEED,
      Math.sin(zombie.chargeAngle) * BOSS_CHARGE_SPEED,
    );
    faceBoss(zombie, Math.cos(zombie.chargeAngle) * 100);
    return;
  }

  if (zombie.bossPhase === 'recover') {
    zombie.body.setVelocity(0, 0);
    if (time >= zombie.phaseUntil) {
      endBossRecover(zombie, time);
    }
    return;
  }

  // Start telegraph when the charge timer is ready.
  if (time >= zombie.nextChargeAt) {
    beginBossTelegraph(zombie, time, angle);
    return;
  }

  // Normal chase + bone throws (only during chase).
  zombie.body.setVelocity(
    Math.cos(angle) * zombie.moveSpeed,
    Math.sin(angle) * zombie.moveSpeed,
  );

  const walkKey = zombie.walkAnim || BOSS_WALK_RIGHT;
  if (zombie.anims?.currentAnim?.key !== walkKey || !zombie.anims.isPlaying) {
    zombie.anims.play(walkKey, true);
  }

  if (typeof onShooterFire === 'function' && time >= zombie.nextShotAt) {
    onShooterFire(zombie, angle);
    zombie.nextShotAt =
      time + Phaser.Math.Between(BOSS_FIRE_RATE_MIN_MS, BOSS_FIRE_RATE_MAX_MS);
    zombie.isAttacking = true;
    zombie.bossPhase = 'throw';
    zombie.attackUntil = time + BOSS_THROW_DURATION_MS;
    zombie.body.setVelocity(0, 0);
    if (zombie.scene?.anims.exists(BOSS_THROW_ANIM)) {
      zombie.anims.play(BOSS_THROW_ANIM, false);
    }
  }
}

/** Level 2 boss: acid denial, crawler birth, burrow resurface. */
function updateBroodmotherBoss(zombie, player, time, angle, onShooterFire) {
  const dx = player.x - zombie.x;
  faceBoss(zombie, dx);
  const zGroup = zombie.scene?.zombies;

  if (zombie.bossPhase === 'spit') {
    zombie.body.setVelocity(0, 0);
    if (time >= zombie.phaseUntil) {
      zombie.bossPhase = 'chase';
      zombie.isAttacking = false;
      resetBossScale(zombie);
      zombie.anims?.play(zombie.walkAnim || BOSS2_WALK, true);
    }
    return;
  }

  if (zombie.bossPhase === 'throw_bomber_windup') {
    zombie.body.setVelocity(0, 0);
    if (time >= zombie.phaseUntil) {
      launchBroodmotherBomberThrow(zombie, player);
      zombie.bossPhase = 'chase';
      zombie.isAttacking = false;
      zombie.nextBomberThrowAt = time + BOSS2_THROW_BOMBER_INTERVAL_MS;
      resetBossScale(zombie);
      zombie.anims?.play(zombie.walkAnim || BOSS2_WALK, true);
    }
    return;
  }

  if (zombie.bossPhase === 'birth') {
    zombie.body.setVelocity(0, 0);
    const birthDist = Phaser.Math.Distance.Between(
      zombie.x,
      zombie.y,
      player.x,
      player.y,
    );
    // Abort if the player closes in during the birth windup.
    if (birthDist < BOSS2_BIRTH_MIN_RANGE) {
      zombie.bossPhase = 'chase';
      zombie.isAttacking = false;
      zombie.nextBirthAt = time + 600;
      resetBossScale(zombie);
      zombie.anims?.play(zombie.walkAnim || BOSS2_WALK, true);
      return;
    }
    if (time >= zombie.phaseUntil) {
      if (zGroup && zombie.scene) {
        for (let i = 0; i < BOSS2_BIRTH_COUNT; i += 1) {
          const crawler = spawnZombie(zombie.scene, zGroup, ZOMBIE_TYPE_CRAWLER);
          if (!crawler) continue;
          const a = angle + (i - 1) * 0.55 + Phaser.Math.FloatBetween(-0.2, 0.2);
          crawler.setPosition(
            zombie.x + Math.cos(a) * (40 + i * 18),
            zombie.y + Math.sin(a) * (40 + i * 18),
          );
        }
      }
      zombie.bossPhase = 'chase';
      zombie.isAttacking = false;
      zombie.nextBirthAt = time + BOSS2_BIRTH_INTERVAL_MS;
      resetBossScale(zombie);
      zombie.anims?.play(zombie.walkAnim || BOSS2_WALK, true);
    }
    return;
  }

  if (zombie.bossPhase === 'burrow_dive') {
    zombie.body.setVelocity(0, 0);
    if (time >= zombie.phaseUntil) {
      zombie.burrowed = true;
      zombie.setVisible(false);
      zombie.setAlpha(0);
      if (zombie.body) zombie.body.enable = false;
      if (zombie.healthBar) zombie.healthBar.setVisible(false);
      // Lock emerge point now and show a red warning so the player can dodge.
      const emerge = pickBroodmotherEmergePoint(zombie, player);
      zombie.emergeX = emerge.x;
      zombie.emergeY = emerge.y;
      showBroodmotherEmergeTelegraph(zombie, emerge.x, emerge.y);
      zombie.bossPhase = 'burrow_under';
      zombie.phaseUntil = time + BOSS2_BURROW_UNDER_MS;
    }
    return;
  }

  if (zombie.bossPhase === 'burrow_under') {
    if (time >= zombie.phaseUntil) {
      const nx = zombie.emergeX ?? player.x;
      const ny = zombie.emergeY ?? player.y;
      zombie.setPosition(nx, ny);
      zombie.burrowed = false;
      zombie.setVisible(true);
      zombie.setAlpha(1);
      if (zombie.body) zombie.body.enable = true;
      if (zombie.healthBar) zombie.healthBar.setVisible(true);
      clearBroodmotherEmergeTelegraph(zombie);
      zombie.bossPhase = 'burrow_emerge';
      zombie.phaseUntil = time + BOSS2_EMERGE_MS;
      faceBoss(zombie, player.x - zombie.x);
      if (zombie.scene?.anims.exists(BOSS2_EMERGE_ANIM)) {
        zombie.anims.play(BOSS2_EMERGE_ANIM, false);
      }
    }
    return;
  }

  if (zombie.bossPhase === 'burrow_emerge') {
    zombie.body.setVelocity(0, 0);
    if (time >= zombie.phaseUntil) {
      zombie.bossPhase = 'chase';
      zombie.nextChargeAt = time + BOSS2_BURROW_INTERVAL_MS;
      // Delay spit slightly after emerge so the slam reads.
      zombie.nextShotAt = Math.max(zombie.nextShotAt, time + 900);
      resetBossScale(zombie);
      zombie.anims?.play(zombie.walkAnim || BOSS2_WALK, true);
    }
    return;
  }

  // Chase.
  zombie.body.setVelocity(
    Math.cos(angle) * zombie.moveSpeed,
    Math.sin(angle) * zombie.moveSpeed,
  );
  const walkKey = zombie.walkAnim || BOSS2_WALK;
  if (zombie.anims?.currentAnim?.key !== walkKey || !zombie.anims.isPlaying) {
    zombie.anims.play(walkKey, true);
  }
  // Sheet walk is subtle — add a light weight bob so chase reads as moving.
  {
    const native = zombie.frame?.width === BOSS_FRAME_W;
    const base = native ? BOSS_SCALE : BOSS_FALLBACK_SCALE;
    const bob = Math.sin(time / 130) * 0.018;
    zombie.setScale(base * (1 + bob * 0.35), base * (1 - bob));
  }

  // Lob a live exploder near the player (one at a time). Soft-disable via flag.
  if (BOSS2_ENABLE_EXPLODER_THROW && time >= (zombie.nextBomberThrowAt || 0)) {
    const bombersAlive = zGroup
      ? countActiveZombies(zGroup, ZOMBIE_TYPE_BOMBER)
      : 0;
    if (bombersAlive >= MAX_BOMBERS_ALIVE || !sceneHasBomberTexture(zombie.scene)) {
      zombie.nextBomberThrowAt = time + 800;
    } else {
      zombie.bossPhase = 'throw_bomber_windup';
      zombie.phaseUntil = time + BOSS2_THROW_WINDUP_MS;
      zombie.isAttacking = true;
      zombie.body.setVelocity(0, 0);
      // Give the player time after a throw before crawlers drop.
      zombie.nextBirthAt = Math.max(
        zombie.nextBirthAt || 0,
        time + BOSS2_SPAWN_ATTACK_GAP_MS,
      );
      resetBossScale(zombie);
      if (zombie.scene?.anims.exists(BOSS2_SPIT_ANIM)) {
        zombie.anims.play(BOSS2_SPIT_ANIM, false);
      }
      return;
    }
  }

  if (time >= zombie.nextChargeAt) {
    const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, player.x, player.y);
    // Closing tool: only dive when the player is far enough to kite.
    if (dist >= BOSS2_BURROW_RANGE) {
      zombie.bossPhase = 'burrow_dive';
      zombie.phaseUntil = time + 480;
      zombie.body.setVelocity(0, 0);
      zombie.nextChargeAt = time + BOSS2_BURROW_INTERVAL_MS;
      resetBossScale(zombie);
      if (zombie.scene?.anims.exists(BOSS2_BURROW_ANIM)) {
        zombie.anims.play(BOSS2_BURROW_ANIM, false);
      }
      return;
    }
  }

  if (time >= (zombie.nextBirthAt || 0)) {
    const crawlersAlive = zGroup
      ? countActiveZombies(zGroup, ZOMBIE_TYPE_CRAWLER)
      : 0;
    const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, player.x, player.y);
    // Wait until previous brood crawlers are cleared before birthing again.
    // Also skip when the player is close — adds block sight / melee clutter.
    if (crawlersAlive > 0 || dist < BOSS2_BIRTH_MIN_RANGE) {
      zombie.nextBirthAt = time + 400;
    } else {
      zombie.bossPhase = 'birth';
      zombie.phaseUntil = time + BOSS2_BIRTH_MS;
      zombie.isAttacking = true;
      zombie.body.setVelocity(0, 0);
      // Same spacing the other way: no throw right after a birth.
      if (BOSS2_ENABLE_EXPLODER_THROW) {
        zombie.nextBomberThrowAt = Math.max(
          zombie.nextBomberThrowAt || 0,
          time + BOSS2_SPAWN_ATTACK_GAP_MS,
        );
      }
      if (zombie.scene?.anims.exists(BOSS2_BIRTH_ANIM)) {
        zombie.anims.play(BOSS2_BIRTH_ANIM, false);
      }
      return;
    }
  }

  if (typeof onShooterFire === 'function' && time >= zombie.nextShotAt) {
    onShooterFire(zombie, angle);
    zombie.nextShotAt =
      time +
      Phaser.Math.Between(BOSS2_SPIT_INTERVAL_MIN_MS, BOSS2_SPIT_INTERVAL_MAX_MS);
    zombie.bossPhase = 'spit';
    zombie.phaseUntil = time + BOSS2_SPIT_MS;
    zombie.isAttacking = true;
    zombie.body.setVelocity(0, 0);
    if (zombie.scene?.anims.exists(BOSS2_SPIT_ANIM)) {
      zombie.anims.play(BOSS2_SPIT_ANIM, false);
    }
  }
}

function beginBossTelegraph(zombie, time, angle) {
  zombie.bossPhase = 'telegraph';
  zombie.isTelegraphing = true;
  zombie.isCharging = false;
  zombie.isRecovering = false;
  zombie.phaseUntil = time + BOSS_TELEGRAPH_MS;
  zombie.nextChargeAt = time + BOSS_CHARGE_INTERVAL_MS;
  zombie.chargeAngle = angle;
  zombie.body.setVelocity(0, 0);
  faceBoss(zombie, Math.cos(angle) * 100);
  zombie.setTint(0xff5555);
  zombie.anims?.stop();
  // Brief crouch so the telegraph reads even without a dedicated anim.
  zombie.setScale(zombie.scaleX * 1.05, zombie.scaleY * 0.92);
}

function beginBossCharge(zombie, time) {
  zombie.bossPhase = 'charge';
  zombie.isTelegraphing = false;
  zombie.isCharging = true;
  zombie.isRecovering = false;
  zombie.phaseUntil = time + BOSS_CHARGE_DURATION_MS;
  zombie.clearTint();
  resetBossScale(zombie);
  // Keep the angle locked during telegraph so the dodge window is fair.
  faceBoss(zombie, Math.cos(zombie.chargeAngle) * 100);
  if (zombie.anims && zombie.scene.anims.exists(BOSS_CHARGE_ANIM)) {
    zombie.anims.play(BOSS_CHARGE_ANIM, false);
  } else {
    zombie.anims?.play(zombie.walkAnim || BOSS_WALK_RIGHT, true);
  }
}

function beginBossRecover(zombie, time) {
  zombie.bossPhase = 'recover';
  zombie.isCharging = false;
  zombie.isRecovering = true;
  zombie.phaseUntil = time + BOSS_RECOVER_MS;
  zombie.body.setVelocity(0, 0);
  zombie.clearTint();
  resetBossScale(zombie);
  zombie.anims?.stop();
  zombie.setTint(0xaaaaaa);
}

function endBossRecover(zombie, time) {
  zombie.bossPhase = 'chase';
  zombie.isRecovering = false;
  zombie.clearTint();
  resetBossScale(zombie);
  // After a charge, give a short pause before the next bone.
  zombie.nextShotAt = Math.max(
    zombie.nextShotAt,
    time + Phaser.Math.Between(1200, 2000),
  );
  zombie.anims?.play(zombie.walkAnim || BOSS_WALK_RIGHT, true);
}

function pulseBossTelegraph(zombie, time) {
  const flash = Math.floor(time / 90) % 2 === 0;
  if (flash) zombie.setTint(0xff5555);
  else zombie.setTint(0xffcccc);
}

function resetBossScale(zombie) {
  const native = zombie.frame?.width === BOSS_FRAME_W;
  zombie.setScale(native ? BOSS_SCALE : BOSS_FALLBACK_SCALE);
}

function drawZombieHealthBar(zombie) {
  const bar = zombie.healthBar;
  if (!bar) return;

  const isBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
  const width = isBoss ? BOSS_HEALTH_BAR_WIDTH : HEALTH_BAR_WIDTH;
  const height = isBoss ? 7 : HEALTH_BAR_HEIGHT;
  // Native boss cells have headroom above the sprite; sit the bar on his head.
  const bossHeadRatio = zombie.frame.width === BOSS_FRAME_W ? 0.43 : 0.48;
  const yOffset = isBoss
    ? zombie.displayHeight * bossHeadRatio + 10
    : HEALTH_BAR_Y_OFFSET;
  const ratio = Phaser.Math.Clamp(zombie.hp / zombie.maxHp, 0, 1);
  const x = zombie.x - width / 2;
  const y = zombie.y - yOffset;

  bar.clear();
  bar.fillStyle(0x1a1414, 0.85);
  bar.fillRect(x - 1, y - 1, width + 2, height + 2);
  bar.fillStyle(0x3a2a2a, 1);
  bar.fillRect(x, y, width, height);
  const fill = ratio > 0.66 ? 0x7dba5a : ratio > 0.33 ? 0xe0b35a : 0xe08a8a;
  bar.fillStyle(fill, 1);
  bar.fillRect(x, y, width * ratio, height);
}

/** @returns {boolean} true if the zombie died */
export function damageZombie(zombie, amount = 1) {
  if (!zombie?.active) return false;
  // Underground during burrow — can't be clipped mid-teleport.
  if (zombie.burrowed || zombie.bossPhase === 'burrow_under') return false;

  zombie.hp -= amount;
  flashZombieHit(zombie);
  drawZombieHealthBar(zombie);

  if (zombie.hp > 0) return false;
  killZombie(zombie);
  return true;
}

function flashZombieHit(zombie) {
  cancelZombieFlash(zombie);
  zombie.setTint(0xffcccc);
  const token = (zombie.flashToken || 0) + 1;
  zombie.flashToken = token;
  zombie.flashEvent = zombie.scene?.time?.delayedCall(70, () => {
    if (zombie.flashToken !== token) return;
    zombie.flashEvent = null;
    if (zombie.active) zombie.clearTint();
  });
}

function cancelZombieFlash(zombie) {
  if (zombie.flashEvent) {
    zombie.flashEvent.remove(false);
    zombie.flashEvent = null;
  }
}

export function clearZombies(group) {
  group.children.each((zombie) => {
    destroyZombieHealthBar(zombie);
    cancelZombieFlash(zombie);
    zombie.clearTint();
    zombie.anims?.stop();
    zombie.setActive(false);
    zombie.setVisible(false);
    zombie.body?.stop();
    if (zombie.body) zombie.body.enable = false;
  });
}

export function killZombie(zombie) {
  destroyZombieHealthBar(zombie);
  clearBroodmotherEmergeTelegraph(zombie);
  clearBroodmotherBomberThrow(zombie);
  cancelZombieFlash(zombie);
  zombie.clearTint();
  if (zombie.zombieType === ZOMBIE_TYPE_BOSS) resetBossScale(zombie);
  playZombieKillSfx(zombie);
  zombie.bossPhase = null;
  zombie.burrowed = false;
  zombie.isTelegraphing = false;
  zombie.isCharging = false;
  zombie.isRecovering = false;
  zombie.isAttacking = false;
  zombie.anims?.stop();
  zombie.setActive(false);
  zombie.setVisible(false);
  zombie.body?.stop();
  if (zombie.body) zombie.body.enable = false;
}

/** Keys must match GameScene preload (`zombie-death` / `zombie-boss-death`). */
function playZombieKillSfx(zombie) {
  const scene = zombie?.scene;
  if (!scene?.sound || !scene.cache?.audio) return;

  const isBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
  const key = isBoss ? 'zombie-boss-death' : 'zombie-death';
  if (!scene.cache.audio.exists(key)) return;

  scene.sound.unlock();
  // Fresh instance so rapid multi-kills don't cut each other off.
  const sfx = scene.sound.add(key, {
    volume: isBoss ? 0.7 : 0.5,
    rate: isBoss ? 1 : 0.92 + Math.random() * 0.16,
  });
  sfx.once('complete', () => sfx.destroy());
  sfx.play();
}

function destroyZombieHealthBar(zombie) {
  if (!zombie.healthBar) return;
  zombie.healthBar.destroy();
  zombie.healthBar = null;
}

function removeBlackCellBorder(ctx, width, height) {
  const border = 6;
  ctx.clearRect(0, 0, width, border);
  ctx.clearRect(0, height - border, width, border);
  ctx.clearRect(0, 0, border, height);
  ctx.clearRect(width - border, 0, border, height);
}

/** Wipe solid black grid bars Sorceress bakes along cell edges (esp. Boss2). */
function clearBossGridRules(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;

  const rowIsBlackRule = (y) => {
    let dark = 0;
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      if (data[o + 3] < 20) {
        dark += 1;
        continue;
      }
      const avg = (data[o] + data[o + 1] + data[o + 2]) / 3;
      if (avg < 28) dark += 1;
    }
    return dark >= width * 0.7;
  };

  const clearRow = (y) => {
    for (let x = 0; x < width; x += 1) {
      data[(y * width + x) * 4 + 3] = 0;
    }
  };

  for (let y = height - 1; y >= Math.max(0, height - 16); y -= 1) {
    if (!rowIsBlackRule(y)) break;
    clearRow(y);
  }
  for (let y = 0; y < Math.min(12, height); y += 1) {
    if (!rowIsBlackRule(y)) break;
    clearRow(y);
  }

  // Extra safety: always clear the bottom 4px — Boss2 sheet has a full black rule there.
  for (let y = height - 4; y < height; y += 1) clearRow(y);

  ctx.putImageData(image, 0, 0);
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
    if (a < 28) return true;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    const chroma = max - min;

    // Keep saturated zombie colors (skin, cloth, bone, eyes).
    if (chroma > 22) return false;
    // Light / mid grey checker tiles (common in AI sheets).
    if (avg >= 70 && avg <= 210) return true;
    // Near-white padding.
    if (avg > 210 && chroma <= 18) return true;
    return false;
  };

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (marked[i] || !isCheckerSquare(i)) return;
    marked[i] = 1;
    queue.push(i);
  };

  // Flood from every border pixel (catches most baked checkerboards).
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

  // Second pass: grow into leftover checker islands touching already-cleared areas
  // (e.g. trapped between arms), without eating grey clothing in the silhouette.
  let grew = true;
  while (grew) {
    grew = false;
    for (let i = 0; i < total; i += 1) {
      if (marked[i] || !isCheckerSquare(i)) continue;
      const x = i % width;
      const y = (i / width) | 0;
      let touchesCleared = false;
      for (let dy = -1; dy <= 1 && !touchesCleared; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (marked[ny * width + nx]) {
            touchesCleared = true;
            break;
          }
        }
      }
      if (touchesCleared) {
        marked[i] = 1;
        grew = true;
      }
    }
  }

  for (let i = 0; i < total; i += 1) {
    if (!marked[i]) continue;
    data[i * 4 + 3] = 0;
  }

  ctx.putImageData(image, 0, 0);
}
