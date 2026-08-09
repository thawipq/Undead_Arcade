import { FRAME_H, FRAME_W } from './soldierAnim.js';

const ZOMBIE_SPEED_MIN = 45;
const ZOMBIE_SPEED_MAX = 75;
const ZOMBIE_MAX = 28;
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

/** Shooters unlock after this much run time. */
export const SHOOTER_UNLOCK_MS = 40_000;
export const SHOOTER_SPAWN_INTERVAL_MS = 6000;
export const MAX_SHOOTERS_ALIVE = 3;
export const SHOOTER_FIRE_RATE_MS = 1700;
export const SHOOTER_BULLET_SPEED = 260;
export const SHOOTER_SPEED_MIN = 28;
export const SHOOTER_SPEED_MAX = 42;
export const SHOOTER_IDEAL_RANGE = 320;
export const SHOOTER_STOP_RANGE = 260;

/** After this, normal/shooter spawns stop so the arena can be cleared. */
export const SPAWN_STOP_MS = 60_000;
/** Boss appears after the cleanup window. */
export const BOSS_UNLOCK_MS = 90_000;
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

export const BOSS_TEXTURE_KEY = 'zombie-boss';
export const BOSS_SRC_KEY = 'zombie-boss-sheet-src';
export const BOSS_SHEET_PATH = 'assets/zombie/Boss1.png';
export const BOSS_WALK_RIGHT = 'zombie-boss-walk-right';
export const BOSS_CHARGE_ANIM = 'zombie-boss-charge';
export const BOSS_THROW_ANIM = 'zombie-boss-throw';
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
  if (!scene.textures.exists(BOSS_SRC_KEY)) {
    scene.load.image(BOSS_SRC_KEY, BOSS_SHEET_PATH);
  }
}

export function buildZombieSheet(scene) {
  bakeSheet(scene, {
    srcKey: ZOMBIE_SRC_KEY,
    textureKey: ZOMBIE_TEXTURE_KEY,
    animKey: ZOMBIE_WALK_RIGHT,
    required: true,
  });

  const hasShooterArt = scene.textures.exists(SHOOTER_SRC_KEY);
  bakeSheet(scene, {
    srcKey: hasShooterArt ? SHOOTER_SRC_KEY : ZOMBIE_SRC_KEY,
    textureKey: SHOOTER_TEXTURE_KEY,
    animKey: SHOOTER_WALK_RIGHT,
    required: false,
    // Temporary look until Zombie2.png is uploaded.
    tintFallback: hasShooterArt ? null : { r: 1.15, g: 0.75, b: 1.25 },
  });

  if (scene.textures.exists(BOSS_SRC_KEY)) {
    bakeBossSheet(scene);
  } else {
    bakeSheet(scene, {
      srcKey: ZOMBIE_SRC_KEY,
      textureKey: BOSS_TEXTURE_KEY,
      animKey: BOSS_WALK_RIGHT,
      required: false,
      tintFallback: { r: 1.35, g: 0.55, b: 0.55 },
    });
  }
}

/**
 * The boss cells are wide and short, so slicing them into the 344×384 walker
 * grid squashed him. Bake 1:1 instead and let BOSS_SCALE size him.
 */
function bakeBossSheet(scene) {
  const source = scene.textures.get(BOSS_SRC_KEY).getSourceImage();
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
      removeCheckerboard(tmpCtx, BOSS_FRAME_W, BOSS_FRAME_H);
      ctx.drawImage(tmp, col * BOSS_FRAME_W, row * BOSS_FRAME_H);
    }
  }

  if (scene.textures.exists(BOSS_TEXTURE_KEY)) scene.textures.remove(BOSS_TEXTURE_KEY);
  scene.textures.addSpriteSheet(BOSS_TEXTURE_KEY, canvas, {
    frameWidth: BOSS_FRAME_W,
    frameHeight: BOSS_FRAME_H,
  });
  scene.textures.get(BOSS_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);

  // Row 1 "walk" from Sorceress is nearly identical standing poses — use the
  // real stride frames from the lunge row (20–21) so chase reads as walking.
  createBossAnim(scene, BOSS_WALK_RIGHT, {
    frames: [20, 21],
    frameRate: 7,
    repeat: -1,
    yoyo: true,
  });
  createBossAnim(scene, BOSS_THROW_ANIM, {
    sheetRow: 2,
    frameRate: 10,
    repeat: 0,
  });
  createBossAnim(scene, BOSS_CHARGE_ANIM, {
    sheetRow: 5,
    frameRate: 10,
    repeat: 0,
  });
}

