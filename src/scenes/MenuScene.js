import {
  cycleBodyId,
  getSelectedBody,
} from '../bodyAssets.js';
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
  buildSoldierAnim,
  getSheetSrcKey,
  playSoldierWalk,
  preloadSoldierSheet,
} from '../soldierAnim.js';
import { createMenuButton } from '../ui/menuButtons.js';
import { PIXEL_FONT } from '../ui/fonts.js';
import { hideHighscoresOverlay, showHighscoresOverlay } from '../highscoresOverlay.js';

const MENU_BG_KEY = 'menu-title-bg';
const MENU_BG_PATH = 'assets/ui/menu-title.png';
const MENU_VIDEO_KEY = 'menu-title-video';
const MENU_VIDEO_PATH = 'assets/ui/menu.mp4';
const MENU_MUSIC_KEY = 'menu-music';
const MENU_MUSIC_PATH = 'assets/music/MenuMusic.mp3';
/** Menu video layout space (menu.mp4 / 1024×576). */
const MENU_ART_W = 1024;
const MENU_ART_H = 576;
/** Gold frames in art pixels (from menu video). */
const MENU_FRAME_LEFT = { x0: 37, y0: 314, x1: 216, y1: 560 };
const MENU_FRAME_RIGHT = { x0: 806, y0: 314, x1: 987, y1: 560 };

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    preloadSoldierSheet(this);
    if (!this.textures.exists(MENU_BG_KEY)) {
      this.load.image(MENU_BG_KEY, MENU_BG_PATH);
    }
    // noAudio: true helps browsers autoplay the looping menu bed.
    if (!this.cache.video.exists(MENU_VIDEO_KEY)) {
      this.load.video(MENU_VIDEO_KEY, MENU_VIDEO_PATH, 'loadeddata', false, true);
    }
    if (!this.cache.audio.exists(MENU_MUSIC_KEY)) {
      this.load.audio(MENU_MUSIC_KEY, MENU_MUSIC_PATH);
    }
  }

  async create() {
    const { width, height } = this.scale;
    this.cameraOpen = false;
    this.statusText = null;
    this.baking = false;
    this.menuVideo = null;
    this.menuMusic = null;

    const art = this.placeMenuBackground(width, height);
    this.startMenuMusic();
    // Browsers often block audio until a gesture — resume on first click.
    this.input.once('pointerdown', () => this.startMenuMusic());

    const cx = width / 2;
    // Invisible hit target over the painted title (tester unlock).
    const titleHit = this.add
      .rectangle(cx, art.toScreenY(95), 520, 110, 0x000000, 0)
      .setInteractive({ useHandCursor: false })
      .setDepth(4);

    this.titleClicks = 0;
    this.testerUnlocked = false;
    titleHit.on('pointerdown', () => this.onTitleTesterClick(width - 130, height / 2 + 20));

    const left = MENU_FRAME_LEFT;
    const right = MENU_FRAME_RIGHT;
    const previewX = art.toScreenX((left.x0 + left.x1) / 2);
    const faceX = art.toScreenX((right.x0 + right.x1) / 2);
    const panelY = art.toScreenY((left.y0 + left.y1) / 2);
    const panelW = (right.x1 - right.x0) * art.scaleX;
    const panelH = (left.y1 - left.y0) * art.scaleY;
    const labelY = art.toScreenY(left.y0) + 18;

    this.add
      .text(previewX, labelY, 'BODY', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#e8b84a',
        stroke: '#1a0808',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.bodyNameText = this.add
      .text(previewX, labelY + 14, getSelectedBody().label, {
        fontFamily: PIXEL_FONT,
        fontSize: '8px',
        color: '#ffe8e0',
        stroke: '#1a0808',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(faceX, labelY, 'INSERT FACE', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#e8b84a',
        stroke: '#1a0808',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);

    const ready = await buildSoldierAnim(this, getSavedFaceDataUrl());
    if (!ready) {
      this.add
        .text(previewX, panelY + 6, 'Missing\nMainbody.png', {
          fontFamily: PIXEL_FONT,
          fontSize: '10px',
          color: '#e08a8a',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(6);
    } else {
      this.preview = this.add.sprite(previewX, panelY + 8, 'soldier', 0);
      this.preview.setScale(0.3);
      this.preview.setDepth(6);
      playSoldierWalk(this.preview, 'right');
      this.tweens.add({
        targets: this.preview,
        y: this.preview.y - 4,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const bodyRowY = art.toScreenY(left.y1) - 56;
      const bodyPrevBtn = createMenuButton(this, previewX - 34, bodyRowY, '◀', {
        fontSize: '8px',
        color: '#ffe8e0',
        backgroundColor: '#3a1818',
        hoverColor: '#5a2424',
        padding: { x: 8, y: 6 },
      });
      bodyPrevBtn.setDepth(7);

      const bodyNextBtn = createMenuButton(this, previewX + 34, bodyRowY, '▶', {
        fontSize: '8px',
        color: '#ffe8e0',
        backgroundColor: '#3a1818',
        hoverColor: '#5a2424',
        padding: { x: 8, y: 6 },
      });
      bodyNextBtn.setDepth(7);

      bodyPrevBtn.on('pointerdown', () => this.cycleBody(-1));
      bodyNextBtn.on('pointerdown', () => this.cycleBody(1));
    }

    // Stack face controls inside the right gold frame.
    const faceTop = art.toScreenY(right.y0);
    const faceBottom = art.toScreenY(right.y1);
    const faceMid = (faceTop + faceBottom) / 2 + 6;
    const takePhotoBtn = createMenuButton(this, faceX, faceMid - 36, 'TAKE PHOTO', {
      fontSize: '9px',
      color: '#fff5f0',
      backgroundColor: '#9a1c1c',
      hoverColor: '#c42828',
      padding: { x: 12, y: 9 },
    });
    takePhotoBtn.setDepth(7);

    const rowY = faceMid + 22;
    const sidePad = Math.min(52, panelW * 0.32);
    const uploadBtn = createMenuButton(this, faceX - sidePad, rowY, 'UPLOAD', {
      fontSize: '8px',
      color: '#ffe8e0',
      backgroundColor: '#3a1818',
      hoverColor: '#5a2424',
      padding: { x: 10, y: 8 },
    });
    uploadBtn.setDepth(7);

    const clearBtn = createMenuButton(this, faceX + sidePad, rowY, 'CLEAR', {
      fontSize: '8px',
      color: '#ffe8e0',
      backgroundColor: '#2a1212',
      hoverColor: '#4a1c1c',
      padding: { x: 10, y: 8 },
    });
    clearBtn.setDepth(7);

    this.statusText = this.add
      .text(faceX, faceMid + 68, this.buildStatusMessage(), {
        fontFamily: PIXEL_FONT,
        fontSize: '8px',
        color: '#e0c090',
        align: 'center',
        wordWrap: { width: panelW - 20 },
        stroke: '#1a0808',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(6);

    takePhotoBtn.on('pointerdown', () => this.openCamera());
    uploadBtn.on('pointerdown', () => this.openFilePicker());
    clearBtn.on('pointerdown', () => this.clearFace());

    const startButton = this.add
      .text(cx, height - 32, 'START', {
        fontFamily: PIXEL_FONT,
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#1a0808',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: startButton,
      alpha: 0.7,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startButton.on('pointerover', () => startButton.setColor('#ffe8e0'));
    startButton.on('pointerout', () => startButton.setColor('#ffffff'));
    startButton.on('pointerdown', () => this.leaveToGame());

    const highScoresBtn = createMenuButton(this, width - 14, 16, 'HIGH SCORES', {
      fontSize: '8px',
      color: '#ffe8e0',
      backgroundColor: '#3a1818',
      hoverColor: '#5a2424',
      padding: { x: 10, y: 8 },
    });
    highScoresBtn.setOrigin(1, 0);
    highScoresBtn.setDepth(10);
    highScoresBtn.on('pointerdown', () => showHighscoresOverlay());

    this.add
      .text(cx, height - 10, 'WASD move · Click shoot · R reload · P shop · Esc pause', {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#ffffff',
        align: 'center',
        stroke: '#0a0506',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.events.once('shutdown', () => {
      this.stopMenuVideo();
      this.stopMenuMusic();
      this.closeCamera();
      hideHighscoresOverlay();
    });
    this.bindFileInput();
    this.refreshBakeStatus();
  }

  leaveToGame(testerMode = null) {
    this.stopMenuVideo();
    this.stopMenuMusic();
    this.closeCamera();
    if (testerMode) this.registry.set('testerMode', testerMode);
    else this.registry.remove('testerMode');
    this.scene.start('GameScene');
  }

  startMenuMusic() {
    if (!this.cache.audio.exists(MENU_MUSIC_KEY)) return;
    this.sound.unlock();
    if (this.sound.get(MENU_MUSIC_KEY)) {
      this.menuMusic = this.sound.get(MENU_MUSIC_KEY);
    } else {
      this.menuMusic = this.sound.add(MENU_MUSIC_KEY, { loop: true, volume: 0.45 });
    }
    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play();
    }
  }

  stopMenuMusic() {
    if (this.menuMusic?.isPlaying) this.menuMusic.stop();
    this.menuMusic = null;
  }

  /** Full-bleed looping menu video (falls back to still). */
  placeMenuBackground(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0506).setDepth(0);

    // Stretch-to-fill so the bed always matches the game camera (no overflow).
    const scaleX = width / MENU_ART_W;
    const scaleY = height / MENU_ART_H;
    const artMap = {
      scale: scaleX,
      scaleX,
      scaleY,
      offsetX: 0,
      offsetY: 0,
      toScreenX: (x) => x * scaleX,
      toScreenY: (y) => y * scaleY,
    };

    if (this.cache.video.exists(MENU_VIDEO_KEY)) {
      const video = this.add.video(width / 2, height / 2, MENU_VIDEO_KEY);
      video.setOrigin(0.5);
      video.setScrollFactor(0);
      video.setDepth(1);
      video.setMute(true);
      video.setLoop(true);

      const fitToScreen = () => {
        // Prefer native pixels once metadata is ready; always clamp to game size.
        video.setScale(1);
        video.setDisplaySize(width, height);
        video.setPosition(width / 2, height / 2);
      };

      fitToScreen();
      video.on('play', fitToScreen);
      video.on('textureready', fitToScreen);
      if (video.video) {
        video.video.addEventListener('loadedmetadata', fitToScreen);
        video.video.addEventListener('loadeddata', fitToScreen);
      }

      // Mask to the game rect in case the texture still draws oversized.
      const maskG = this.make.graphics({ x: 0, y: 0, add: false });
      maskG.fillStyle(0xffffff, 1);
      maskG.fillRect(0, 0, width, height);
      video.setMask(maskG.createGeometryMask());

      video.play(true);
      this.menuVideo = video;
      // One more pass after the browser unlocks decoding.
      this.time.delayedCall(100, fitToScreen);
      this.time.delayedCall(400, fitToScreen);
    } else if (this.textures.exists(MENU_BG_KEY)) {
      this.add
        .image(width / 2, height / 2, MENU_BG_KEY)
        .setDisplaySize(width, height)
        .setDepth(1);
    }

    return artMap;
  }

  stopMenuVideo() {
    if (!this.menuVideo) return;
    try {
      this.menuVideo.stop();
    } catch {
      // ignore
    }
    this.menuVideo.destroy();
    this.menuVideo = null;
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
    bossBtn.on('pointerdown', () => this.leaveToGame('boss'));

    const boss2Btn = createMenuButton(this, btnX, btnY - 32, 'TEST: BOSS 2', {
      fontSize: '10px',
      backgroundColor: '#4a3050',
      hoverColor: '#6a4070',
      padding: { x: 14, y: 8 },
    });
    boss2Btn.setDepth(20);
    boss2Btn.on('pointerdown', () => this.leaveToGame('boss2'));

    const godBtn = createMenuButton(this, btnX, btnY + 8, 'TEST: GOD', {
      fontSize: '10px',
      backgroundColor: '#3d5a30',
      hoverColor: '#4d7a40',
      padding: { x: 14, y: 8 },
    });
    godBtn.setDepth(20);
    godBtn.on('pointerdown', () => this.leaveToGame('god'));

    const level2Btn = createMenuButton(this, btnX, btnY + 48, 'TEST: LEVEL 2', {
      fontSize: '10px',
      backgroundColor: '#303a5a',
      hoverColor: '#40507a',
      padding: { x: 14, y: 8 },
    });
    level2Btn.setDepth(20);
    level2Btn.on('pointerdown', () => this.leaveToGame('level2'));

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
    this.statusText.setColor(isError ? '#ff6a6a' : '#c49a9a');
  }

  async refreshBakeStatus() {
    try {
      const status = await getBakeStatus();
      if (!status.configured) {
        this.setStatus('API key missing — add GEMINI_API_KEY to .env');
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

  async cycleBody(delta) {
    const body = cycleBodyId(delta);
    this.bodyNameText?.setText(body.label);
    try {
      await this.ensureBodySheetLoaded();
      await this.refreshPreview(getSavedFaceDataUrl());
    } catch (error) {
      console.error(error);
      this.setStatus(error.message || 'Failed to switch body', true);
    }
  }

  async ensureBodySheetLoaded() {
    const key = getSheetSrcKey();
    if (this.textures.exists(key)) return;

    const body = getSelectedBody();
    await new Promise((resolve, reject) => {
      this.load.once('complete', resolve);
      this.load.once('loaderror', (file) => {
        reject(new Error(`Failed to load ${body.path}`));
      });
      this.load.image(key, `${body.path}?v=17`);
      this.load.start();
    });
  }

  async reloadSoldierSheet() {
    await this.ensureBodySheetLoaded();
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
