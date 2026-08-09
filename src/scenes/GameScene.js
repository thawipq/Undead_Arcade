import { getSavedFaceDataUrl } from '../facePixelate.js';
import {
  buildSoldierAnim,
  createSoldierAnims,
  playSoldierIdle,
  playSoldierWalk,
  preloadSoldierSheet,
} from '../soldierAnim.js';
import { createMenuButton } from '../ui/menuButtons.js';
import { PIXEL_FONT, formatTime } from '../ui/fonts.js';
import {
  BOSS_UNLOCK_MS,
  SPAWN_STOP_MS,
  MAX_SHOOTERS_ALIVE,
  SHOOTER_BULLET_SPEED,
  SHOOTER_SPAWN_INTERVAL_MS,
  SHOOTER_UNLOCK_MS,
  ZOMBIE_TYPE_BOSS,
  ZOMBIE_TYPE_SHOOTER,
  buildZombieSheet,
  clearZombies,
  countActiveZombies,
  createZombieGroup,
  damageZombie,
  preloadZombieSheet,
  spawnCountForElapsed,
  spawnIntervalForElapsed,
  spawnZombie,
  updateZombies,
} from '../zombies.js';

const PLAYER_SPEED = 155;
const BULLET_SPEED = 520;
const FIRE_RATE_MS = 420;
const PLAYER_MAX_HP = 3;
const PLAYER_IFRAME_MS = 1000;
const PLAYER_KNOCKBACK = 220;
const MAG_SIZE = 8;
const RELOAD_MS = 1100;
const CLEAR_FIRE_RATE_MULT = 0.9; // +10% shooting speed
const CLEAR_MAG_BONUS = 4;

// Fallback world size when no custom map image is present.
const DEFAULT_WORLD_WIDTH = 3840;
const DEFAULT_WORLD_HEIGHT = 2160;

// Drop your art here: public/assets/Map.png (world size = image size).
const MAP_KEY = 'level-map';
const MAP_PATH = 'assets/Map.png?v=3';

const BGM_KEY = 'level-bgm';
const BGM_PATH = 'assets/music/Level 1 loop.mp3';
const BOSS_BGM_KEY = 'boss-bgm';
const BOSS_BGM_PATH = 'assets/music/bossbattle.mp3';
const GUN_SFX_KEY = 'gunshot';
const GUN_SFX_PATH = 'assets/sfx/gunshot.wav';
const HURT_SFX_KEY = 'hurt';
const HURT_SFX_PATH = 'assets/sfx/hurt.wav';
const RELOAD_SFX_KEY = 'reload';
const RELOAD_SFX_PATH = 'assets/sfx/reload.wav';
const ZOMBIE_DEATH_SFX_KEY = 'zombie-death';
const ZOMBIE_DEATH_SFX_PATH = 'assets/sfx/zombiedeath.mp3';
const BOSS_DEATH_SFX_KEY = 'zombie-boss-death';
const BOSS_DEATH_SFX_PATH = 'assets/sfx/zombieboss1death.mp3';
const ALARM_SFX_KEY = 'boss-warning';
const ALARM_SFX_PATH = 'assets/sfx/bosswarning.wav';
/** Warning banner + alarm hold before the boss actually spawns. */
const BOSS_WARNING_MS = 4000;

// Player size — set back to PLAYER_SCALE_BASE if this causes glitches.
const PLAYER_SCALE_BASE = 0.28;
const PLAYER_SCALE = 0.31;

