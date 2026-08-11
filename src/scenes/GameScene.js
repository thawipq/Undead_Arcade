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
  BOSS_UNLOCK_MS_L2,
  BOMBER_BLAST_RADIUS,
  BOMBER_TRIGGER_RADIUS,
  BOMBER_EARLY_WINDOW_MS,
  BOMBER_SPAWN_CHANCE,
  BOMBER_SPAWN_CHANCE_EARLY,
  SPAWN_STOP_MS,
  SPAWN_STOP_MS_L2,
  MAX_SHOOTERS_ALIVE,
  MAX_SPITTERS_ALIVE,
  MAX_BOMBERS_ALIVE,
  MAX_CRAWLERS_ALIVE,
  MAX_WALKERS_ALIVE_L2,
  CRAWLER_SPAWN_CHANCE,
  CRAWLER_UNLOCK_MS,
  SHOOTER_BULLET_SPEED,
  SHOOTER_SPAWN_INTERVAL_MS,
  SHOOTER_UNLOCK_MS,
  SPITTER_UNLOCK_MS,
  SPITTER_SPAWN_INTERVAL_MS,
  SPITTER_BULLET_SPEED,
  ACID_PUDDLE_RADIUS,
  ACID_PUDDLE_DURATION_MS,
  ACID_PUDDLE_TICK_MS,
  BOSS_KIND_BROODMOTHER,
  ZOMBIE_TYPE_BOMBER,
  ZOMBIE_TYPE_BOSS,
  ZOMBIE_TYPE_CRAWLER,
  ZOMBIE_TYPE_SHOOTER,
  ZOMBIE_TYPE_SPITTER,
  ZOMBIE_TYPE_WALKER,
  buildZombieSheet,
  clearZombies,
  countActiveZombies,
  createZombieGroup,
  damageZombie,
  killZombie,
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
const PLAYER_IFRAME_MS = 5000;
const PLAYER_KNOCKBACK = 220;
const MAG_SIZE = 8;
const RELOAD_MS = 1100;
/** Arena-clear exclusive: modest permanent reload boost for the boss fight. */

/** Rare kill drops (non-boss). ~1 in 20 → usually 1–2 per arena clear. */
const ABILITY_DROP_CHANCE = 0.05;
/** Tester modes (god/boss): frequent drops so abilities are easy to verify. */
const ABILITY_DROP_CHANCE_TESTER = 0.5;
/** Soft vacuum when the player steps near a coin (world pixels). */
const COIN_MAGNET_RADIUS = 78;
const COIN_MAGNET_SPEED = 340;
const ABILITY_IDS = ['overdrive', 'shield'];
const OVERDRIVE_MS = 7000;
const OVERDRIVE_FIRE_MULT = 0.55;

/**
 * In-run weapon shop. Tuned for ~30–40 pre-boss coins + 20 boss jackpot:
 * T1 after a real farm, specialize into T2, maxing one line (or dabbling) is the choice.
 * No damage upgrade (too strong vs boss HP tuning).
 */
const SHOP_CATALOG = [
  {
    id: 'heart',
    label: 'HEART',
    consumable: true,
    maxLevel: 1,
    costs: [10],
    blurb: () => '+1 heart (max 3)',
  },
  {
    id: 'fireRate',
    label: 'FIRE RATE',
    maxLevel: 3,
    costs: [12, 25, 42],
    blurb: (lv) => (lv <= 0 ? 'Base fire speed' : `+${lv * 12}% fire speed`),
  },
  {
    id: 'mag',
    label: 'MAG SIZE',
    maxLevel: 3,
    costs: [10, 20, 36],
    blurb: (lv) => `${MAG_SIZE + lv * 2} round mag`,
  },
  {
    id: 'reload',
    label: 'RELOAD',
    maxLevel: 2,
    costs: [14, 28],
    blurb: (lv) => (lv <= 0 ? 'Base reload' : `+${lv * 18}% reload speed`),
  },
];

// Fallback world size when no custom map image is present.
const DEFAULT_WORLD_WIDTH = 3840;
const DEFAULT_WORLD_HEIGHT = 2160;

// Drop art here: public/assets/Map.png (L1), public/assets/map2.png (L2+).
// World size = active map image size.
const MAP_KEY_L1 = 'level-map-1';
const MAP_PATH_L1 = 'assets/Map.png?v=4';
const MAP_KEY_L2 = 'level-map-2';
const MAP_PATH_L2 = 'assets/map2.png?v=4';

const BGM_L1_KEY = 'level-bgm-1';
const BGM_L1_PATH = 'assets/music/Level 1 loop.mp3';
/** Drop Level 2 music here when ready. */
const BGM_L2_KEY = 'level-bgm-2';
const BGM_L2_PATH = 'assets/music/Level 2 loop.mp3';
const BOSS_BGM_KEY = 'boss-bgm';
const BOSS_BGM_PATH = 'assets/music/bossbattle.mp3';
const BOSS_BGM_L2_KEY = 'boss-bgm-2';
const BOSS_BGM_L2_PATH = 'assets/music/bossbattle2.mp3';
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
const COIN_SFX_KEY = 'coin-pickup';
const COIN_SFX_PATH = 'assets/sfx/coin-pickup.wav';
const OVERDRIVE_SFX_KEY = 'overdrive-voice';
const OVERDRIVE_SFX_PATH = 'assets/sfx/overdrive-voice.wav';
const EXPLODER_TIMER_SFX_KEY = 'exploder-timer';
const EXPLODER_TIMER_SFX_PATH = 'assets/sfx/explodertimersfx.wav';

/** Drop custom art here to replace the drawn defaults (48×48 PNG works well). */
const ABILITY_ICON_PATHS = {
  'ability-overdrive': 'assets/abilities/overdrive.png?v=4',
  'ability-shield': 'assets/abilities/shield.png?v=4',
};
/** On-screen pickup size in pixels (textures may be larger). */
const ABILITY_PICKUP_SIZE = 40;

/** Drawn by default. Drop public/assets/door.png later if you want custom art. */
const EXIT_DOOR_KEY = 'exit-door';
const EXIT_DOOR_PATH = 'assets/door.png';

