import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a2332',
  // Backing-store multiplier for crisp text/UI on Retina displays.
  resolution: dpr,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: {
    antialias: true,
    roundPixels: true,
    powerPreference: 'high-performance',
  },
  scene: [MenuScene, GameScene],
};

async function boot() {
  try {
    if (document.fonts?.load) {
      await document.fonts.load('16px "Press Start 2P"');
      await document.fonts.ready;
    }
  } catch {
    // Fall back to monospace if the webfont fails.
  }
  new Phaser.Game(config);
}

boot();