// Gun tip relative to player center (calibrated at PLAYER_SCALE_BASE).
const GUN_TIP_BASE = {
  right: { x: 47, y: -8 },
  left: { x: -47, y: -8 },
};
const GUN_TIP_SCALE = PLAYER_SCALE / PLAYER_SCALE_BASE;
const GUN_TIP = {
  right: {
    x: GUN_TIP_BASE.right.x * GUN_TIP_SCALE,
    y: GUN_TIP_BASE.right.y * GUN_TIP_SCALE,
  },
  left: {
    x: GUN_TIP_BASE.left.x * GUN_TIP_SCALE,
    y: GUN_TIP_BASE.left.y * GUN_TIP_SCALE,
  },
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.createBulletTexture();
    this.createBoneTexture();
    this.createMuzzleTextures();
    preloadZombieSheet(this);
    preloadSoldierSheet(this);
    // Optional custom scene art — ignored if the file is missing.
    // Filename is case-sensitive in Vite (Map.png ≠ map.png).
    if (this.textures.exists(MAP_KEY)) {
      this.textures.remove(MAP_KEY);
    }
    this.load.image(MAP_KEY, MAP_PATH);
    if (!this.cache.audio.exists(BGM_KEY)) {
      this.load.audio(BGM_KEY, BGM_PATH);
    }
    if (!this.cache.audio.exists(BOSS_BGM_KEY)) {
      this.load.audio(BOSS_BGM_KEY, BOSS_BGM_PATH);
    }
    if (!this.cache.audio.exists(GUN_SFX_KEY)) {
      this.load.audio(GUN_SFX_KEY, GUN_SFX_PATH);
    }
    if (!this.cache.audio.exists(HURT_SFX_KEY)) {
      this.load.audio(HURT_SFX_KEY, HURT_SFX_PATH);
    }
    if (!this.cache.audio.exists(RELOAD_SFX_KEY)) {
      this.load.audio(RELOAD_SFX_KEY, RELOAD_SFX_PATH);
    }
    if (!this.cache.audio.exists(ZOMBIE_DEATH_SFX_KEY)) {
      this.load.audio(ZOMBIE_DEATH_SFX_KEY, ZOMBIE_DEATH_SFX_PATH);
    }
    if (!this.cache.audio.exists(BOSS_DEATH_SFX_KEY)) {
      this.load.audio(BOSS_DEATH_SFX_KEY, BOSS_DEATH_SFX_PATH);
    }
    if (!this.cache.audio.exists(ALARM_SFX_KEY)) {
      this.load.audio(ALARM_SFX_KEY, ALARM_SFX_PATH);
    }
  }

  async create() {
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.pauseUi = null;
    this.rewardUi = null;
    this.player = null;
    this.ready = false;
    this.killCount = 0;
    this.runStartedAt = 0;
    this.nextSpawnAt = 0;
    this.nextShooterSpawnAt = 0;
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.bossSpawnAt = 0;
    this.clearRewardGiven = false;
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.magSize = MAG_SIZE;
    this.fireRateMs = FIRE_RATE_MS;
    this.ammo = MAG_SIZE;
    this.reloading = false;
    this.reloadUntil = 0;
    this.heartTexts = [];
    this.bgm = null;
    this.bossBgm = null;

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 40,
      runChildUpdate: false,
    });
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 40,
      runChildUpdate: false,
    });
    this.zombies = createZombieGroup(this);

    // Reuse baked soldier if present — avoid rebuild races on scene re-entry.
    let ready = this.textures.exists('soldier');
    if (!ready) {
      ready = await buildSoldierAnim(this, getSavedFaceDataUrl());
    } else {
      createSoldierAnims(this);
    }

    if (!ready || !this.textures.exists('soldier')) {
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'Missing Mainbody.png\nEsc for menu', {
          fontFamily: PIXEL_FONT,
          fontSize: '20px',
          color: '#e08a8a',
          align: 'center',
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.input.keyboard.once('keydown-ESC', () => {
        this.scene.start('MenuScene');
      });
      return;
    }

    this.setupWorld();
    buildZombieSheet(this);

    this.facing = 'right';
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'soldier',
      0,
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setScale(PLAYER_SCALE);
    this.player.setSize(90, 170);
    this.player.setOffset(127, 120);
    playSoldierIdle(this.player, this.facing);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    });

    this.lastFired = 0;
    this.testerMode = this.registry.get('testerMode') || null;
    this.registry.remove('testerMode');
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.magSize = MAG_SIZE;
    this.fireRateMs = FIRE_RATE_MS;
    this.ammo = MAG_SIZE;
    this.reloading = false;
    this.reloadUntil = 0;
    this.clearRewardGiven = false;
    this.choosingReward = false;
    this.resetRunTimers();
    this.ready = true;

    this.createHeartHud();
    this.createAmmoHud();

    this.add
      .text(16, 44, 'WASD move · Mouse aim · Click shoot · R reload · Esc pause', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#c8d2dc',
        lineSpacing: 8,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.timerText = this.add
      .text(this.scale.width / 2, 18, '00:00', {
        fontFamily: PIXEL_FONT,
        fontSize: '18px',
        color: '#ffe066',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.killText = this.add
      .text(this.scale.width - 16, 16, 'Kills: 0', {
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        color: '#c8d2dc',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.physics.add.overlap(this.bullets, this.zombies, (bullet, zombie) => {
      this.onBulletHitZombie(bullet, zombie);
    });
    this.physics.add.overlap(this.player, this.zombies, (_player, zombie) => {
      this.hurtPlayer(zombie);
    });
    this.physics.add.overlap(this.player, this.enemyBullets, (_player, bullet) => {
      this.onEnemyBulletHitPlayer(bullet);
    });

    this.startBgm();

    this.onEsc = () => {
      if (this.dead || this.choosingReward) return;
      if (this.paused) this.resumeGame();
      else this.pauseGame();
    };
    this.input.keyboard.on('keydown-ESC', this.onEsc);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC', this.onEsc);
      this.closeBossWarningUi();
      this.stopAlarmSfx();
      this.stopBgm();
      this.player = null;
      this.ready = false;
    });
  }

  startBgm() {
    this.stopBossBgm();
    if (!this.cache.audio.exists(BGM_KEY)) return;
    if (this.sound.get(BGM_KEY)) {
      this.bgm = this.sound.get(BGM_KEY);
    } else {
      this.bgm = this.sound.add(BGM_KEY, { loop: true, volume: 0.4 });
    }
    if (!this.bgm.isPlaying) {
      this.sound.unlock();
      this.bgm.play();
    }
  }

  startBossBgm() {
    this.stopBgm(false);
    if (!this.cache.audio.exists(BOSS_BGM_KEY)) return;
    if (this.bossBgm?.isPlaying) return;

    if (this.sound.get(BOSS_BGM_KEY)) {
      this.bossBgm = this.sound.get(BOSS_BGM_KEY);
    } else {
      this.bossBgm = this.sound.add(BOSS_BGM_KEY, { loop: true, volume: 0.45 });
    }
    this.sound.unlock();
    if (this.bossBgm.isPaused) this.bossBgm.resume();
    else if (!this.bossBgm.isPlaying) this.bossBgm.play();
  }

  pauseBgm() {
    if (this.bossBgm?.isPlaying) this.bossBgm.pause();
    else if (this.bgm?.isPlaying) this.bgm.pause();
  }

  resumeBgm() {
    if (this.bossBgm) {
      if (this.bossBgm.isPaused) this.bossBgm.resume();
      else if (!this.bossBgm.isPlaying) this.bossBgm.play();
      return;
    }
    if (this.bgm?.isPaused) this.bgm.resume();
    else if (this.bgm && !this.bgm.isPlaying) this.bgm.play();
  }

  stopBgm(clearBoss = true) {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
    if (clearBoss) this.stopBossBgm();
  }

  stopBossBgm() {
    if (!this.bossBgm) return;
    if (this.bossBgm.isPlaying || this.bossBgm.isPaused) this.bossBgm.stop();
    this.bossBgm = null;
  }

  update(time) {
    if (!this.ready) return;
    this.updateTimer(time);

    if (
      this.paused ||
      this.choosingReward ||
      this.dead ||
      !this.player?.active ||
      !this.player.body
    ) {
      return;
    }
    this.handleMovement();
    this.updateFacingAndAnimation();
    this.handleReload(time);
    this.handleShooting(time);
    // Reward before boss warning so a clear at 1:30 isn't stolen by the alarm.
    this.checkClearMapReward();
    this.handleZombieSpawns(time);
    updateZombies(this.zombies, this.player, time, (zombie, angle) => {
      this.fireEnemyBullet(zombie, angle);
    });
    this.cleanupBullets();
    this.cleanupEnemyBullets();
  }

  resetRunTimers() {
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.bossSpawnAt = 0;
    this.clearRewardGiven = false;
    this.stopAlarmSfx();
    if (this.testerMode === 'boss') {
      // Jump straight to boss warning for testers (skip arena reward).
      this.runStartedAt = this.time.now - BOSS_UNLOCK_MS;
      this.nextSpawnAt = Number.POSITIVE_INFINITY;
      this.nextShooterSpawnAt = Number.POSITIVE_INFINITY;
      this.clearRewardGiven = true;
      return;
    }
    this.runStartedAt = this.time.now;
    this.nextSpawnAt = this.time.now + 900;
    this.nextShooterSpawnAt = this.time.now + SHOOTER_UNLOCK_MS;
  }

  getElapsedMs(time = this.time.now) {
    return Math.max(0, time - this.runStartedAt);
  }

  updateTimer(time) {
    if (!this.timerText) return;
    // Freeze the clock while paused, choosing a reward, or dead.
    if (this.paused || this.choosingReward || this.dead) return;
    this.timerText.setText(formatTime(this.getElapsedMs(time)));
  }

  handleZombieSpawns(time) {
    const elapsed = time - this.runStartedAt;

    // Don't start the boss while the clear-reward picker is open.
    if (this.choosingReward) return;

    // Boss warning, then spawn after a short alarm window.
    // Hard gate: no warning/spawn until the arena reward has been picked.
    if (elapsed >= BOSS_UNLOCK_MS) {
      if (!this.clearRewardGiven) {
        if (countActiveZombies(this.zombies) === 0) {
          this.offerClearMapReward();
        }
        // Wait for clear + pick — do not spawn the boss yet.
        return;
      }

      if (!this.bossWarningShown) {
        this.bossWarningShown = true;
        this.bossSpawnAt = time + BOSS_WARNING_MS;
        // Cut level music under the alarm / boss intro.
        if (this.bgm?.isPlaying) this.bgm.stop();
        this.showBossWarningBanner();
        this.playAlarmSfx();
      } else if (!this.bossSpawned && time >= this.bossSpawnAt) {
        const boss = spawnZombie(this, this.zombies, ZOMBIE_TYPE_BOSS);
        if (boss) {
          this.bossSpawned = true;
          this.stopAlarmSfx();
          this.startBossBgm();
          this.showBossBanner();
        }
      }
      return;
    }

    // From 1:00, stop new walkers/shooters so the player can clear the map.
    if (elapsed >= SPAWN_STOP_MS) return;

    if (time >= this.nextSpawnAt) {
      const count = spawnCountForElapsed(elapsed);
      for (let i = 0; i < count; i += 1) {
        spawnZombie(this, this.zombies);
      }
      this.nextSpawnAt = time + spawnIntervalForElapsed(elapsed);
    }

    if (elapsed >= SHOOTER_UNLOCK_MS && time >= this.nextShooterSpawnAt) {
      const shootersAlive = countActiveZombies(this.zombies, ZOMBIE_TYPE_SHOOTER);
      if (shootersAlive < MAX_SHOOTERS_ALIVE) {
        spawnZombie(this, this.zombies, ZOMBIE_TYPE_SHOOTER);
        this.nextShooterSpawnAt = time + SHOOTER_SPAWN_INTERVAL_MS;
      } else {
        // At cap — check again soon so a slot can refill after one dies.
        this.nextShooterSpawnAt = time + 500;
      }
    }
  }

  showBossWarningBanner() {
    const { width, height } = this.scale;

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x1a0808, 0.45)
      .setScrollFactor(0)
      .setDepth(900)
      .setAlpha(0);

    const panel = this.add
      .rectangle(width / 2, height / 2, 460, 150, 0x2a1212, 0.95)
      .setStrokeStyle(3, 0xe05a5a)
      .setScrollFactor(0)
      .setDepth(901)
      .setAlpha(0);

    const title = this.add
      .text(width / 2, height / 2 - 28, 'WARNING', {
        fontFamily: PIXEL_FONT,
        fontSize: '28px',
        color: '#ffe066',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(902)
      .setAlpha(0);

    const subtitle = this.add
      .text(width / 2, height / 2 + 22, 'BOSS APPROACHING', {
        fontFamily: PIXEL_FONT,
        fontSize: '14px',
        color: '#e08a8a',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(902)
      .setAlpha(0);

    const nodes = [dim, panel, title, subtitle];
    this.bossWarningUi = nodes;

    this.tweens.add({
      targets: nodes,
      alpha: 1,
      duration: 200,
    });

    // Slow pulse — ~1s per full flash cycle.
    const flashMs = 500;
    this.tweens.add({
      targets: [title, subtitle, panel],
      alpha: 0.45,
      duration: flashMs,
      yoyo: true,
      repeat: Math.max(0, Math.floor(BOSS_WARNING_MS / (flashMs * 2)) - 1),
    });

    this.time.delayedCall(BOSS_WARNING_MS - 250, () => {
      if (!this.sys?.isActive()) return;
      this.tweens.add({
        targets: nodes,
        alpha: 0,
        duration: 220,
        onComplete: () => this.closeBossWarningUi(),
      });
    });
  }

  closeBossWarningUi() {
    if (!this.bossWarningUi) return;
    this.bossWarningUi.forEach((node) => {
      this.tweens.killTweensOf(node);
      node?.destroy?.();
    });
    this.bossWarningUi = null;
  }

  playAlarmSfx() {
    this.stopAlarmSfx();
    if (!this.cache.audio.exists(ALARM_SFX_KEY)) return;
    this.sound.unlock();
    this.alarmSfx = this.sound.add(ALARM_SFX_KEY, {
      volume: 0.55,
      loop: true,
    });
    this.alarmSfx.play();
  }

  stopAlarmSfx() {
    if (!this.alarmSfx) return;
    if (this.alarmSfx.isPlaying) this.alarmSfx.stop();
    this.alarmSfx.destroy();
    this.alarmSfx = null;
  }

  showBossBanner() {
    const { width } = this.scale;
    const banner = this.add
      .text(width / 2, 64, 'BOSS', {
        fontFamily: PIXEL_FONT,
        fontSize: '22px',
        color: '#e08a8a',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(120)
      .setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 250,
      yoyo: true,
      hold: 1200,
      onComplete: () => banner.destroy(),
    });
  }

  fireEnemyBullet(zombie, angle) {
    if (!zombie?.active || !this.enemyBullets) return;

    const isBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
    // Wider angular gaps so the player can slip between bones.
    const spreads = isBoss ? [-0.78, -0.39, 0, 0.39, 0.78] : [0];
    const scale = isBoss ? 1.35 : 1;

    spreads.forEach((spread) => {
      const bone = this.enemyBullets.get(zombie.x, zombie.y, 'enemy-bone');
      if (!bone) return;

      const shotAngle = angle + spread;
      bone.setActive(true);
      bone.setVisible(true);
      bone.setDepth(6);
      bone.setScale(scale);
      bone.body.enable = true;
      this.physics.velocityFromRotation(
        shotAngle,
        SHOOTER_BULLET_SPEED * (isBoss ? 1.35 : 1),
        bone.body.velocity,
      );
      bone.setRotation(shotAngle + 0.4);
      // Spin while in flight so it reads as a thrown bone.
      bone.spinSpeed = (zombie.facing === 'left' ? -1 : 1) * (isBoss ? 0.24 : 0.18);
    });
  }

  onEnemyBulletHitPlayer(bone) {
    if (this.dead || this.paused) return;
    const src = bone?.active
      ? { x: bone.x - (bone.body?.velocity.x || 0), y: bone.y - (bone.body?.velocity.y || 0) }
      : null;
    if (bone?.active) {
      bone.setActive(false);
      bone.setVisible(false);
      bone.body?.stop();
      if (bone.body) bone.body.enable = false;
      bone.spinSpeed = 0;
    }
    this.hurtPlayer(src);
  }

  onBulletHitZombie(bullet, zombie) {
    if (this.dead || !bullet.active || !zombie.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body?.stop();
    if (bullet.body) bullet.body.enable = false;

    const wasBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
    const died = damageZombie(zombie);
    if (died) {
      this.killCount += 1;
      this.killText?.setText(`Kills: ${this.killCount}`);
      this.playZombieDeathSfx(wasBoss);
    }
  }

  playZombieDeathSfx(isBoss = false) {
    const key = isBoss ? BOSS_DEATH_SFX_KEY : ZOMBIE_DEATH_SFX_KEY;
    if (!this.cache.audio.exists(key)) return;
    this.sound.unlock();
    this.sound.play(key, {
      volume: isBoss ? 0.7 : 0.5,
      rate: isBoss ? 1 : 0.92 + Math.random() * 0.16,
    });
  }

  createHeartHud() {
    // Drawn hearts (pixel font often lacks ♥ glyphs).
    if (!this.textures.exists('ui-heart')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe05a5a, 1);
      g.fillCircle(5, 5, 5);
      g.fillCircle(13, 5, 5);
      g.fillTriangle(0, 7, 18, 7, 9, 17);
      g.generateTexture('ui-heart', 18, 18);
      g.destroy();
    }
    if (!this.textures.exists('ui-heart-empty')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x3a2a2a, 1);
      g.fillCircle(5, 5, 5);
      g.fillCircle(13, 5, 5);
      g.fillTriangle(0, 7, 18, 7, 9, 17);
      g.generateTexture('ui-heart-empty', 18, 18);
      g.destroy();
    }

    this.heartTexts = [];
    for (let i = 0; i < PLAYER_MAX_HP; i += 1) {
      const heart = this.add
        .image(22 + i * 26, 22, 'ui-heart')
        .setScrollFactor(0)
        .setDepth(100)
        .setScale(1.1);
      this.heartTexts.push(heart);
    }
    this.refreshHeartHud();
  }

  refreshHeartHud() {
    this.heartTexts?.forEach((heart, i) => {
      heart.setTexture(i < this.playerHp ? 'ui-heart' : 'ui-heart-empty');
      heart.setAlpha(i < this.playerHp ? 1 : 0.55);
    });
  }

  createAmmoHud() {
    this.ammoText = this.add
      .text(16, 68, '', {
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        color: '#c8d2dc',
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.reloadHintText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'PRESS R TO RELOAD', {
        fontFamily: PIXEL_FONT,
        fontSize: '16px',
        color: '#ffe066',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(150)
      .setAlpha(0)
      .setVisible(false);

    this.refreshAmmoHud();
  }

  refreshAmmoHud() {
    if (!this.ammoText) return;
    if (this.reloading) {
      this.ammoText.setColor('#e0b35a');
      this.ammoText.setText('RELOADING...');
      this.hideReloadHint();
      return;
    }
    const empty = this.ammo <= 0;
    this.ammoText.setColor(empty ? '#e08a8a' : '#c8d2dc');
    const mag = this.magSize || MAG_SIZE;
    this.ammoText.setText(`AMMO ${this.ammo}/${mag}`);
    if (!empty) this.hideReloadHint();
  }

  showReloadHint() {
    if (!this.reloadHintText || this.reloading) return;
    this.reloadHintText.setVisible(true);
    this.tweens.killTweensOf(this.reloadHintText);
    this.reloadHintText.setAlpha(1);
    this.tweens.add({
      targets: this.reloadHintText,
      alpha: 0.35,
      duration: 280,
      yoyo: true,
      repeat: -1,
    });
  }

  hideReloadHint() {
    if (!this.reloadHintText) return;
    this.tweens.killTweensOf(this.reloadHintText);
    this.reloadHintText.setVisible(false);
    this.reloadHintText.setAlpha(0);
  }

  hurtPlayer(source = null) {
    if (this.dead || this.paused || this.choosingReward || !this.player?.active) return;
    // Tester boss mode: god mode.
    if (this.testerMode === 'boss') return;
    if (this.time.now < this.invincibleUntil) return;

    this.playerHp -= 1;
    this.refreshHeartHud();
    this.invincibleUntil = this.time.now + PLAYER_IFRAME_MS;
    this.playHurtSfx();

    if (source?.x != null && source?.y != null) {
      const angle = Phaser.Math.Angle.Between(source.x, source.y, this.player.x, this.player.y);
      this.player.setVelocity(
        Math.cos(angle) * PLAYER_KNOCKBACK,
        Math.sin(angle) * PLAYER_KNOCKBACK,
      );
    }

    this.player.setTint(0xff6666);
    this.cameras.main.shake(140, 0.005);
    this.time.delayedCall(PLAYER_IFRAME_MS, () => {
      if (this.player?.active && !this.dead) this.player.clearTint();
    });

    this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
      repeat: Math.floor(PLAYER_IFRAME_MS / 160),
      onComplete: () => {
        if (this.player?.active) this.player.setAlpha(1);
      },
    });

    if (this.playerHp <= 0) {
      this.killPlayer();
    }
  }

  playHurtSfx() {
    if (!this.cache.audio.exists(HURT_SFX_KEY)) return;
    this.sound.unlock();
    this.sound.play(HURT_SFX_KEY, { volume: 0.55 });
  }

  killPlayer() {
    if (this.dead || this.paused || !this.player?.active) return;

    this.dead = true;
    this.playerHp = 0;
    this.refreshHeartHud();
    this.player.setVelocity(0, 0);
    this.player.setAlpha(1);
    this.player.anims?.stop();
    this.player.setTint(0x772222);
    this.physics.world.pause();

    const { width, height } = this.scale;

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1018, 0.78)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 360, 260, 0x152031, 0.98)
      .setStrokeStyle(2, 0x5a3030)
      .setScrollFactor(0)
      .setDepth(1001);

    const survived = formatTime(this.getElapsedMs());
    this.timerText?.setText(survived);

    const title = this.add
      .text(width / 2, height / 2 - 78, 'YOU DIED', {
        fontFamily: PIXEL_FONT,
        fontSize: '22px',
        color: '#e08a8a',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const subtitle = this.add
      .text(width / 2, height / 2 - 28, `Time ${survived}\nKills ${this.killCount}`, {
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        color: '#8fa3b8',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const restartBtn = createMenuButton(this, width / 2, height / 2 + 36, 'RESTART', {
      fontSize: '14px',
      color: '#0b0f14',
      backgroundColor: '#7dba5a',
      hoverColor: '#93d06d',
      padding: { x: 22, y: 12 },
    }).setScrollFactor(0).setDepth(1003);

    const menuBtn = createMenuButton(this, width / 2, height / 2 + 96, 'MAIN MENU', {
      fontSize: '14px',
      backgroundColor: '#3a2a2a',
      hoverColor: '#523838',
      padding: { x: 22, y: 12 },
    }).setScrollFactor(0).setDepth(1003);

    const runAction = (action) => {
      window.setTimeout(() => {
        if (!this.sys?.isActive()) return;
        action();
      }, 0);
    };

    restartBtn.on('pointerdown', () => runAction(() => this.restartGame()));
    menuBtn.on('pointerdown', () => runAction(() => this.returnToMenu()));

    this.pauseUi = [dim, panel, title, subtitle, restartBtn, menuBtn];
  }

  pauseGame() {
    if (this.paused || this.choosingReward || this.dead || !this.player) return;

    this.paused = true;
    this.pausedAt = this.time.now;
    // Pause the world only — keep velocities so bullets resume mid-flight.
    this.physics.world.pause();
    this.player.anims?.pause();
    this.pauseBgm();
    if (this.alarmSfx?.isPlaying) this.alarmSfx.pause();

    const { width, height } = this.scale;
    // Keep pause UI as top-level objects (not a Container) so clicks register
    // correctly with a scrolling camera.
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1018, 0.72)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 360, 320, 0x152031, 0.98)
      .setStrokeStyle(2, 0x314155)
      .setScrollFactor(0)
      .setDepth(1001);

    const title = this.add
      .text(width / 2, height / 2 - 108, 'PAUSED', {
        fontFamily: PIXEL_FONT,
        fontSize: '22px',
        color: '#e8eef5',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const resumeBtn = createMenuButton(this, width / 2, height / 2 - 38, 'RESUME', {
      fontSize: '14px',
      backgroundColor: '#3d6f9c',
      hoverColor: '#4d84b6',
      padding: { x: 22, y: 12 },
    }).setScrollFactor(0).setDepth(1003);

    const restartBtn = createMenuButton(this, width / 2, height / 2 + 22, 'RESTART', {
      fontSize: '14px',
      color: '#0b0f14',
      backgroundColor: '#7dba5a',
      hoverColor: '#93d06d',
      padding: { x: 22, y: 12 },
    }).setScrollFactor(0).setDepth(1003);

    const menuBtn = createMenuButton(this, width / 2, height / 2 + 82, 'MAIN MENU', {
      fontSize: '14px',
      backgroundColor: '#3a2a2a',
      hoverColor: '#523838',
      padding: { x: 22, y: 12 },
    }).setScrollFactor(0).setDepth(1003);

    const hint = this.add
      .text(width / 2, height / 2 + 132, 'Esc to resume', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#6d8299',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const runPauseAction = (action) => {
      // Defer so we don't destroy the button mid-pointer event.
      window.setTimeout(() => {
        if (!this.sys?.isActive()) return;
        action();
      }, 0);
    };

    resumeBtn.on('pointerdown', () => runPauseAction(() => this.resumeGame()));
    restartBtn.on('pointerdown', () => runPauseAction(() => this.restartGame()));
    menuBtn.on('pointerdown', () => runPauseAction(() => this.returnToMenu()));

    this.pauseUi = [dim, panel, title, resumeBtn, restartBtn, menuBtn, hint];
  }

  closePauseUi() {
    if (!this.pauseUi) return;
    this.pauseUi.forEach((node) => node?.destroy?.());
    this.pauseUi = null;
  }

  closeRewardUi() {
    if (!this.rewardUi) return;
    this.rewardUi.forEach((node) => node?.destroy?.());
    this.rewardUi = null;
  }

  shiftZombieTimers(dt) {
    this.zombies?.children.each((zombie) => {
      if (!zombie.active) return;
      if (zombie.nextShotAt) zombie.nextShotAt += dt;
      if (zombie.nextChargeAt) zombie.nextChargeAt += dt;
      if (zombie.phaseUntil) zombie.phaseUntil += dt;
      if (zombie.attackUntil) zombie.attackUntil += dt;
      if (zombie.chargeUntil) zombie.chargeUntil += dt;
    });
  }

  resumeGame() {
    if (!this.paused) return;

    if (this.pausedAt) {
      this.applyPausedTimeShift(this.time.now - this.pausedAt);
      this.pausedAt = 0;
    }

    this.paused = false;
    this.closePauseUi();
    this.physics.world.resume();
    this.player?.anims?.resume();
    this.resumeBgm();
    if (this.alarmSfx?.isPaused) this.alarmSfx.resume();
  }

  applyPausedTimeShift(dt) {
    this.runStartedAt += dt;
    this.nextSpawnAt += dt;
    this.nextShooterSpawnAt += dt;
    if (this.bossSpawnAt) this.bossSpawnAt += dt;
    if (this.reloading) this.reloadUntil += dt;
    this.invincibleUntil += dt;
    this.shiftZombieTimers(dt);
  }

  restartGame() {
    // Soft reset — scene.restart() races with async create and crashes.
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.pausedAt = 0;
    this.closePauseUi();
    this.closeRewardUi();
    this.closeBossWarningUi();
    this.stopAlarmSfx();
    this.stopBossBgm();
    this.physics.world.resume();
    this.startBgm();

    if (!this.player) return;

    this.player.setActive(true);
    this.player.setVisible(true);
    this.player.clearTint();
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.worldWidth / 2, this.worldHeight / 2);
    this.cameras.main.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    this.facing = 'right';
    playSoldierIdle(this.player, this.facing);
    this.lastFired = 0;
    this.killCount = 0;
    this.killText?.setText('Kills: 0');
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.magSize = MAG_SIZE;
    this.fireRateMs = FIRE_RATE_MS;
    this.ammo = MAG_SIZE;
    this.reloading = false;
    this.reloadUntil = 0;
    this.clearRewardGiven = false;
    this.refreshHeartHud();
    this.refreshAmmoHud();
    this.resetRunTimers();
    this.timerText?.setText(formatTime(this.getElapsedMs()));

    this.bullets.children.each((bullet) => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body?.stop();
      if (bullet.body) bullet.body.enable = false;
    });
    this.enemyBullets?.children.each((bullet) => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body?.stop();
      if (bullet.body) bullet.body.enable = false;
    });
    clearZombies(this.zombies);
  }

  returnToMenu() {
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.pausedAt = 0;
    this.closePauseUi();
    this.closeRewardUi();
    this.closeBossWarningUi();
    this.stopAlarmSfx();
    this.stopBgm();
    this.physics.world.resume();
    this.scene.start('MenuScene');
  }

  handleMovement() {
    const left = this.cursors.left.isDown || this.keys.a.isDown;
    const right = this.cursors.right.isDown || this.keys.d.isDown;
    const up = this.cursors.up.isDown || this.keys.w.isDown;
    const down = this.cursors.down.isDown || this.keys.s.isDown;

    let vx = 0;
    let vy = 0;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const velocity = new Phaser.Math.Vector2(vx, vy);
    if (velocity.lengthSq() > 0) {
      velocity.normalize().scale(PLAYER_SPEED);
    }

    this.player.setVelocity(velocity.x, velocity.y);
  }

  updateFacingAndAnimation() {
    const pointer = this.input.activePointer;
    this.facing = pointer.worldX < this.player.x ? 'left' : 'right';

    const moving =
      Math.abs(this.player.body.velocity.x) > 1 ||
      Math.abs(this.player.body.velocity.y) > 1;

    if (moving) {
      playSoldierWalk(this.player, this.facing);
    } else {
      playSoldierIdle(this.player, this.facing);
    }
  }

  handleReload(time) {
    const mag = this.magSize || MAG_SIZE;
    if (this.reloading) {
      if (time >= this.reloadUntil) {
        this.reloading = false;
        this.ammo = mag;
        this.refreshAmmoHud();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.r) && this.ammo < mag) {
      this.startReload(time);
    }
  }

  startReload(time) {
    const mag = this.magSize || MAG_SIZE;
    if (this.reloading || this.ammo >= mag) return;
    this.reloading = true;
    this.reloadUntil = time + RELOAD_MS;
    this.hideReloadHint();
    this.refreshAmmoHud();
    if (this.cache.audio.exists(RELOAD_SFX_KEY)) {
      this.sound.unlock();
      this.sound.play(RELOAD_SFX_KEY, { volume: 0.4 });
    }
  }

  handleShooting(time) {
    if (this.reloading) return;

    const wantsToFire =
      this.input.activePointer.isDown || this.keys.space.isDown;

    if (!wantsToFire || time < this.lastFired + (this.fireRateMs || FIRE_RATE_MS)) {
      return;
    }

    if (this.ammo <= 0) {
      this.showReloadHint();
      this.lastFired = time;
      return;
    }

    this.hideReloadHint();
    this.fireBullet();
    this.lastFired = time;
  }

  fireBullet() {
    const tip = GUN_TIP[this.facing] || GUN_TIP.right;
    const muzzleX = this.player.x + tip.x;
    const muzzleY = this.player.y + tip.y;

    this.ammo = Math.max(0, this.ammo - 1);
    this.refreshAmmoHud();

    this.spawnMuzzleSpark(muzzleX, muzzleY, this.facing);
    this.playGunSfx();

    const bullet = this.bullets.get(muzzleX, muzzleY, 'bullet');
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setDepth(5);
    bullet.body.enable = true;

    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      muzzleX,
      muzzleY,
      pointer.worldX,
      pointer.worldY,
    );

    this.physics.velocityFromRotation(angle, BULLET_SPEED, bullet.body.velocity);
    bullet.setRotation(angle);
  }

  playGunSfx() {
    if (!this.cache.audio.exists(GUN_SFX_KEY)) return;
    this.sound.unlock();
    this.sound.play(GUN_SFX_KEY, {
      volume: 0.45,
      rate: 0.92 + Math.random() * 0.16,
    });
  }

  checkClearMapReward() {
    if (
      this.clearRewardGiven ||
      this.choosingReward ||
      this.bossWarningShown ||
      this.bossSpawned ||
      this.testerMode === 'boss'
    ) {
      return;
    }
    const elapsed = this.time.now - this.runStartedAt;
    // Offer as soon as the arena stop-spawning window begins and the map is empty.
    if (elapsed < SPAWN_STOP_MS) return;
    if (countActiveZombies(this.zombies) > 0) return;

    this.offerClearMapReward();
  }

  offerClearMapReward() {
    if (this.clearRewardGiven || this.choosingReward) return;
    this.openRewardChoice();
  }

  openRewardChoice() {
    if (this.choosingReward || this.dead || !this.player) return false;

    this.choosingReward = true;
    this.rewardOpenedAt = this.time.now;
    this.physics.world.pause();
    this.player.anims?.pause();
    this.player.setVelocity(0, 0);
    this.pauseBgm();
    this.hideReloadHint();

    const { width, height } = this.scale;
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1018, 0.72)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 420, 280, 0x152031, 0.98)
      .setStrokeStyle(2, 0x3d6f4a)
      .setScrollFactor(0)
      .setDepth(1001);

    const title = this.add
      .text(width / 2, height / 2 - 90, 'ARENA CLEARED', {
        fontFamily: PIXEL_FONT,
        fontSize: '18px',
        color: '#93d06d',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const subtitle = this.add
      .text(width / 2, height / 2 - 52, 'Pick a boss prep boost', {
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        color: '#8fa3b8',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const fireBtn = createMenuButton(
      this,
      width / 2,
      height / 2 + 8,
      '+10% FIRE RATE',
      {
        fontSize: '13px',
        color: '#0b0f14',
        backgroundColor: '#7dba5a',
        hoverColor: '#93d06d',
        padding: { x: 22, y: 12 },
      },
    ).setScrollFactor(0).setDepth(1003);

    const magBtn = createMenuButton(
      this,
      width / 2,
      height / 2 + 68,
      '+4 MAG SIZE',
      {
        fontSize: '13px',
        backgroundColor: '#3d6f9c',
        hoverColor: '#4d84b6',
        padding: { x: 22, y: 12 },
      },
    ).setScrollFactor(0).setDepth(1003);

    const pick = (reward) => {
      window.setTimeout(() => {
        if (!this.sys?.isActive()) return;
        this.applyClearReward(reward);
      }, 0);
    };

    fireBtn.on('pointerdown', () => pick('firerate'));
    magBtn.on('pointerdown', () => pick('mag'));

    this.rewardUi = [dim, panel, title, subtitle, fireBtn, magBtn];
    return true;
  }

  applyClearReward(reward) {
    if (!this.choosingReward) return;

    this.closeRewardChoice();

    if (reward === 'firerate') {
      this.fireRateMs = Math.round(FIRE_RATE_MS * CLEAR_FIRE_RATE_MULT);
    } else if (reward === 'mag') {
      this.magSize = MAG_SIZE + CLEAR_MAG_BONUS;
      this.ammo = this.magSize;
      this.reloading = false;
    }

    // Boss warning/spawn is gated on this flag.
    this.clearRewardGiven = true;
    this.refreshAmmoHud();
  }

  closeRewardChoice() {
    if (!this.choosingReward) return;

    if (this.rewardOpenedAt) {
      this.applyPausedTimeShift(this.time.now - this.rewardOpenedAt);
      this.rewardOpenedAt = 0;
    }

    this.choosingReward = false;
    this.closeRewardUi();
    this.physics.world.resume();
    this.player?.anims?.resume();
    this.resumeBgm();
  }

  spawnMuzzleSpark(x, y, facing) {
    // Fixed left/right only — does not track the mouse.
    const facingRight = facing !== 'left';
    const dir = facingRight ? 1 : -1;

    const flash = this.add.image(x, y, 'muzzle-flash');
    flash.setDepth(12);
    flash.setFlipX(!facingRight);
    flash.setOrigin(facingRight ? 0.15 : 0.85, 0.5);
    flash.setScale(0.75 + Math.random() * 0.25);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: flash.scaleX * 1.3,
      scaleY: flash.scaleY * 0.55,
      duration: 55,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });

    for (let i = 0; i < 5; i += 1) {
      const spark = this.add.image(x, y, 'muzzle-spark');
      spark.setDepth(13);
      spark.setScale(0.5 + Math.random() * 0.7);

      const dx = dir * (8 + Math.random() * 14);
      const dy = (Math.random() - 0.5) * 12;

      this.tweens.add({
        targets: spark,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        scale: 0,
        duration: 70 + Math.random() * 50,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  setupWorld() {
    if (this.textures.exists(MAP_KEY)) {
      const src = this.textures.get(MAP_KEY).getSourceImage();
      this.worldWidth = src.width || DEFAULT_WORLD_WIDTH;
      this.worldHeight = src.height || DEFAULT_WORLD_HEIGHT;

      this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
      this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

      this.add
        .image(0, 0, MAP_KEY)
        .setOrigin(0, 0)
        .setDepth(-20);
      return;
    }

    this.worldWidth = DEFAULT_WORLD_WIDTH;
    this.worldHeight = DEFAULT_WORLD_HEIGHT;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      0x152031,
    ).setDepth(-20);

    const grid = this.add.graphics().setDepth(-19);
    grid.lineStyle(1, 0x1c2a3a, 0.85);
    const step = 96;
    for (let x = 0; x <= this.worldWidth; x += step) {
      grid.lineBetween(x, 0, x, this.worldHeight);
    }
    for (let y = 0; y <= this.worldHeight; y += step) {
      grid.lineBetween(0, y, this.worldWidth, y);
    }
  }

  cleanupBullets() {
    this.deactivateOffCamera(this.bullets);
  }

  cleanupEnemyBullets() {
    if (!this.enemyBullets) return;
    const margin = 80;
    const view = this.cameras.main.worldView;

    this.enemyBullets.children.each((bone) => {
      if (!bone.active) return;

      if (bone.spinSpeed) {
        bone.rotation += bone.spinSpeed;
      }

      const outOfView =
        bone.x < view.x - margin ||
        bone.x > view.right + margin ||
        bone.y < view.y - margin ||
        bone.y > view.bottom + margin;

      if (outOfView) {
        bone.setActive(false);
        bone.setVisible(false);
        bone.body.stop();
        bone.body.enable = false;
        bone.spinSpeed = 0;
      }
    });
  }

  deactivateOffCamera(group) {
    if (!group) return;
    const margin = 80;
    const view = this.cameras.main.worldView;

    group.children.each((bullet) => {
      if (!bullet.active) return;

      const outOfView =
        bullet.x < view.x - margin ||
        bullet.x > view.right + margin ||
        bullet.y < view.y - margin ||
        bullet.y > view.bottom + margin;

      if (outOfView) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        bullet.body.enable = false;
      }
    });
  }

  createBulletTexture() {
    if (this.textures.exists('bullet')) return;

    const bullet = this.make.graphics({ x: 0, y: 0, add: false });
    bullet.fillStyle(0xffe066, 1);
    bullet.fillRoundedRect(0, 0, 10, 4, 2);
    bullet.generateTexture('bullet', 10, 4);
    bullet.destroy();
  }

  createBoneTexture() {
    if (this.textures.exists('enemy-bone')) return;

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Simple thrown bone: shaft + knobby ends.
    g.fillStyle(0xf0e6c8, 1);
    g.fillRoundedRect(6, 7, 20, 5, 2);
    g.fillStyle(0xe8d9b0, 1);
    g.fillCircle(6, 6, 4);
    g.fillCircle(6, 13, 4);
    g.fillCircle(26, 6, 4);
    g.fillCircle(26, 13, 4);
    g.fillStyle(0xfff6e0, 1);
    g.fillCircle(5, 5, 1.5);
    g.fillCircle(25, 5, 1.5);
    g.generateTexture('enemy-bone', 32, 20);
    g.destroy();
  }

  createMuzzleTextures() {
    if (!this.textures.exists('muzzle-flash')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xfff2a8, 1);
      g.fillEllipse(10, 6, 20, 10);
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(6, 6, 8, 5);
      g.fillStyle(0xffb347, 0.9);
      g.fillTriangle(18, 6, 28, 2, 28, 10);
      g.generateTexture('muzzle-flash', 30, 12);
      g.destroy();
    }

    if (!this.textures.exists('muzzle-spark')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffe066, 1);
      g.fillCircle(2, 2, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(2, 2, 1);
      g.generateTexture('muzzle-spark', 4, 4);
      g.destroy();
    }
  }
}