const ACID_PUDDLE_KEY = 'acid-puddle';
const ACID_PUDDLE_PATH = 'assets/zombie/acidgoo-game.png?v=1';

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
    // Keep concurrent decodes low — full-res sheets are huge and were crowding out maps.
    this.load.maxParallelDownloads = 2;

    this.createBulletTexture();
    this.createBoneTexture();
    // Projectile blob only here — puddle art loads as a file below.
    this.createAcidProjectileTexture();
    this.createCoinTexture();
    this.createMuzzleTextures();
    // Load custom icons first; drawn fallbacks fill any gaps after load in create().
    Object.entries(ABILITY_ICON_PATHS).forEach(([key, path]) => {
      this.load.image(key, path);
    });
    this.createDoorTexture();
    if (!this.textures.exists(ACID_PUDDLE_KEY)) {
      this.load.image(ACID_PUDDLE_KEY, ACID_PUDDLE_PATH);
    }

    // Maps first — large zombie sheets can starve GPU memory if maps load last.
    [MAP_KEY_L1, MAP_KEY_L2].forEach((key) => {
      if (this.textures.exists(key)) this.textures.remove(key);
    });
    this.load.image(MAP_KEY_L1, MAP_PATH_L1);
    this.load.image(MAP_KEY_L2, MAP_PATH_L2);

    preloadZombieSheet(this);
    preloadSoldierSheet(this);
    if (!this.cache.audio.exists(BGM_L1_KEY)) {
      this.load.audio(BGM_L1_KEY, BGM_L1_PATH);
    }
    // Level 2 track is loaded on demand (file may not exist yet).
    if (!this.cache.audio.exists(BOSS_BGM_KEY)) {
      this.load.audio(BOSS_BGM_KEY, BOSS_BGM_PATH);
    }
    if (!this.cache.audio.exists(BOSS_BGM_L2_KEY)) {
      this.load.audio(BOSS_BGM_L2_KEY, BOSS_BGM_L2_PATH);
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
    if (!this.cache.audio.exists(COIN_SFX_KEY)) {
      this.load.audio(COIN_SFX_KEY, COIN_SFX_PATH);
    }
    if (!this.cache.audio.exists(OVERDRIVE_SFX_KEY)) {
      this.load.audio(OVERDRIVE_SFX_KEY, OVERDRIVE_SFX_PATH);
    }
    if (!this.cache.audio.exists(EXPLODER_TIMER_SFX_KEY)) {
      this.load.audio(EXPLODER_TIMER_SFX_KEY, EXPLODER_TIMER_SFX_PATH);
    }
  }

  async create() {
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.shopOpen = false;
    this.levelClearOpen = false;
    this.pauseUi = null;
    this.rewardUi = null;
    this.shopUi = null;
    this.levelClearUi = null;
    this.exitDoor = null;
    this.exitDoorLabel = null;
    this.player = null;
    this.ready = false;
    this.level = 1;
    this.killCount = 0;
    this.coinCount = 0;
    this.runStartedAt = 0;
    this.nextSpawnAt = 0;
    this.nextShooterSpawnAt = 0;
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.bossSpawnAt = 0;
    this.clearRewardGiven = false;
    this.spawnDifficultyBonusMs = 0;
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.magSize = MAG_SIZE;
    this.fireRateMs = FIRE_RATE_MS;
    this.reloadMs = RELOAD_MS;
    this.bulletDamage = 1;
    this.ammo = MAG_SIZE;
    this.reloading = false;
    this.reloadUntil = 0;
    this.shopLevels = { fireRate: 0, mag: 0, reload: 0 };
    this.overdriveUntil = 0;
    this.shieldCharges = 0;
    this.abilityDropBag = [];
    this.heartTexts = [];
    this.bgm = null;
    this.bossBgm = null;

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 64,
      runChildUpdate: false,
    });
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 40,
      runChildUpdate: false,
    });
    this.acidPuddles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 24,
      runChildUpdate: false,
    });
    this.coins = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 100,
      runChildUpdate: false,
    });
    this.abilities = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 12,
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

    // After preload: keep custom ability art, draw any missing keys.
    this.createAbilityTextures();
    await this.ensureMapsLoaded();
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
      p: Phaser.Input.Keyboard.KeyCodes.P,
    });

    this.lastFired = 0;
    this.pendingShot = false;
    this.testerMode = this.registry.get('testerMode') || null;
    this.registry.remove('testerMode');
    if (this.testerMode === 'level2' || this.testerMode === 'boss2') {
      this.level = 2;
      this.applyLevelMap(2);
    }
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.magSize = MAG_SIZE;
    this.fireRateMs = FIRE_RATE_MS;
    this.reloadMs = RELOAD_MS;
    this.bulletDamage = 1;
    this.ammo = MAG_SIZE;
    this.reloading = false;
    this.reloadUntil = 0;
    this.shopLevels = { fireRate: 0, mag: 0, reload: 0 };
    this.overdriveUntil = 0;
    this.shieldCharges = 0;
    this.abilityDropBag = [];
    this.clearRewardGiven = false;
    this.choosingReward = false;
    this.shopOpen = false;
    this.resetRunTimers();
    this.ready = true;

    this.createHeartHud();
    this.createAmmoHud();
    this.createAbilityHud();

    this.add
      .text(16, 44, 'WASD move · Click shoot · R reload · P shop · Esc pause', {
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

    this.levelText = this.add
      .text(this.scale.width / 2, 42, `LEVEL ${this.level || 1}`, {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#8fa3b8',
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

    this.coinText = this.add
      .text(this.scale.width - 16, 36, 'Coins: 0', {
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        color: '#ffe066',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.applyTesterCheats();

    this.physics.add.overlap(this.bullets, this.zombies, (bullet, zombie) => {
      this.onBulletHitZombie(bullet, zombie);
    });
    this.physics.add.overlap(this.player, this.zombies, (_player, zombie) => {
      if (zombie.burrowed || zombie.bossPhase === 'burrow_under') return;
      if (zombie.zombieType === ZOMBIE_TYPE_BOMBER) {
        this.detonateBomber(zombie, true);
      } else {
        this.hurtPlayer(zombie);
      }
    });
    this.physics.add.overlap(this.player, this.enemyBullets, (_player, bullet) => {
      this.onEnemyBulletHitPlayer(bullet);
    });
    this.physics.add.overlap(this.player, this.acidPuddles, (_player, puddle) => {
      this.onAcidPuddleHitPlayer(puddle);
    });
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      this.collectCoin(coin);
    });
    this.physics.add.overlap(this.player, this.abilities, (_player, pickup) => {
      this.collectAbility(pickup);
    });

    this.ensureLevelBgm();

    // Queue clicks so a quick press still fires even if mouseup happens between frames.
    this.onPointerDownShoot = (pointer) => {
      if (!pointer.leftButtonDown()) return;
      if (
        this.dead ||
        this.paused ||
        this.choosingReward ||
        this.levelClearOpen ||
        this.shopOpen ||
        !this.player?.active
      ) {
        return;
      }
      this.pendingShot = true;
    };
    this.input.on('pointerdown', this.onPointerDownShoot);

    this.onEsc = () => {
      if (this.dead || this.choosingReward || this.levelClearOpen) return;
      if (this.shopOpen) {
        this.closeShop();
        return;
      }
      if (this.paused) this.resumeGame();
      else this.pauseGame();
    };
    this.input.keyboard.on('keydown-ESC', this.onEsc);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC', this.onEsc);
      this.input.off('pointerdown', this.onPointerDownShoot);
      this.closeBossWarningUi();
      this.stopAlarmSfx();
      this.stopExploderTimerSfx();
      this.stopBgm();
      this.player = null;
      this.ready = false;
    });
  }

  bgmKeyForLevel(level = this.level || 1) {
    return level >= 2 ? BGM_L2_KEY : BGM_L1_KEY;
  }

  bgmPathForKey(key) {
    if (key === BGM_L2_KEY) return BGM_L2_PATH;
    return BGM_L1_PATH;
  }

  /** Load missing level BGM (e.g. Level 2) then play; stays silent if the file isn't there yet. */
  ensureLevelBgm() {
    this.stopBossBgm();
    const key = this.bgmKeyForLevel();
    if (this.cache.audio.exists(key)) {
      this.startBgm();
      return;
    }
    if (key === BGM_L1_KEY) {
      this.stopBgm(false);
      return;
    }

    // Optional Level 2+ track — skip quietly if missing.
    this.stopBgm(false);
    if (this._loadingLevelBgm) return;
    this._loadingLevelBgm = true;
    const path = this.bgmPathForKey(key);
    let failed = false;
    const cleanup = () => {
      this._loadingLevelBgm = false;
      this.load.off('complete', onDone);
      this.load.off('loaderror', onFail);
    };
    const onDone = () => {
      cleanup();
      if (!failed) this.startBgm();
    };
    const onFail = (file) => {
      if (file?.key && file.key !== key) return;
      failed = true;
      cleanup();
    };
    this.load.once('complete', onDone);
    this.load.on('loaderror', onFail);
    this.load.audio(key, path);
    this.load.start();
  }

  startBgm() {
    this.stopBossBgm();
    const key = this.bgmKeyForLevel();
    if (!this.cache.audio.exists(key)) {
      // Stay silent if the level track isn't loaded yet (e.g. Level 2 pending upload).
      this.stopBgm(false);
      return;
    }

    if (this.bgm && this.bgm.key !== key) {
      this.bgm.stop();
      this.bgm = null;
    }

    if (this.sound.get(key)) {
      this.bgm = this.sound.get(key);
    } else {
      this.bgm = this.sound.add(key, { loop: true, volume: 0.4 });
    }
    if (!this.bgm.isPlaying) {
      this.sound.unlock();
      this.bgm.play();
    }
  }

  startBossBgm() {
    this.stopBgm(false);
    const key = (this.level || 1) >= 2 ? BOSS_BGM_L2_KEY : BOSS_BGM_KEY;
    // Fall back to L1 boss track if L2 file failed to load.
    const playKey = this.cache.audio.exists(key)
      ? key
      : this.cache.audio.exists(BOSS_BGM_KEY)
        ? BOSS_BGM_KEY
        : null;
    if (!playKey) return;
    if (this.bossBgm?.isPlaying && this.bossBgm.key === playKey) return;

    this.stopBossBgm();
    if (this.sound.get(playKey)) {
      this.bossBgm = this.sound.get(playKey);
    } else {
      this.bossBgm = this.sound.add(playKey, { loop: true, volume: 0.45 });
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) {
      if (this.shopOpen) {
        this.closeShop();
        return;
      }
      if (
        !this.paused &&
        !this.choosingReward &&
        !this.levelClearOpen &&
        !this.dead &&
        this.player?.active
      ) {
        this.openShop();
        return;
      }
    }

    if (
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
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
    this.updateAbilityFx(time);
    this.updateCoinMagnet();
    this.checkExitDoor();
    // Reward before boss warning so a clear at 1:30 isn't stolen by the alarm.
    this.checkClearMapReward();
    this.handleZombieSpawns(time);
    updateZombies(this.zombies, this.player, time, (zombie, angle) => {
      this.fireEnemyBullet(zombie, angle);
    });
    this.checkBomberProximityFuses();
    this.syncExploderTimerSfx();
    this.cleanupBullets();
    this.cleanupEnemyBullets();
    this.cleanupAcidPuddles(time);
  }

  applyTesterCheats() {
    if (
      this.testerMode !== 'boss' &&
      this.testerMode !== 'boss2' &&
      this.testerMode !== 'god' &&
      this.testerMode !== 'level2'
    ) {
      return;
    }
    this.coinCount = 9999;
    this.coinText?.setText(`Coins: ${this.coinCount}`);
  }

  hasTesterGodMode() {
    return (
      this.testerMode === 'boss' ||
      this.testerMode === 'boss2' ||
      this.testerMode === 'god' ||
      this.testerMode === 'level2'
    );
  }

  resetRunTimers() {
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.bossSpawnAt = 0;
    this.clearRewardGiven = false;
    this.stopAlarmSfx();
    this.stopExploderTimerSfx();
    this.closeBossWarningUi();

    const level = this.level || 1;

    // Tester boss skips jump straight to the warning / spawn window.
    if (this.testerMode === 'boss' && level <= 1) {
      this.runStartedAt = this.time.now - BOSS_UNLOCK_MS;
      this.spawnDifficultyBonusMs = 0;
      this.nextSpawnAt = Number.POSITIVE_INFINITY;
      this.nextShooterSpawnAt = Number.POSITIVE_INFINITY;
      this.clearRewardGiven = true;
      return;
    }
    if (this.testerMode === 'boss2' || (this.testerMode === 'boss' && level >= 2)) {
      this.runStartedAt = this.time.now - BOSS_UNLOCK_MS_L2;
      this.spawnDifficultyBonusMs = 0;
      this.nextSpawnAt = Number.POSITIVE_INFINITY;
      this.nextShooterSpawnAt = Number.POSITIVE_INFINITY;
      this.clearRewardGiven = true;
      return;
    }

    // Higher levels keep pressure: same boss timeline, hotter spawn curve from the start.
    this.spawnDifficultyBonusMs = Math.min(42_000, Math.max(0, (level - 1) * 28_000));
    this.runStartedAt = this.time.now;
    this.nextSpawnAt = this.time.now + (level > 1 ? 500 : 900);
    // L1: bone throwers. L2+: acid spitters unlock earlier on real clock.
    const rangedDelay =
      level >= 2
        ? SPITTER_UNLOCK_MS
        : Math.max(4_000, SHOOTER_UNLOCK_MS - this.spawnDifficultyBonusMs);
    this.nextShooterSpawnAt = this.time.now + rangedDelay;
  }

  getElapsedMs(time = this.time.now) {
    return Math.max(0, time - this.runStartedAt);
  }

  /** Spawn pacing clock — includes per-level difficulty bias. */
  getSpawnElapsedMs(time = this.time.now) {
    return this.getElapsedMs(time) + (this.spawnDifficultyBonusMs || 0);
  }

  /** Level 1 clears at 1:00 / boss 1:30. Level 2+ clears at 2:00 / boss 2:30. */
  spawnStopMs() {
    return (this.level || 1) >= 2 ? SPAWN_STOP_MS_L2 : SPAWN_STOP_MS;
  }

  bossUnlockMs() {
    return (this.level || 1) >= 2 ? BOSS_UNLOCK_MS_L2 : BOSS_UNLOCK_MS;
  }

  updateTimer(time) {
    if (!this.timerText) return;
    // Freeze the clock while paused, choosing a reward, in shop, or dead.
    if (
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
      this.dead
    ) {
      return;
    }
    this.timerText.setText(formatTime(this.getElapsedMs(time)));
  }

  handleZombieSpawns(time) {
    const elapsed = this.getElapsedMs(time);
    const spawnElapsed = this.getSpawnElapsedMs(time);

    // Don't start the boss while a modal reward UI is open.
    if (this.choosingReward) return;

    // Boss warning, then spawn after a short alarm window.
    // Hard gate: no warning/spawn until the arena clear bonus is granted.
    if (elapsed >= this.bossUnlockMs()) {
      if (!this.clearRewardGiven) {
        if (countActiveZombies(this.zombies) === 0) {
          this.offerClearMapReward();
        }
        // Wait for clear bonus — do not spawn the boss yet.
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

    // Stop new walkers/ranged so the player can clear before the boss.
    if (elapsed >= this.spawnStopMs()) return;

    if (time >= this.nextSpawnAt) {
      const count = spawnCountForElapsed(spawnElapsed);
      const level = this.level || 1;
      const bomberChance =
        level >= 2
          ? elapsed < BOMBER_EARLY_WINDOW_MS
            ? BOMBER_SPAWN_CHANCE_EARLY
            : BOMBER_SPAWN_CHANCE
          : 0;
      let canSpawnBomber =
        bomberChance > 0 &&
        countActiveZombies(this.zombies, ZOMBIE_TYPE_BOMBER) < MAX_BOMBERS_ALIVE;
      const canSpawnCrawler =
        level >= 2 &&
        elapsed >= CRAWLER_UNLOCK_MS &&
        countActiveZombies(this.zombies, ZOMBIE_TYPE_CRAWLER) < MAX_CRAWLERS_ALIVE;
      const canSpawnWalker =
        level < 2 ||
        countActiveZombies(this.zombies, ZOMBIE_TYPE_WALKER) < MAX_WALKERS_ALIVE_L2;
      for (let i = 0; i < count; i += 1) {
        let type = null;
        if (canSpawnBomber && Math.random() < bomberChance) {
          type = ZOMBIE_TYPE_BOMBER;
          canSpawnBomber = false;
        } else if (canSpawnCrawler && Math.random() < CRAWLER_SPAWN_CHANCE) {
          type = ZOMBIE_TYPE_CRAWLER;
        } else if (canSpawnWalker) {
          type = ZOMBIE_TYPE_WALKER;
        } else if (canSpawnCrawler) {
          // Walker soft-cap: fill with crawlers instead of more shamblers.
          type = ZOMBIE_TYPE_CRAWLER;
        }
        if (type) spawnZombie(this, this.zombies, type);
      }
      this.nextSpawnAt = time + spawnIntervalForElapsed(spawnElapsed, level);
    }

    const level = this.level || 1;
    if (level >= 2) {
      // Level 2+: spitters instead of bone throwers.
      if (elapsed >= SPITTER_UNLOCK_MS && time >= this.nextShooterSpawnAt) {
        const spittersAlive = countActiveZombies(this.zombies, ZOMBIE_TYPE_SPITTER);
        if (spittersAlive < MAX_SPITTERS_ALIVE) {
          spawnZombie(this, this.zombies, ZOMBIE_TYPE_SPITTER);
          this.nextShooterSpawnAt = time + SPITTER_SPAWN_INTERVAL_MS;
        } else {
          this.nextShooterSpawnAt = time + 500;
        }
      }
    } else if (spawnElapsed >= SHOOTER_UNLOCK_MS && time >= this.nextShooterSpawnAt) {
      const shootersAlive = countActiveZombies(this.zombies, ZOMBIE_TYPE_SHOOTER);
      if (shootersAlive < MAX_SHOOTERS_ALIVE) {
        spawnZombie(this, this.zombies, ZOMBIE_TYPE_SHOOTER);
        this.nextShooterSpawnAt = time + Math.max(3500, SHOOTER_SPAWN_INTERVAL_MS);
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
      volume: 0.1375,
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

  /** Loop fuse tick while any exploder is alive; stop when none remain. */
  syncExploderTimerSfx() {
    const alive = countActiveZombies(this.zombies, ZOMBIE_TYPE_BOMBER) > 0;
    if (alive) {
      if (!this.exploderTimerSfx?.isPlaying && !this.exploderTimerSfx?.isPaused) {
        this.playExploderTimerSfx();
      }
    } else {
      this.stopExploderTimerSfx();
    }
  }

  playExploderTimerSfx() {
    this.stopExploderTimerSfx();
    if (!this.cache.audio.exists(EXPLODER_TIMER_SFX_KEY)) return;
    this.sound.unlock();
    this.exploderTimerSfx = this.sound.add(EXPLODER_TIMER_SFX_KEY, {
      volume: 0.4,
      loop: true,
    });
    this.exploderTimerSfx.play();
  }

  stopExploderTimerSfx() {
    if (!this.exploderTimerSfx) return;
    if (this.exploderTimerSfx.isPlaying || this.exploderTimerSfx.isPaused) {
      this.exploderTimerSfx.stop();
    }
    this.exploderTimerSfx.destroy();
    this.exploderTimerSfx = null;
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

    if (zombie.zombieType === ZOMBIE_TYPE_SPITTER) {
      this.fireAcidSpit(zombie, angle);
      return;
    }

    const isBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
    if (isBoss && zombie.bossKind === BOSS_KIND_BROODMOTHER) {
      this.fireBossAcidDenial(zombie);
      return;
    }

    // Wider angular gaps so the player can slip between bones.
    const spreads = isBoss ? [-0.78, -0.39, 0, 0.39, 0.78] : [0];
    const scale = isBoss ? 1.35 : 1;

    spreads.forEach((spread) => {
      const bone = this.enemyBullets.get(zombie.x, zombie.y, 'enemy-bone');
      if (!bone) return;

      const shotAngle = angle + spread;
      bone.setTexture('enemy-bone');
      bone.setActive(true);
      bone.setVisible(true);
      bone.setDepth(6);
      bone.setScale(scale);
      bone.setTint(0xffffff);
      bone.projectileKind = 'bone';
      bone.landAt = 0;
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

  /** Broodmother arena denial — spray stream VFX + delayed puddles (no floating orbs). */
  fireBossAcidDenial(zombie) {
    if (!this.player?.active) return;
    this.ensureAcidStreamTexture();

    const px = this.player.x;
    const py = this.player.y;
    const pvx = this.player.body?.velocity?.x || 0;
    const pvy = this.player.body?.velocity?.y || 0;
    // Lead slightly so puddles cut off the escape lane — never the player's feet.
    const leadX = px + pvx * 0.28;
    const leadY = py + pvy * 0.28;

    const dir = zombie.facing === 'left' ? -1 : 1;
    // Approx mouth on the wide boss cell.
    const mouthX = zombie.x + dir * Math.min(70, zombie.displayWidth * 0.22);
    const mouthY = zombie.y - zombie.displayHeight * 0.08;

    // Ring around the player — keep a clear dodge pocket in the center.
    const ring = 155 + Math.random() * 45;
    const baseAng = Math.random() * Math.PI * 2;
    const spots = [0, 1, 2, 3].map((i) => {
      const ang = baseAng + (i * Math.PI) / 2 + Phaser.Math.FloatBetween(-0.2, 0.2);
      const r = ring + Phaser.Math.Between(-16, 36);
      return {
        x: leadX + Math.cos(ang) * r,
        y: leadY + Math.sin(ang) * r,
      };
    });

    spots.forEach((spot, i) => {
      let aimX = spot.x;
      let aimY = spot.y;
      // Hard guarantee: never land inside the player's dodge radius.
      const minSafe = 130;
      let dx = aimX - px;
      let dy = aimY - py;
      let dist = Math.hypot(dx, dy) || 1;
      if (dist < minSafe) {
        aimX = px + (dx / dist) * minSafe;
        aimY = py + (dy / dist) * minSafe;
      }
      if (this.worldWidth && this.worldHeight) {
        aimX = Phaser.Math.Clamp(aimX, 24, this.worldWidth - 24);
        aimY = Phaser.Math.Clamp(aimY, 24, this.worldHeight - 24);
      }

      // Arc stream of elongated droplets toward the landing zone.
      const drops = 10;
      for (let n = 0; n < drops; n += 1) {
        const t = (n + 1) / (drops + 1);
        const jitter = Phaser.Math.FloatBetween(-18, 18);
        const midX = mouthX + (aimX - mouthX) * t + jitter * (1 - t);
        const midY =
          mouthY +
          (aimY - mouthY) * t -
          Math.sin(t * Math.PI) * (28 + Math.random() * 22) +
          jitter * 0.35;
        const drop = this.add.image(mouthX, mouthY, 'acid-stream-drop');
        drop.setDepth(14);
        drop.setAlpha(0.85);
        const ang = Math.atan2(aimY - mouthY, aimX - mouthX);
        drop.setRotation(ang + Phaser.Math.FloatBetween(-0.25, 0.25));
        drop.setScale(0.55 + Math.random() * 0.7, 0.35 + Math.random() * 0.45);
        this.tweens.add({
          targets: drop,
          x: midX,
          y: midY,
          alpha: 0,
          scaleX: drop.scaleX * 0.4,
          scaleY: drop.scaleY * 1.2,
          duration: 220 + t * 280 + i * 35,
          delay: n * 28 + i * 40,
          ease: 'Cubic.easeOut',
          onComplete: () => drop.destroy(),
        });
      }

      // Puddles land as the spray reaches — matches spit anim better than orbs.
      this.time.delayedCall(320 + i * 90, () => {
        if (!this.sys?.isActive() || this.dead) return;
        this.spawnAcidPuddle(aimX, aimY);
        this.spawnAcidSplashFx(aimX, aimY);
      });
    });
  }

  spawnAcidSplashFx(x, y) {
    this.ensureAcidStreamTexture();
    for (let i = 0; i < 7; i += 1) {
      const drop = this.add.image(x, y, 'acid-stream-drop');
      drop.setDepth(13);
      drop.setAlpha(0.9);
      drop.setRotation(Math.random() * Math.PI * 2);
      drop.setScale(0.4 + Math.random() * 0.5);
      const ang = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 28;
      this.tweens.add({
        targets: drop,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist * 0.7,
        alpha: 0,
        scale: 0.15,
        duration: 220 + Math.random() * 160,
        ease: 'Quad.easeOut',
        onComplete: () => drop.destroy(),
      });
    }
  }

  ensureAcidStreamTexture() {
    if (this.textures.exists('acid-stream-drop')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x6ad428, 0.95);
    g.fillEllipse(14, 6, 26, 10);
    g.fillStyle(0xb6ff5a, 0.9);
    g.fillEllipse(10, 5, 12, 5);
    g.fillStyle(0xe8ff9a, 0.75);
    g.fillEllipse(7, 4, 5, 3);
    g.generateTexture('acid-stream-drop', 28, 12);
    g.destroy();
  }

  fireAcidSpit(zombie, _angle) {
    if (!this.textures.exists('enemy-acid')) this.createAcidProjectileTexture();
    const spit = this.enemyBullets.get(zombie.x, zombie.y, 'enemy-acid');
    if (!spit) return;

    const player = this.player;
    const pvx = player?.body?.velocity?.x || 0;
    const pvy = player?.body?.velocity?.y || 0;
    const px = player?.x ?? zombie.x;
    const py = player?.y ?? zombie.y;

    // Lead the player's movement so puddles land ahead of their path.
    let aimX = px;
    let aimY = py;
    for (let i = 0; i < 2; i += 1) {
      const dist = Math.hypot(aimX - zombie.x, aimY - zombie.y) || 1;
      const eta = dist / SPITTER_BULLET_SPEED;
      // Slightly under-lead so it's readable / dodgeable, not perfect aimbot.
      const lead = Math.min(1.05, eta) * 0.9;
      aimX = px + pvx * lead;
      aimY = py + pvy * lead;
    }

    // Humanize aim: sometimes overshoot, sometimes miss wide.
    const miss = 36 + Math.random() * 54;
    const missAngle = Math.random() * Math.PI * 2;
    const leadJitter = 0.65 + Math.random() * 0.7;
    aimX = px + (aimX - px) * leadJitter + Math.cos(missAngle) * miss;
    aimY = py + (aimY - py) * leadJitter + Math.sin(missAngle) * miss;

    if (this.worldWidth && this.worldHeight) {
      aimX = Phaser.Math.Clamp(aimX, 24, this.worldWidth - 24);
      aimY = Phaser.Math.Clamp(aimY, 24, this.worldHeight - 24);
    }

    const shotAngle = Math.atan2(aimY - zombie.y, aimX - zombie.x);
    const travelDist = Math.hypot(aimX - zombie.x, aimY - zombie.y);
    const travelMs = Phaser.Math.Clamp(
      (travelDist / SPITTER_BULLET_SPEED) * 1000,
      280,
      2200,
    );

    spit.setTexture('enemy-acid');
    spit.setActive(true);
    spit.setVisible(true);
    spit.setDepth(6);
    spit.setScale(1);
    spit.clearTint();
    spit.projectileKind = 'acid';
    spit.spinSpeed = 0.12;
    spit.landAt = this.time.now + travelMs;
    spit.body.enable = true;
    this.physics.velocityFromRotation(shotAngle, SPITTER_BULLET_SPEED, spit.body.velocity);
    spit.setRotation(shotAngle);
  }

  onEnemyBulletHitPlayer(bone) {
    if (this.dead || this.paused) return;
    const isAcid = bone?.projectileKind === 'acid';
    const src = bone?.active
      ? { x: bone.x - (bone.body?.velocity.x || 0), y: bone.y - (bone.body?.velocity.y || 0) }
      : null;
    const px = bone?.x;
    const py = bone?.y;
    if (bone?.active) {
      bone.setActive(false);
      bone.setVisible(false);
      bone.body?.stop();
      if (bone.body) bone.body.enable = false;
      bone.spinSpeed = 0;
      bone.projectileKind = null;
      bone.landAt = 0;
    }
    if (isAcid && px != null && py != null) {
      this.spawnAcidPuddle(px, py);
    }
    this.hurtPlayer(src);
  }

  spawnAcidPuddle(x, y) {
    if (!this.acidPuddles) return;
    if (!this.textures.exists(ACID_PUDDLE_KEY)) this.createAcidPuddleFallback();
    if (!this.textures.exists(ACID_PUDDLE_KEY)) return;

    const puddle = this.acidPuddles.get(x, y, ACID_PUDDLE_KEY);
    if (!puddle) return;

    puddle.setTexture(ACID_PUDDLE_KEY);
    puddle.setActive(true);
    puddle.setVisible(true);
    puddle.setDepth(4);
    puddle.setAlpha(0.92);
    puddle.setScale(0.55);
    puddle.body.enable = true;
    puddle.body.setAllowGravity(false);
    puddle.body.setImmovable(true);
    puddle.body.setSize(ACID_PUDDLE_RADIUS * 1.4, ACID_PUDDLE_RADIUS * 1.4);
    puddle.body.setOffset(
      Math.max(0, (puddle.width - ACID_PUDDLE_RADIUS * 1.4) / 2),
      Math.max(0, (puddle.height - ACID_PUDDLE_RADIUS * 1.4) / 2),
    );
    puddle.expiresAt = this.time.now + ACID_PUDDLE_DURATION_MS;
    puddle.nextTickAt = 0;

    this.tweens.add({
      targets: puddle,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });
  }

  onAcidPuddleHitPlayer(puddle) {
    if (!puddle?.active || this.dead || this.paused) return;
    const now = this.time.now;
    if (now < (puddle.nextTickAt || 0)) return;
    puddle.nextTickAt = now + ACID_PUDDLE_TICK_MS;
    this.hurtPlayer(puddle);
  }

  cleanupAcidPuddles(time = this.time.now) {
    if (!this.acidPuddles) return;
    this.acidPuddles.children.each((puddle) => {
      if (!puddle.active) return;
      if (time >= (puddle.expiresAt || 0)) {
        this.tweens.add({
          targets: puddle,
          alpha: 0,
          scale: 0.5,
          duration: 200,
          onComplete: () => {
            puddle.setActive(false);
            puddle.setVisible(false);
            puddle.body?.stop();
            if (puddle.body) puddle.body.enable = false;
            puddle.setAlpha(1);
          },
        });
        puddle.expiresAt = time + 999999;
      }
    });
  }

  clearAcidPuddles() {
    if (!this.acidPuddles) return;
    this.acidPuddles.children.each((puddle) => {
      puddle.setActive(false);
      puddle.setVisible(false);
      puddle.body?.stop();
      if (puddle.body) puddle.body.enable = false;
    });
  }

  onBulletHitZombie(bullet, zombie) {
    if (this.dead || !bullet.active || !zombie.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body?.stop();
    if (bullet.body) bullet.body.enable = false;

    const wasBoss = zombie.zombieType === ZOMBIE_TYPE_BOSS;
    const wasBomber = zombie.zombieType === ZOMBIE_TYPE_BOMBER;
    const dropX = zombie.x;
    const dropY = zombie.y;
    const died = damageZombie(zombie, this.bulletDamage || 1);
    if (died) {
      this.killCount += 1;
      this.killText?.setText(`Kills: ${this.killCount}`);
      if (wasBomber) {
        this.detonateBomber(zombie, false, dropX, dropY);
      } else if (wasBoss) {
        this.spawnCoinSplash(dropX, dropY, 20);
        this.spawnExitDoor(dropX, dropY);
      } else {
        this.spawnCoin(dropX, dropY);
        if (
          Math.random() <
          (this.hasTesterGodMode() ? ABILITY_DROP_CHANCE_TESTER : ABILITY_DROP_CHANCE)
        ) {
          this.spawnAbilityPickup(dropX, dropY);
        }
      }
    }
  }

  /**
   * Bomber pops on death, contact, or proximity fuse.
   * Damages the player if they're in the blast.
   * @param {boolean} fromContact credit the kill when bump / proximity fuse
   */
  detonateBomber(zombie, fromContact = false, x = zombie?.x, y = zombie?.y) {
    if (!zombie || zombie.detonated) return;
    zombie.detonated = true;

    const bx = x ?? zombie.x;
    const by = y ?? zombie.y;

    if (fromContact && zombie.active) {
      this.killCount += 1;
      this.killText?.setText(`Kills: ${this.killCount}`);
      killZombie(zombie);
    }

    this.spawnBomberExplosionFx(bx, by);
    this.cameras.main.shake(160, 0.007);

    if (this.player?.active) {
      const dist = Phaser.Math.Distance.Between(bx, by, this.player.x, this.player.y);
      if (dist <= BOMBER_BLAST_RADIUS) {
        this.hurtPlayer({ x: bx, y: by });
      }
    }

    this.spawnCoin(bx, by);
    if (
      Math.random() <
      (this.hasTesterGodMode() ? ABILITY_DROP_CHANCE_TESTER : ABILITY_DROP_CHANCE)
    ) {
      this.spawnAbilityPickup(bx, by);
    }
  }

  /** Explode when the player is close enough that the blast would hit. */
  checkBomberProximityFuses() {
    if (this.dead || !this.player?.active || !this.zombies) return;
    this.zombies.children.each((zombie) => {
      if (!zombie.active || zombie.detonated) return;
      if (zombie.zombieType !== ZOMBIE_TYPE_BOMBER) return;
      const dist = Phaser.Math.Distance.Between(
        zombie.x,
        zombie.y,
        this.player.x,
        this.player.y,
      );
      if (dist <= BOMBER_TRIGGER_RADIUS) {
        this.detonateBomber(zombie, true);
      }
    });
  }

  spawnBomberExplosionFx(x, y) {
    const flash = this.add.circle(x, y, 18, 0xff7a2f, 0.75).setDepth(14);
    const ring = this.add.circle(x, y, 16, 0xffb060, 0.0).setDepth(13);
    ring.setStrokeStyle(4, 0xffe066, 0.95);
    this.tweens.add({
      targets: flash,
      scale: 2.4,
      alpha: 0,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: ring,
      scale: BOMBER_BLAST_RADIUS / 16,
      alpha: 0,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  spawnCoin(x, y, opts = {}) {
    if (!this.coins || !this.textures.exists('coin')) return null;

    const scatter = opts.scatter ?? 10;
    const coin = this.coins.get(
      x + Phaser.Math.Between(-scatter, scatter),
      y + Phaser.Math.Between(-scatter, scatter),
      'coin',
    );
    if (!coin) return null;

    coin.setActive(true);
    coin.setVisible(true);
    coin.setDepth(7);
    coin.setAlpha(1);
    coin.body.enable = true;
    coin.body.setAllowGravity(false);
    coin.body.setSize(14, 14);
    coin.body.setOffset(1, 1);

    const vx = opts.vx ?? 0;
    const vy = opts.vy ?? 0;
    coin.body.setVelocity(vx, vy);
    coin.body.setDrag(180, 180);
    coin.magnetized = false;
    coin.magnetReadyAt = this.time.now + (opts.splash ? 280 : 120);

    // Tiny pop so the drop reads clearly.
    coin.setScale(0.35);
    this.tweens.killTweensOf(coin);
    this.tweens.add({
      targets: coin,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    if (!opts.splash) {
      this.tweens.add({
        targets: coin,
        y: coin.y - 6,
        duration: 280,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    } else {
      // Stop sliding after the burst so pickups stay nearby.
      this.time.delayedCall(420, () => {
        if (!coin.active || !coin.body || coin.magnetized) return;
        coin.body.setVelocity(0, 0);
      });
    }

    return coin;
  }

  /** Pull coins in when the player gets very close — easier pickups, not a full vacuum. */
  updateCoinMagnet() {
    if (!this.coins || !this.player?.active) return;

    const px = this.player.x;
    const py = this.player.y;
    const now = this.time.now;

    this.coins.children.each((coin) => {
      if (!coin.active || !coin.body?.enable) return;
      if (now < (coin.magnetReadyAt || 0)) return;

      const dist = Phaser.Math.Distance.Between(px, py, coin.x, coin.y);
      if (dist > COIN_MAGNET_RADIUS || dist < 1) {
        if (coin.magnetized && dist > COIN_MAGNET_RADIUS + 12) {
          coin.magnetized = false;
          coin.body.setDrag(180, 180);
          coin.body.setVelocity(0, 0);
        }
        return;
      }

      if (!coin.magnetized) {
        coin.magnetized = true;
        this.tweens.killTweensOf(coin);
        coin.setScale(1);
        coin.body.setDrag(0, 0);
      }

      const angle = Phaser.Math.Angle.Between(coin.x, coin.y, px, py);
      // Stronger pull as you get closer so it snaps in cleanly.
      const t = 1 - dist / COIN_MAGNET_RADIUS;
      const speed = COIN_MAGNET_SPEED * (0.55 + t * 0.85);
      coin.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    });
  }

  /** Boss jackpot: burst coins outward around the corpse. */
  spawnCoinSplash(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.2, 0.2);
      const speed = Phaser.Math.Between(140, 260);
      this.spawnCoin(x, y, {
        scatter: 6,
        splash: true,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }

  spawnExitDoor(x, y) {
    this.clearExitDoor();
    this.createDoorTexture();

    const door = this.physics.add.image(x, y - 8, EXIT_DOOR_KEY);
    door.setDepth(9);
    door.setScale(0.35);
    door.body.setAllowGravity(false);
    door.body.setImmovable(true);
    door.body.setSize(36, 48);
    door.body.setOffset(
      Math.max(0, (door.width - 36) / 2),
      Math.max(0, (door.height - 48) / 2),
    );

    this.tweens.add({
      targets: door,
      scale: 1,
      duration: 320,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: door,
      y: door.y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const label = this.add
      .text(x, y - 58, 'NEXT LEVEL', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#9fe0ff',
        stroke: '#0b1018',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.tweens.add({
      targets: label,
      alpha: 0.45,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.exitDoor = door;
    this.exitDoorLabel = label;
    // Silence after the boss until the player enters the next level.
    this.stopBgm(true);
    this.cameras.main.flash(180, 120, 200, 255);
  }

  clearExitDoor() {
    if (this.exitDoor) {
      this.tweens.killTweensOf(this.exitDoor);
      this.exitDoor.destroy();
      this.exitDoor = null;
    }
    if (this.exitDoorLabel) {
      this.tweens.killTweensOf(this.exitDoorLabel);
      this.exitDoorLabel.destroy();
      this.exitDoorLabel = null;
    }
  }

  checkExitDoor() {
    if (
      !this.exitDoor?.active ||
      this.levelClearOpen ||
      this.dead ||
      this.paused ||
      this.choosingReward ||
      this.shopOpen ||
      !this.player?.active
    ) {
      return;
    }
    if (!this.physics.overlap(this.player, this.exitDoor)) return;
    this.openLevelClear();
  }

  openLevelClear() {
    if (this.levelClearOpen || this.dead) return;

    this.levelClearOpen = true;
    this.player?.setVelocity(0, 0);
    this.player?.anims?.pause();
    this.physics.world.pause();
    this.pauseBgm();
    if (this.exploderTimerSfx?.isPlaying) this.exploderTimerSfx.pause();
    this.clearExitDoor();
    this.buildLevelClearUi();
  }

  closeLevelClearUi() {
    if (!this.levelClearUi) return;
    this.levelClearUi.forEach((node) => node?.destroy?.());
    this.levelClearUi = null;
  }

  buildLevelClearUi() {
    this.closeLevelClearUi();

    const { width, height } = this.scale;
    const cleared = this.level || 1;
    const next = cleared + 1;
    const survived = formatTime(this.getElapsedMs());

    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1018, 0.78)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 400, 280, 0x152031, 0.98)
      .setStrokeStyle(2, 0x5ec8ff)
      .setScrollFactor(0)
      .setDepth(1001);

    const title = this.add
      .text(width / 2, height / 2 - 88, 'LEVEL CLEAR', {
        fontFamily: PIXEL_FONT,
        fontSize: '22px',
        color: '#9fe0ff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const subtitle = this.add
      .text(
        width / 2,
        height / 2 - 28,
        `Level ${cleared} complete\nTime ${survived}\nKills ${this.killCount}\nCoins ${this.coinCount}`,
        {
          fontFamily: PIXEL_FONT,
          fontSize: '12px',
          color: '#8fa3b8',
          align: 'center',
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const continueBtn = createMenuButton(
      this,
      width / 2,
      height / 2 + 72,
      `ENTER LEVEL ${next}`,
      {
        fontSize: '14px',
        color: '#0b0f14',
        backgroundColor: '#5ec8ff',
        hoverColor: '#8ad8ff',
        padding: { x: 22, y: 12 },
      },
    )
      .setScrollFactor(0)
      .setDepth(1003);

    const runAction = (action) => {
      window.setTimeout(() => {
        if (!this.sys?.isActive()) return;
        action();
      }, 0);
    };

    continueBtn.on('pointerdown', () => runAction(() => this.proceedToNextLevel()));

    this.levelClearUi = [dim, panel, title, subtitle, continueBtn];
  }

  proceedToNextLevel() {
    if (!this.levelClearOpen) return;

    this.levelClearOpen = false;
    this.closeLevelClearUi();
    this.physics.world.resume();
    this.player?.anims?.resume();

    this.level = (this.level || 1) + 1;
    this.levelText?.setText(`LEVEL ${this.level}`);
    this.applyLevelMap(this.level);

    // Keep coins + shop upgrades; refill life/ammo and start a fresh arena.
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.shopOpen = false;
    this.pausedAt = 0;
    this.closePauseUi();
    this.closeRewardUi();
    this.closeShopUi();
    this.closeBossWarningUi();
    this.stopAlarmSfx();
    this.stopExploderTimerSfx();
    this.stopBossBgm();
    this.clearExitDoor();
    this.ensureLevelBgm();

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
    this.pendingShot = false;

    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.overdriveUntil = 0;
    this.shieldCharges = 0;
    this.clearShieldRing();
    this.recalcWeaponStats({ refillMag: true });
    this.reloading = false;
    this.reloadUntil = 0;
    this.clearRewardGiven = false;
    this.abilityDropBag = [];
    this.refreshHeartHud();
    this.refreshAmmoHud();
    this.refreshAbilityHud();
    this.resetRunTimers();
    this.applyTesterCheats();
    this.timerText?.setText(formatTime(this.getElapsedMs()));
    this.cameras.main.flash(220, 40, 60, 90);

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
    this.clearCoins();
    this.clearAbilities();
    this.clearAcidPuddles();
    clearZombies(this.zombies);
  }

  collectCoin(coin) {
    if (
      this.dead ||
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
      !coin?.active
    ) {
      return;
    }

    coin.setActive(false);
    coin.setVisible(false);
    coin.body?.stop();
    if (coin.body) coin.body.enable = false;
    this.tweens.killTweensOf(coin);

    this.coinCount += 1;
    this.coinText?.setText(`Coins: ${this.coinCount}`);
    this.playCoinSfx();
  }

  playCoinSfx() {
    if (!this.cache.audio.exists(COIN_SFX_KEY)) return;
    this.sound.unlock();
    this.sound.play(COIN_SFX_KEY, {
      volume: 0.55,
      rate: 0.96 + Math.random() * 0.08,
    });
  }

  clearCoins() {
    this.coins?.children.each((coin) => {
      this.tweens.killTweensOf(coin);
      coin.setActive(false);
      coin.setVisible(false);
      coin.body?.stop();
      if (coin.body) coin.body.enable = false;
    });
  }

  spawnAbilityPickup(x, y) {
    this.createAbilityTextures();
    const id = this.drawAbilityDrop();
    const tex = `ability-${id}`;
    if (!this.abilities || !this.textures.exists(tex)) return null;

    // Pass key for first-time create, then force setTexture so recycled
    // pool members don't keep a previous ability's icon.
    const pickup = this.abilities.get(
      x + Phaser.Math.Between(-14, 14),
      y + Phaser.Math.Between(-10, 14),
      tex,
    );
    if (!pickup) return null;

    pickup.setTexture(tex);
    // Width/height now match the chosen ability texture.
    const baseScale =
      ABILITY_PICKUP_SIZE / Math.max(1, Math.max(pickup.width, pickup.height));

    pickup.abilityId = id;
    pickup.setActive(true);
    pickup.setVisible(true);
    pickup.setDepth(8);
    pickup.setAlpha(1);
    pickup.setScale(baseScale * 0.4);
    pickup.body.enable = true;
    pickup.body.setAllowGravity(false);
    pickup.body.setVelocity(0, 0);
    const bw = Math.max(18, Math.round(ABILITY_PICKUP_SIZE * 0.7));
    const bh = bw;
    pickup.body.setSize(bw / baseScale, bh / baseScale);
    pickup.body.setOffset(
      Math.max(0, (pickup.width - bw / baseScale) / 2),
      Math.max(0, (pickup.height - bh / baseScale) / 2),
    );

    this.tweens.killTweensOf(pickup);
    this.tweens.add({
      targets: pickup,
      scale: baseScale,
      duration: 200,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: pickup,
      y: pickup.y - 8,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return pickup;
  }

  /** Fair bag: each ability once per cycle so one icon can't starve the others. */
  drawAbilityDrop() {
    if (!this.abilityDropBag?.length) {
      this.abilityDropBag = Phaser.Utils.Array.Shuffle([...ABILITY_IDS]);
    }
    return this.abilityDropBag.pop();
  }

  collectAbility(pickup) {
    if (
      this.dead ||
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
      !pickup?.active
    ) {
      return;
    }

    const id = pickup.abilityId;
    pickup.setActive(false);
    pickup.setVisible(false);
    pickup.body?.stop();
    if (pickup.body) pickup.body.enable = false;
    this.tweens.killTweensOf(pickup);

    if (id === 'overdrive') this.activateOverdrive();
    else if (id === 'shield') this.activateShield();
  }

  clearAbilities() {
    this.abilities?.children.each((pickup) => {
      this.tweens.killTweensOf(pickup);
      pickup.setActive(false);
      pickup.setVisible(false);
      pickup.body?.stop();
      if (pickup.body) pickup.body.enable = false;
    });
    this.overdriveUntil = 0;
    this.shieldCharges = 0;
    this.clearShieldRing();
    this.refreshAbilityHud();
  }

  isOverdriveActive(time = this.time.now) {
    return time < (this.overdriveUntil || 0);
  }

  activateOverdrive() {
    this.overdriveUntil = this.time.now + OVERDRIVE_MS;
    if (this.reloading) {
      this.reloading = false;
      this.ammo = this.magSize || MAG_SIZE;
    }
    this.refreshAmmoHud();
    this.refreshAbilityHud();
    this.cameras.main.flash(120, 255, 140, 60);
    this.showAbilityBanner('OVERDRIVE');
    this.playOverdriveSfx();
  }

  playOverdriveSfx() {
    if (!this.cache.audio.exists(OVERDRIVE_SFX_KEY)) return;
    this.sound.unlock();
    this.sound.play(OVERDRIVE_SFX_KEY, { volume: 0.7 });
  }

  activateShield() {
    this.shieldCharges = 1;
    this.ensureShieldRing();
    this.refreshAbilityHud();
    this.showAbilityBanner('SHIELD');
  }

  ensureShieldRing() {
    if (this.shieldRing?.active) {
      this.shieldRing.setVisible(true);
      return;
    }
    this.shieldRing = this.add
      .circle(this.player.x, this.player.y, 42, 0x5ec8ff, 0.12)
      .setStrokeStyle(2, 0x9fe0ff, 0.85)
      .setDepth(11);
  }

  clearShieldRing() {
    this.shieldRing?.destroy();
    this.shieldRing = null;
  }

  updateAbilityFx(time) {
    if (this.shieldCharges > 0 && this.player?.active) {
      this.ensureShieldRing();
      this.shieldRing.setPosition(this.player.x, this.player.y);
      this.shieldRing.setAlpha(0.55 + Math.sin(time / 140) * 0.2);
    } else if (this.shieldRing) {
      this.clearShieldRing();
    }

    const overdrive = this.isOverdriveActive(time);
    if (overdrive && this.player?.active && this.time.now >= this.invincibleUntil) {
      this.player.setTint(0xffb060);
    } else if (
      !overdrive &&
      this.player?.active &&
      !this.dead &&
      this.time.now >= this.invincibleUntil
    ) {
      // Clear overdrive tint only — hurt/shield flashes own their tint windows.
      if (this.player.tintTopLeft === 0xffb060) this.player.clearTint();
    }

    this.refreshAbilityHud(time);
    if (this.isOverdriveActive(time) || this.ammoText?.text === 'OVERDRIVE') {
      this.refreshAmmoHud();
    }
  }

  createAbilityHud() {
    this.abilityHudText = this.add
      .text(16, 88, '', {
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        color: '#ffe066',
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.refreshAbilityHud();
  }

  refreshAbilityHud(time = this.time.now) {
    if (!this.abilityHudText) return;
    const parts = [];
    if (this.isOverdriveActive(time)) {
      const secs = Math.ceil((this.overdriveUntil - time) / 1000);
      parts.push(`OVERDRIVE ${secs}s`);
    }
    if (this.shieldCharges > 0) parts.push('SHIELD');
    this.abilityHudText.setText(parts.join('  ·  '));
  }

  showAbilityBanner(label) {
    if (!this.player?.active) return;
    const banner = this.add
      .text(this.player.x, this.player.y - 58, label, {
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#0b1018',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({
      targets: banner,
      y: banner.y - 28,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy(),
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
    if (this.isOverdriveActive()) {
      this.ammoText.setColor('#ffb060');
      this.ammoText.setText('OVERDRIVE');
      this.hideReloadHint();
      return;
    }
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
    if (
      this.dead ||
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
      !this.player?.active
    ) {
      return;
    }
    if (this.time.now < this.invincibleUntil) return;

    const testerGod = this.hasTesterGodMode();

    // One-hit shield absorbs the blow instead of spending a heart.
    if (this.shieldCharges > 0) {
      this.shieldCharges = 0;
      this.clearShieldRing();
      this.refreshAbilityHud();
      this.invincibleUntil = this.time.now + PLAYER_IFRAME_MS;
      this.playHurtSfx();
      this.cameras.main.shake(100, 0.0035);
      this.showAbilityBanner('BLOCKED');
      this.player.setTint(0x9fe0ff);
      this.time.delayedCall(220, () => {
        if (!this.player?.active || this.dead) return;
        if (this.isOverdriveActive()) this.player.setTint(0xffb060);
        else this.player.clearTint();
      });
      return;
    }

    // Tester modes: feel damage (sfx/knockback/iframes) but never lose hearts or die.
    if (!testerGod) {
      this.playerHp -= 1;
      this.refreshHeartHud();
    }
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
    // Brief hurt flash only — keep iframes as white/alpha blink, not a 5s red tint.
    this.time.delayedCall(180, () => {
      if (!this.player?.active || this.dead) return;
      if (this.time.now < this.invincibleUntil) this.player.clearTint();
      else if (this.isOverdriveActive()) this.player.setTint(0xffb060);
      else this.player.clearTint();
    });
    this.time.delayedCall(PLAYER_IFRAME_MS, () => {
      if (this.player?.active && !this.dead) {
        if (this.isOverdriveActive()) this.player.setTint(0xffb060);
        else this.player.clearTint();
      }
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

    if (!testerGod && this.playerHp <= 0) {
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
    this.stopExploderTimerSfx();
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
      .text(width / 2, height / 2 - 28, `Time ${survived}\nKills ${this.killCount}\nCoins ${this.coinCount}`, {
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
    if (
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.shopOpen ||
      this.dead ||
      !this.player
    ) {
      return;
    }

    this.paused = true;
    this.pausedAt = this.time.now;
    // Pause the world only — keep velocities so bullets resume mid-flight.
    this.physics.world.pause();
    this.player.anims?.pause();
    this.pauseBgm();
    if (this.alarmSfx?.isPlaying) this.alarmSfx.pause();
    if (this.exploderTimerSfx?.isPlaying) this.exploderTimerSfx.pause();

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

  closeShopUi() {
    if (!this.shopUi) return;
    this.shopUi.forEach((node) => node?.destroy?.());
    this.shopUi = null;
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
    if (this.exploderTimerSfx?.isPaused) this.exploderTimerSfx.resume();
  }

  applyPausedTimeShift(dt) {
    this.runStartedAt += dt;
    this.nextSpawnAt += dt;
    this.nextShooterSpawnAt += dt;
    if (this.bossSpawnAt) this.bossSpawnAt += dt;
    if (this.reloading) this.reloadUntil += dt;
    this.invincibleUntil += dt;
    if (this.overdriveUntil) this.overdriveUntil += dt;
    this.shiftZombieTimers(dt);
  }

  restartGame() {
    // Soft reset — scene.restart() races with async create and crashes.
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.shopOpen = false;
    this.levelClearOpen = false;
    this.pausedAt = 0;
    this.closePauseUi();
    this.closeRewardUi();
    this.closeShopUi();
    this.closeLevelClearUi();
    this.closeBossWarningUi();
    this.stopAlarmSfx();
    this.stopExploderTimerSfx();
    this.stopBossBgm();
    this.clearExitDoor();
    this.physics.world.resume();

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
    this.pendingShot = false;
    this.level =
      this.testerMode === 'level2' || this.testerMode === 'boss2' ? 2 : 1;
    this.levelText?.setText(`LEVEL ${this.level}`);
    this.applyLevelMap(this.level);
    this.ensureLevelBgm();
    this.killCount = 0;
    this.coinCount = 0;
    this.killText?.setText('Kills: 0');
    this.coinText?.setText('Coins: 0');
    this.playerHp = PLAYER_MAX_HP;
    this.invincibleUntil = 0;
    this.overdriveUntil = 0;
    this.shieldCharges = 0;
    this.clearShieldRing();
    this.shopLevels = { fireRate: 0, mag: 0, reload: 0 };
    this.recalcWeaponStats({ refillMag: true });
    this.reloading = false;
    this.reloadUntil = 0;
    this.clearRewardGiven = false;
    this.abilityDropBag = [];
    this.refreshHeartHud();
    this.refreshAmmoHud();
    this.refreshAbilityHud();
    this.resetRunTimers();
    this.applyTesterCheats();
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
    this.clearCoins();
    this.clearAbilities();
    this.clearAcidPuddles();
    clearZombies(this.zombies);
  }

  returnToMenu() {
    this.paused = false;
    this.dead = false;
    this.choosingReward = false;
    this.shopOpen = false;
    this.levelClearOpen = false;
    this.pausedAt = 0;
    this.closePauseUi();
    this.closeRewardUi();
    this.closeShopUi();
    this.closeLevelClearUi();
    this.closeBossWarningUi();
    this.stopAlarmSfx();
    this.stopExploderTimerSfx();
    this.stopBgm();
    this.clearExitDoor();
    this.clearAcidPuddles();
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
    // Deadzone so aiming straight up/down doesn't flicker left/right facing.
    const dx = pointer.worldX - this.player.x;
    const FACE_DEADZONE = 22;
    if (dx < -FACE_DEADZONE) this.facing = 'left';
    else if (dx > FACE_DEADZONE) this.facing = 'right';

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
    this.reloadUntil = time + (this.reloadMs || RELOAD_MS);
    this.hideReloadHint();
    this.refreshAmmoHud();
    if (this.cache.audio.exists(RELOAD_SFX_KEY)) {
      this.sound.unlock();
      this.sound.play(RELOAD_SFX_KEY, { volume: 0.4 });
    }
  }

  handleShooting(time) {
    const overdrive = this.isOverdriveActive(time);
    if (this.reloading && !overdrive) {
      this.pendingShot = false;
      return;
    }

    const pointer = this.input.activePointer;
    const holding =
      (pointer?.leftButtonDown?.() ?? pointer?.isDown) || this.keys.space.isDown;
    const wantsToFire = holding || this.pendingShot;

    const fireMs = overdrive
      ? Math.max(120, Math.round((this.fireRateMs || FIRE_RATE_MS) * OVERDRIVE_FIRE_MULT))
      : this.fireRateMs || FIRE_RATE_MS;

    if (!wantsToFire || time < this.lastFired + fireMs) {
      return;
    }

    // Consume the queued click only when we actually take a fire attempt.
    this.pendingShot = false;

    if (!overdrive && this.ammo <= 0) {
      this.showReloadHint();
      this.lastFired = time;
      return;
    }

    this.hideReloadHint();
    this.fireBullet(overdrive);
    this.lastFired = time;
  }

  fireBullet(overdrive = false) {
    const tip = GUN_TIP[this.facing] || GUN_TIP.right;
    const tipLen = Math.hypot(tip.x, tip.y);
    const px = this.player.x;
    const py = this.player.y;
    const pointer = this.input.activePointer;

    // Aim from body center so up/down shots aren't skewed by the side muzzle.
    let angle = Phaser.Math.Angle.Between(px, py, pointer.worldX, pointer.worldY);
    if (Phaser.Math.Distance.Between(px, py, pointer.worldX, pointer.worldY) < 10) {
      angle = this.facing === 'left' ? Math.PI : 0;
    }

    // Flash stays on the gun tip (L/R sprite), not along the aim ray.
    const flashX = px + tip.x;
    const flashY = py + tip.y;

    // Spawn along the aim ray far enough to be visible before contact checks.
    const spawnDist = Math.max(28, Math.min(tipLen, 40));
    const muzzleX = px + Math.cos(angle) * spawnDist;
    const muzzleY = py + Math.sin(angle) * spawnDist;

    const bullet = this.bullets.get(muzzleX, muzzleY, 'bullet');
    if (!bullet) return;

    if (!overdrive) {
      this.ammo = Math.max(0, this.ammo - 1);
      this.refreshAmmoHud();
    }

    this.spawnMuzzleSpark(flashX, flashY, this.facing);
    this.playGunSfx();

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setDepth(12);
    if (bullet.body) {
      bullet.body.enable = true;
      bullet.body.reset(muzzleX, muzzleY);
    } else {
      this.physics.add.existing(bullet);
      bullet.body.reset(muzzleX, muzzleY);
    }

    this.physics.velocityFromRotation(angle, BULLET_SPEED, bullet.body.velocity);
    bullet.setRotation(angle);
    // Hits use the bullets↔zombies overlap in create — avoid same-frame
    // despawn so the projectile is visible for at least one tick.
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
      this.testerMode === 'boss' ||
      this.testerMode === 'boss2'
    ) {
      return;
    }
    const elapsed = this.time.now - this.runStartedAt;
    // Offer as soon as the arena stop-spawning window begins and the map is empty.
    if (elapsed < this.spawnStopMs()) return;
    if (countActiveZombies(this.zombies) > 0) return;

    this.offerClearMapReward();
  }

  offerClearMapReward() {
    if (this.clearRewardGiven || this.dead || !this.player) return;

    this.clearRewardGiven = true;
    this.playerHp = Math.min(PLAYER_MAX_HP, this.playerHp + 1);
    this.refreshHeartHud();
    this.showArenaClearedPopup();
  }

  showArenaClearedPopup() {
    const { width, height } = this.scale;
    const popup = this.add
      .text(width / 2, height / 2 - 40, 'ARENA CLEARED\n+1 HEART', {
        fontFamily: PIXEL_FONT,
        fontSize: '16px',
        color: '#93d06d',
        align: 'center',
        stroke: '#0b1018',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(900)
      .setAlpha(0);

    this.tweens.add({
      targets: popup,
      alpha: 1,
      y: height / 2 - 56,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: popup,
          alpha: 0,
          y: height / 2 - 78,
          duration: 700,
          delay: 900,
          ease: 'Cubic.easeIn',
          onComplete: () => popup.destroy(),
        });
      },
    });
  }

  recalcWeaponStats({ refillMag = false } = {}) {
    const prevMag = this.magSize || MAG_SIZE;
    const fireLv = this.shopLevels?.fireRate || 0;
    const magLv = this.shopLevels?.mag || 0;
    const reloadLv = this.shopLevels?.reload || 0;

    const fireMult = Math.pow(0.88, fireLv);
    this.fireRateMs = Math.max(180, Math.round(FIRE_RATE_MS * fireMult));
    this.magSize = MAG_SIZE + magLv * 2;
    this.bulletDamage = 1;

    const reloadMult = Math.pow(0.82, reloadLv);
    this.reloadMs = Math.max(450, Math.round(RELOAD_MS * reloadMult));

    if (refillMag) {
      this.ammo = this.magSize;
      this.reloading = false;
    } else if (this.ammo > this.magSize) {
      this.ammo = this.magSize;
    } else if (this.magSize > prevMag) {
      this.ammo += this.magSize - prevMag;
    }

    this.refreshAmmoHud();
  }

  openShop() {
    if (
      this.shopOpen ||
      this.paused ||
      this.choosingReward ||
      this.levelClearOpen ||
      this.dead ||
      !this.player
    ) {
      return;
    }

    this.shopOpen = true;
    this.shopOpenedAt = this.time.now;
    this.physics.world.pause();
    this.player.anims?.pause();
    this.player.setVelocity(0, 0);
    this.pauseBgm();
    if (this.exploderTimerSfx?.isPlaying) this.exploderTimerSfx.pause();
    this.hideReloadHint();
    this.buildShopUi();
  }

  closeShop() {
    if (!this.shopOpen) return;

    if (this.shopOpenedAt) {
      this.applyPausedTimeShift(this.time.now - this.shopOpenedAt);
      this.shopOpenedAt = 0;
    }

    this.shopOpen = false;
    this.closeShopUi();
    this.physics.world.resume();
    this.player?.anims?.resume();
    this.resumeBgm();
    if (this.exploderTimerSfx?.isPaused) this.exploderTimerSfx.resume();
  }

  buildShopUi() {
    this.closeShopUi();

    const { width, height } = this.scale;
    const panelH = 420;
    const dim = this.add
      .rectangle(width / 2, height / 2, width, height, 0x0b1018, 0.72)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    const panel = this.add
      .rectangle(width / 2, height / 2, 480, panelH, 0x152031, 0.98)
      .setStrokeStyle(2, 0xc9a227)
      .setScrollFactor(0)
      .setDepth(1001);

    const title = this.add
      .text(width / 2, height / 2 - panelH / 2 + 28, 'WEAPON SHOP', {
        fontFamily: PIXEL_FONT,
        fontSize: '18px',
        color: '#ffe066',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    this.shopCoinLabel = this.add
      .text(width / 2, height / 2 - panelH / 2 + 54, `COINS ${this.coinCount}`, {
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        color: '#e8eef5',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const nodes = [dim, panel, title, this.shopCoinLabel];
    let y = height / 2 - panelH / 2 + 92;

    SHOP_CATALOG.forEach((item) => {
      const isHeart = item.consumable && item.id === 'heart';
      const level = this.shopLevels[item.id] || 0;
      const atMaxHp = isHeart && this.playerHp >= PLAYER_MAX_HP;
      const maxed = isHeart ? atMaxHp : level >= item.maxLevel;
      const cost = isHeart ? item.costs[0] : maxed ? 0 : item.costs[level];
      const canBuy = !maxed && this.coinCount >= cost;

      const infoLine = isHeart
        ? `${item.label}\n${item.blurb()}  (${this.playerHp}/${PLAYER_MAX_HP})`
        : `${item.label}  Lv${level}/${item.maxLevel}\n${item.blurb(level)}`;

      const info = this.add
        .text(width / 2 - 200, y, infoLine, {
          fontFamily: PIXEL_FONT,
          fontSize: '10px',
          color: '#c8d2dc',
          lineSpacing: 8,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(1002);

      const btnLabel = maxed ? (isHeart ? 'FULL' : 'MAX') : `BUY ${cost}`;
      const btn = createMenuButton(this, width / 2 + 150, y, btnLabel, {
        fontSize: '11px',
        color: maxed || !canBuy ? '#8fa3b8' : '#0b0f14',
        backgroundColor: maxed ? '#2a3544' : canBuy ? '#7dba5a' : '#3a2a2a',
        hoverColor: maxed ? '#2a3544' : canBuy ? '#93d06d' : '#523838',
        padding: { x: 14, y: 10 },
      })
        .setScrollFactor(0)
        .setDepth(1003);

      if (!maxed && canBuy) {
        btn.on('pointerdown', () => {
          window.setTimeout(() => {
            if (!this.sys?.isActive() || !this.shopOpen) return;
            this.buyShopUpgrade(item.id);
          }, 0);
        });
      }

      nodes.push(info, btn);
      y += 62;
    });

    const closeBtn = createMenuButton(this, width / 2, height / 2 + panelH / 2 - 28, 'CLOSE', {
      fontSize: '13px',
      backgroundColor: '#3d6f9c',
      hoverColor: '#4d84b6',
      padding: { x: 22, y: 10 },
    })
      .setScrollFactor(0)
      .setDepth(1003);

    closeBtn.on('pointerdown', () => {
      window.setTimeout(() => {
        if (!this.sys?.isActive()) return;
        this.closeShop();
      }, 0);
    });

    const hint = this.add
      .text(width / 2, height / 2 + panelH / 2 - 58, 'Esc / P to close', {
        fontFamily: PIXEL_FONT,
        fontSize: '9px',
        color: '#6d8299',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    nodes.push(closeBtn, hint);
    this.shopUi = nodes;
  }

  buyShopUpgrade(id) {
    if (!this.shopOpen) return;
    const item = SHOP_CATALOG.find((entry) => entry.id === id);
    if (!item) return;

    if (item.consumable && item.id === 'heart') {
      if (this.playerHp >= PLAYER_MAX_HP) return;
      const cost = item.costs[0];
      if (this.coinCount < cost) return;
      this.coinCount -= cost;
      if (this.hasTesterGodMode()) this.coinCount = 9999;
      this.playerHp = Math.min(PLAYER_MAX_HP, this.playerHp + 1);
      this.refreshHeartHud();
      this.coinText?.setText(`Coins: ${this.coinCount}`);
      this.buildShopUi();
      return;
    }

    const level = this.shopLevels[id] || 0;
    if (level >= item.maxLevel) return;

    const cost = item.costs[level];
    if (this.coinCount < cost) return;

    this.coinCount -= cost;
    if (this.hasTesterGodMode()) this.coinCount = 9999;
    this.shopLevels[id] = level + 1;
    this.coinText?.setText(`Coins: ${this.coinCount}`);
    this.recalcWeaponStats({ refillMag: id === 'mag' });
    this.buildShopUi();
  }

  spawnMuzzleSpark(x, y, facing) {
    const facingRight = facing !== 'left';
    const dir = facingRight ? 1 : -1;

    const flash = this.add.image(x, y, 'muzzle-flash');
    flash.setDepth(12);
    flash.setFlipX(!facingRight);
    flash.setOrigin(facingRight ? 0.15 : 0.85, 0.5);
    flash.setRotation(0);
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
    this.mapImage = null;
    this.applyLevelMap(this.level || 1);
  }

  /** Retry map loads if preload dropped them (common when GPU memory is tight). */
  ensureMapsLoaded() {
    const missing = [];
    if (!this.textures.exists(MAP_KEY_L1)) missing.push([MAP_KEY_L1, MAP_PATH_L1]);
    if (!this.textures.exists(MAP_KEY_L2)) missing.push([MAP_KEY_L2, MAP_PATH_L2]);
    if (!missing.length) return Promise.resolve(true);

    return new Promise((resolve) => {
      this.load.once('complete', () => {
        resolve(this.textures.exists(MAP_KEY_L1) || this.textures.exists(MAP_KEY_L2));
      });
      missing.forEach(([key, path]) => this.load.image(key, path));
      this.load.start();
    });
  }

  mapTextureKeyForLevel(level = 1) {
    if (level >= 2 && this.textures.exists(MAP_KEY_L2)) return MAP_KEY_L2;
    if (this.textures.exists(MAP_KEY_L1)) return MAP_KEY_L1;
    return null;
  }

  applyLevelMap(level = 1) {
    const key = this.mapTextureKeyForLevel(level);

    if (!key) {
      this.worldWidth = DEFAULT_WORLD_WIDTH;
      this.worldHeight = DEFAULT_WORLD_HEIGHT;
      this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
      this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

      if (!this.mapImage) {
        this.mapImage = this.add
          .rectangle(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight,
            0x152031,
          )
          .setDepth(-20);
      }
      return;
    }

    const src = this.textures.get(key).getSourceImage();
    this.worldWidth = src.width || DEFAULT_WORLD_WIDTH;
    this.worldHeight = src.height || DEFAULT_WORLD_HEIGHT;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    const canReuseImage =
      this.mapImage &&
      typeof this.mapImage.setTexture === 'function' &&
      this.mapImage.texture?.key;

    if (canReuseImage) {
      this.mapImage.setTexture(key);
      this.mapImage.setDisplaySize(this.worldWidth, this.worldHeight);
      this.mapImage.setPosition(0, 0);
      this.mapImage.setOrigin(0, 0);
      this.mapImage.setDepth(-20);
    } else {
      this.mapImage?.destroy?.();
      this.mapImage = this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-20);
    }
  }

  cleanupBullets() {
    this.deactivateOffCamera(this.bullets);
  }

  cleanupEnemyBullets() {
    if (!this.enemyBullets) return;
    const margin = 80;
    const view = this.cameras.main.worldView;
    const now = this.time.now;

    this.enemyBullets.children.each((bone) => {
      if (!bone.active) return;

      if (bone.spinSpeed) {
        bone.rotation += bone.spinSpeed;
      }

      // Acid spit lands as a puddle even if it misses.
      if (bone.projectileKind === 'acid' && bone.landAt && now >= bone.landAt) {
        const x = bone.landX ?? bone.x;
        const y = bone.landY ?? bone.y;
        bone.setActive(false);
        bone.setVisible(false);
        bone.body?.stop();
        if (bone.body) bone.body.enable = false;
        bone.spinSpeed = 0;
        bone.projectileKind = null;
        bone.landAt = 0;
        bone.landX = null;
        bone.landY = null;
        this.spawnAcidPuddle(x, y);
        return;
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
        bone.projectileKind = null;
        bone.landAt = 0;
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

  createCoinTexture() {
    if (this.textures.exists('coin')) return;

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xc9a227, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffe066, 1);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xf0c94d, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xb8860b, 1);
    g.fillRect(6, 4, 4, 8);
    g.generateTexture('coin', 16, 16);
    g.destroy();
  }

  createDoorTexture() {
    if (this.textures.exists(EXIT_DOOR_KEY)) return;

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Stone arch door — readable at pickup scale.
    g.fillStyle(0x3a4555, 1);
    g.fillRoundedRect(8, 4, 40, 56, 6);
    g.fillStyle(0x1a2230, 1);
    g.fillRoundedRect(14, 12, 28, 44, 4);
    g.fillStyle(0x5ec8ff, 1);
    g.fillRoundedRect(18, 16, 20, 36, 3);
    g.fillStyle(0x9fe0ff, 0.85);
    g.fillCircle(34, 36, 3);
    g.fillStyle(0x2a3344, 1);
    g.fillRect(6, 56, 44, 6);
    g.generateTexture(EXIT_DOOR_KEY, 56, 64);
    g.destroy();
  }

  createAbilityTextures() {
    if (!this.textures.exists('ability-overdrive')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xff7a2f, 1);
      g.fillCircle(12, 12, 11);
      g.fillStyle(0xffd27a, 1);
      g.fillCircle(12, 12, 7);
      g.fillStyle(0xfff0c8, 1);
      g.fillTriangle(12, 4, 16, 14, 8, 14);
      g.fillTriangle(12, 20, 16, 10, 8, 10);
      g.generateTexture('ability-overdrive', 24, 24);
      g.destroy();
    }

    if (!this.textures.exists('ability-shield')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x3a9fd8, 1);
      g.fillCircle(12, 12, 11);
      g.fillStyle(0x9fe0ff, 1);
      g.fillCircle(12, 12, 7);
      g.lineStyle(2, 0xe8f7ff, 1);
      g.strokeCircle(12, 12, 9);
      g.generateTexture('ability-shield', 24, 24);
      g.destroy();
    }
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

  createAcidProjectileTexture() {
    if (this.textures.exists('enemy-acid')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x7dff4a, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xc8ff7a, 1);
    g.fillCircle(6, 6, 3);
    g.generateTexture('enemy-acid', 16, 16);
    g.destroy();
  }

  createAcidPuddleFallback() {
    if (this.textures.exists(ACID_PUDDLE_KEY)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x3a8f20, 0.85);
    g.fillEllipse(40, 28, 76, 48);
    g.fillStyle(0x7dff4a, 0.7);
    g.fillEllipse(40, 28, 52, 32);
    g.fillStyle(0xc8ff7a, 0.55);
    g.fillEllipse(34, 24, 18, 12);
    g.generateTexture(ACID_PUDDLE_KEY, 80, 56);
    g.destroy();
  }

  /** @deprecated use createAcidProjectileTexture / createAcidPuddleFallback */
  createAcidTextures() {
    this.createAcidProjectileTexture();
    this.createAcidPuddleFallback();
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