function createBossAnim(scene, animKey, {
  sheetRow = null,
  frames = null,
  frameRate = 8,
  repeat = -1,
  yoyo = false,
} = {}) {
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
  if (!scene.textures.exists(BOSS_TEXTURE_KEY)) return;

  const maxFrame = Math.max(0, scene.textures.get(BOSS_TEXTURE_KEY).frameTotal - 2);
  let animFrames;
  if (frames) {
    animFrames = frames
      .map((n) => Math.min(Math.max(0, n), maxFrame))
      .map((frame) => ({ key: BOSS_TEXTURE_KEY, frame }));
  } else {
    const start = Math.min((sheetRow ?? 0) * BOSS_SHEET_COLS, maxFrame);
    const end = Math.min(start + BOSS_SHEET_COLS - 1, maxFrame);
    animFrames = scene.anims.generateFrameNumbers(BOSS_TEXTURE_KEY, { start, end });
  }

  scene.anims.create({
    key: animKey,
    frames: animFrames,
    frameRate,
    repeat,
    yoyo,
  });
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

export function spawnIntervalForElapsed(elapsedMs) {
  const t = elapsedMs / 1000;
  let interval = Math.max(
    SPAWN_INTERVAL_MIN,
    SPAWN_INTERVAL_START - t * SPAWN_SPEEDUP_PER_SEC,
  );
  // Once bone-throwers are in play, slow walker waves so the map stays readable.
  if (elapsedMs >= SHOOTER_UNLOCK_MS) {
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

  if (isShooter && countActiveZombies(group, ZOMBIE_TYPE_SHOOTER) >= MAX_SHOOTERS_ALIVE) {
    return null;
  }
  if (isBoss && countActiveZombies(group, ZOMBIE_TYPE_BOSS) >= 1) {
    return null;
  }

  const textureKey = isBoss
    ? BOSS_TEXTURE_KEY
    : isShooter
      ? SHOOTER_TEXTURE_KEY
      : ZOMBIE_TEXTURE_KEY;
  const animKey = isBoss
    ? BOSS_WALK_RIGHT
    : isShooter
      ? SHOOTER_WALK_RIGHT
      : ZOMBIE_WALK_RIGHT;

  if (!scene.textures.exists(textureKey)) return null;

  const point = randomCameraBorderPoint(scene.cameras.main, scene.physics.world.bounds);
  const zombie = group.get(point.x, point.y, textureKey, 0);
  if (!zombie) return null;

  zombie.setActive(true);
  zombie.setVisible(true);
  zombie.setDepth(isBoss ? 11 : 8);
  // Pooled sprites may still carry another type's sheet; set it before sizing.
  zombie.anims?.stop();
  zombie.setTexture(textureKey, 0);
  const bossNativeSheet = isBoss && zombie.frame.width === BOSS_FRAME_W;
  zombie.setScale(isBoss ? (bossNativeSheet ? BOSS_SCALE : BOSS_FALLBACK_SCALE) : ZOMBIE_SCALE);
  zombie.body.enable = true;
  zombie.body.moves = true;
  zombie.body.setAllowGravity(false);
  zombie.body.setImmovable(false);
  zombie.body.setDrag(0);
  zombie.body.setMaxVelocity(600, 600);
  if (bossNativeSheet) {
    zombie.body.setSize(BOSS_BODY_W, BOSS_BODY_H);
    zombie.body.setOffset((BOSS_FRAME_W - BOSS_BODY_W) / 2, BOSS_FEET_Y - BOSS_BODY_H);
  } else {
    zombie.body.setSize(90, 170);
    zombie.body.setOffset(127, 120);
  }
  zombie.setCollideWorldBounds(false);
  zombie.zombieType = type;
  zombie.maxHp = isBoss ? BOSS_MAX_HP : isShooter ? SHOOTER_MAX_HP : ZOMBIE_MAX_HP;
  zombie.hp = zombie.maxHp;
  zombie.moveSpeed = isBoss
    ? Phaser.Math.Between(BOSS_SPEED_MIN, BOSS_SPEED_MAX)
    : isShooter
      ? Phaser.Math.Between(SHOOTER_SPEED_MIN, SHOOTER_SPEED_MAX)
      : Phaser.Math.Between(ZOMBIE_SPEED_MIN, ZOMBIE_SPEED_MAX);
  zombie.facing = 'right';
  zombie.walkAnim = animKey;
  zombie.fireRateMs = isBoss ? null : SHOOTER_FIRE_RATE_MS;
  zombie.nextShotAt = isBoss
    ? scene.time.now + Phaser.Math.Between(2500, 4000)
    : scene.time.now + Phaser.Math.Between(400, 1200);
  zombie.bossPhase = isBoss ? 'chase' : null;
  zombie.isTelegraphing = false;
  zombie.isCharging = false;
  zombie.isRecovering = false;
  zombie.phaseUntil = 0;
  zombie.chargeUntil = 0;
  zombie.nextChargeAt = isBoss
    ? scene.time.now + Phaser.Math.Between(2800, 3800)
    : 0;
  zombie.chargeAngle = 0;
  zombie.isAttacking = false;
  zombie.attackUntil = 0;
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

    if (zombie.zombieType === ZOMBIE_TYPE_SHOOTER) {
      // Keep mid-range and shoot; don't just rush the player.
      if (dist > SHOOTER_IDEAL_RANGE) {
        zombie.body.setVelocity(
          Math.cos(angle) * zombie.moveSpeed,
          Math.sin(angle) * zombie.moveSpeed,
        );
      } else if (dist < SHOOTER_STOP_RANGE) {
        zombie.body.setVelocity(
          Math.cos(angle) * -zombie.moveSpeed * 0.7,
          Math.sin(angle) * -zombie.moveSpeed * 0.7,
        );
      } else {
        zombie.body.setVelocity(0, 0);
      }

      if (typeof onShooterFire === 'function' && time >= zombie.nextShotAt) {
        onShooterFire(zombie, angle);
        zombie.nextShotAt = time + (zombie.fireRateMs || SHOOTER_FIRE_RATE_MS);
      }
    } else if (zombie.zombieType === ZOMBIE_TYPE_BOSS) {
      updateBoss(zombie, player, time, angle, onShooterFire);
    } else {
      zombie.body.setVelocity(
        Math.cos(angle) * zombie.moveSpeed,
        Math.sin(angle) * zombie.moveSpeed,
      );
    }

    if (zombie.zombieType !== ZOMBIE_TYPE_BOSS) {
      // Hysteresis so facing doesn't flicker when nearly aligned on X.
      const dx = player.x - zombie.x;
      if (dx < -10) zombie.facing = 'left';
      else if (dx > 10) zombie.facing = 'right';

      zombie.setFlipX(zombie.facing === 'left');
      const animKey = zombie.walkAnim || ZOMBIE_WALK_RIGHT;
      if (zombie.anims?.currentAnim?.key !== animKey || !zombie.anims.isPlaying) {
        zombie.anims.play(animKey, true);
      }
    }

    drawZombieHealthBar(zombie);
  });
}

function updateBoss(zombie, player, time, angle, onShooterFire) {
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
  cancelZombieFlash(zombie);
  zombie.clearTint();
  if (zombie.zombieType === ZOMBIE_TYPE_BOSS) resetBossScale(zombie);
  zombie.bossPhase = null;
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
