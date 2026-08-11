import { generatePixelHead, getBakeStatus } from '../bakeFaceClient.js';
import { startCamera, stopCamera } from '../cameraCapture.js';
import {
  clearSavedFace,
  getSavedFaceDataUrl,
  loadFaceFromFile,
  captureFaceFromVideo,
  saveFaceDataUrl,
} from '../facePixelate.js';
import {
  clearSavedPixelHead,
  getSavedPixelHeadDataUrl,
  savePixelHeadDataUrl,
} from '../headAssets.js';
import {
  SHEET_PATH,
  SHEET_SRC_KEY,
  buildSoldierAnim,
  playSoldierWalk,
  preloadSoldierSheet,
} from '../soldierAnim.js';
import { createMenuButton } from '../ui/menuButtons.js';
import { PIXEL_FONT } from '../ui/fonts.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    preloadSoldierSheet(this);
  }

  async create() {
    const { width, height } = this.scale;
    this.cameraOpen = false;
    this.statusText = null;
    this.baking = false;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1620);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1c2a3a, 0.7);
    for (let x = 48; x < width; x += 48) grid.lineBetween(x, 0, x, height);
    for (let y = 48; y < height; y += 48) grid.lineBetween(0, y, width, y);

    const cardW = 980;
    const cardH = 560;
    const cardX = width / 2;
    const cardY = height / 2 + 8;

    this.add.rectangle(cardX, cardY, cardW, cardH, 0x152031, 0.96)
      .setStrokeStyle(2, 0x314155);

    const title = this.add
      .text(cardX, cardY - cardH / 2 + 48, 'ZOMBIE SHOOTER', {
        fontFamily: PIXEL_FONT,
        fontSize: '28px',
        color: '#e8eef5',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    // Hidden tester unlock: click the title 5 times.
    this.titleClicks = 0;
    this.testerUnlocked = false;
    title.on('pointerdown', () => this.onTitleTesterClick(cardX, cardY + cardH / 2 - 12));

    this.add
      .text(cardX, cardY - cardH / 2 + 92, 'Take a photo — AI cuts out your head\nand we put it on the soldier', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#8fa3b8',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    const previewX = cardX - 230;
    const panelY = cardY + 30;

    this.add.rectangle(previewX, panelY, 280, 300, 0x0f1824)
      .setStrokeStyle(1, 0x3a5168);

    this.add
      .text(previewX, panelY - 128, 'PREVIEW', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#8fa3b8',
      })
      .setOrigin(0.5);

    const ready = await buildSoldierAnim(this, getSavedFaceDataUrl());
    if (!ready) {
      this.add
        .text(previewX, panelY, 'Missing\nMainbody.png', {
          fontFamily: PIXEL_FONT,
          fontSize: '10px',
          color: '#e08a8a',
          align: 'center',
        })
        .setOrigin(0.5);
    } else {
      this.preview = this.add.sprite(previewX, panelY + 16, 'soldier', 0);
      this.preview.setScale(0.36);
      this.preview.setDepth(10);
      playSoldierWalk(this.preview, 'right');
    }

    const faceX = cardX + 200;

    this.add.rectangle(faceX, panelY, 360, 300, 0x0f1824)
      .setStrokeStyle(1, 0x3a5168);

    this.add
      .text(faceX, panelY - 128, 'SOLDIER FACE', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#8fa3b8',
      })
      .setOrigin(0.5);

    this.add
      .text(faceX, panelY - 88, 'Take or upload a photo.\nAI removes the background,\nthen we attach your head.', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#6d8299',
        align: 'center',
        lineSpacing: 5,
      })
      .setOrigin(0.5);

    const takePhotoBtn = createMenuButton(this, faceX, panelY - 8, 'TAKE PHOTO', {
      fontSize: '12px',
      backgroundColor: '#3d6f9c',
      hoverColor: '#4d84b6',
      padding: { x: 24, y: 12 },
    });

    const uploadBtn = createMenuButton(this, faceX - 78, panelY + 56, 'UPLOAD', {
      fontSize: '10px',
      padding: { x: 16, y: 10 },
    });

    const clearBtn = createMenuButton(this, faceX + 78, panelY + 56, 'CLEAR', {
      fontSize: '10px',
      backgroundColor: '#3a2a2a',
      hoverColor: '#523838',
      padding: { x: 16, y: 10 },
    });

    this.statusText = this.add
      .text(faceX, panelY + 118, this.buildStatusMessage(), {
        fontFamily: PIXEL_FONT,
        fontSize: '9px',
        color: '#8fa3b8',
        align: 'center',
        wordWrap: { width: 320 },
      })
      .setOrigin(0.5);

    takePhotoBtn.on('pointerdown', () => this.openCamera());
    uploadBtn.on('pointerdown', () => this.openFilePicker());
    clearBtn.on('pointerdown', () => this.clearFace());

    const startButton = createMenuButton(this, cardX, cardY + cardH / 2 - 52, 'START GAME', {
      fontSize: '14px',
      color: '#0b0f14',
      backgroundColor: '#7dba5a',
      hoverColor: '#93d06d',
      padding: { x: 36, y: 16 },
    });

    startButton.on('pointerdown', () => {
      this.closeCamera();
      this.registry.remove('testerMode');
      this.scene.start('GameScene');
    });

    this.add
      .text(cardX, height - 28, 'WASD / Arrows move · Mouse aims left/right · Click / Space shoot · Esc pause', {
        fontFamily: PIXEL_FONT,
        fontSize: '9px',
        color: '#5d7288',
      })
      .setOrigin(0.5);

    this.events.once('shutdown', () => this.closeCamera());
    this.bindFileInput();
    this.refreshBakeStatus();
  }

  onTitleTesterClick(btnX, btnY) {
    if (this.testerUnlocked) return;
    this.titleClicks += 1;
    if (this.titleClicks < 5) return;

    this.testerUnlocked = true;

    const bossBtn = createMenuButton(this, btnX, btnY - 72, 'TEST: BOSS', {
      fontSize: '10px',
      backgroundColor: '#5a3030',
      hoverColor: '#7a4040',
      padding: { x: 14, y: 8 },
    });
    bossBtn.setDepth(20);
    bossBtn.on('pointerdown', () => {
      this.closeCamera();
      this.registry.set('testerMode', 'boss');
      this.scene.start('GameScene');
    });

    const boss2Btn = createMenuButton(this, btnX, btnY - 32, 'TEST: BOSS 2', {
      fontSize: '10px',
      backgroundColor: '#4a3050',
      hoverColor: '#6a4070',
      padding: { x: 14, y: 8 },
    });
    boss2Btn.setDepth(20);
    boss2Btn.on('pointerdown', () => {
      this.closeCamera();
      this.registry.set('testerMode', 'boss2');
      this.scene.start('GameScene');
    });

    const godBtn = createMenuButton(this, btnX, btnY + 8, 'TEST: GOD', {
      fontSize: '10px',
      backgroundColor: '#3d5a30',
      hoverColor: '#4d7a40',
      padding: { x: 14, y: 8 },
    });
    godBtn.setDepth(20);
    godBtn.on('pointerdown', () => {
      this.closeCamera();
      this.registry.set('testerMode', 'god');
      this.scene.start('GameScene');
    });

    const level2Btn = createMenuButton(this, btnX, btnY + 48, 'TEST: LEVEL 2', {
      fontSize: '10px',
      backgroundColor: '#303a5a',
      hoverColor: '#40507a',
      padding: { x: 14, y: 8 },
    });
    level2Btn.setDepth(20);
    level2Btn.on('pointerdown', () => {
      this.closeCamera();
      this.registry.set('testerMode', 'level2');
      this.scene.start('GameScene');
    });

    this.setStatus('Tester modes unlocked');
  }

  buildStatusMessage() {
    if (getSavedPixelHeadDataUrl()) return 'Head attached to body';
    if (getSavedFaceDataUrl()) return 'Face saved';
    return 'No face set yet';
  }

  setStatus(message, isError = false) {
    if (!this.statusText) return;
    this.statusText.setText(message);
    this.statusText.setColor(isError ? '#e08a8a' : '#8fa3b8');
  }

  async refreshBakeStatus() {
    try {
      const status = await getBakeStatus();
      if (!status.configured) {
        this.setStatus('API key missing — add OPENAI_API_KEY to .env');
      } else {
        this.setStatus(this.buildStatusMessage());
      }
    } catch {
      // ignore
    }
  }

  bindFileInput() {
    const input = document.getElementById('face-input');
    if (!input || input.dataset.bound === 'true') return;
    input.dataset.bound = 'true';

    input.addEventListener('change', async () => {
      const menu = this.game.scene.getScene('MenuScene');
      const file = input.files?.[0];
      if (!file || !menu?.scene.isActive()) return;

      menu.setStatus('Loading face…');
      try {
        const dataUrl = await loadFaceFromFile(file);
        await menu.applyFace(dataUrl);
      } catch (error) {
        menu.setStatus(error.message || 'Failed to apply face', true);
      } finally {
        input.value = '';
      }
    });
  }

  openFilePicker() {
    document.getElementById('face-input')?.click();
  }

  async reloadSoldierSheet() {
    if (this.textures.exists(SHEET_SRC_KEY)) {
      this.textures.remove(SHEET_SRC_KEY);
    }

    await new Promise((resolve, reject) => {
      this.load.once('complete', resolve);
      this.load.once('loaderror', () => {
        reject(new Error(`Failed to load ${SHEET_PATH}`));
      });
      preloadSoldierSheet(this);
      this.load.start();
    });
  }

  async refreshPreview(faceDataUrl) {
    await buildSoldierAnim(this, faceDataUrl);
    if (this.preview) {
      this.preview.setTexture('soldier', 0);
      playSoldierWalk(this.preview, 'right');
    }
  }

  async applyFace(dataUrl) {
    saveFaceDataUrl(dataUrl);
    clearSavedPixelHead();

    // Instant preview with photo head while AI generates a proper pixel head.
    try {
      await this.reloadSoldierSheet();
      await this.refreshPreview(dataUrl);
    } catch (error) {
      console.error(error);
    }

    await this.generateAndAttachHead(dataUrl);
  }

  async generateAndAttachHead(faceDataUrl = getSavedFaceDataUrl()) {
    if (this.baking) return;

    if (!faceDataUrl) {
      this.setStatus('Take or upload a face first', true);
      return;
    }

    this.baking = true;
    this.setStatus('Cutting out your head…');

    try {
      const result = await generatePixelHead(faceDataUrl);
      if (!result.headDataUrl) {
        throw new Error('No head image returned');
      }

      savePixelHeadDataUrl(result.headDataUrl);
      await this.reloadSoldierSheet();
      await this.refreshPreview(faceDataUrl);
      this.setStatus('Done · head attached');
    } catch (error) {
      console.error(error);
      this.setStatus(error.message || 'Head cutout failed', true);
    } finally {
      this.baking = false;
    }
  }

  async clearFace() {
    clearSavedFace();
    clearSavedPixelHead();
    try {
      await this.reloadSoldierSheet();
      await this.refreshPreview(null);
      this.setStatus(this.buildStatusMessage());
    } catch (error) {
      console.error(error);
      this.setStatus(error.message || 'Failed to reset', true);
    }
  }

  async openCamera() {
    if (this.cameraOpen) return;

    const overlay = document.getElementById('camera-overlay');
    const video = document.getElementById('camera-video');
    const errorEl = document.getElementById('camera-error');
    if (!overlay || !video) return;

    this.cameraOpen = true;
    errorEl.textContent = '';
    overlay.hidden = false;
    this.setStatus('Starting camera…');

    try {
      await startCamera(video);
      this.setStatus('Line up your face, then snap');
      this.bindCameraButtons();
    } catch (error) {
      errorEl.textContent =
        error.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow access and try again.'
          : error.message || 'Could not open camera.';
      this.setStatus('Camera unavailable', true);
    }
  }

  bindCameraButtons() {
    const captureBtn = document.getElementById('camera-capture-btn');
    const cancelBtn = document.getElementById('camera-cancel-btn');
    if (!captureBtn || !cancelBtn || captureBtn.dataset.bound === 'true') return;

    captureBtn.dataset.bound = 'true';

    captureBtn.addEventListener('click', async () => {
      const menu = this.game.scene.getScene('MenuScene');
      const video = document.getElementById('camera-video');
      const errorEl = document.getElementById('camera-error');
      if (!menu?.scene.isActive() || !video) return;

      try {
        if (errorEl) errorEl.textContent = '';
        const dataUrl = captureFaceFromVideo(video);
        menu.closeCamera();
        await menu.applyFace(dataUrl);
      } catch (error) {
        console.error(error);
        menu.closeCamera();
        if (errorEl) errorEl.textContent = error.message || 'Could not capture photo.';
        menu.setStatus('Capture failed', true);
      }
    });

    cancelBtn.addEventListener('click', () => {
      const menu = this.game.scene.getScene('MenuScene');
      menu?.closeCamera();
      menu?.setStatus(menu.buildStatusMessage());
    });
  }

  closeCamera() {
    const overlay = document.getElementById('camera-overlay');
    const video = document.getElementById('camera-video');
    stopCamera(video);
    if (overlay) overlay.hidden = true;
    this.cameraOpen = false;
  }
}
