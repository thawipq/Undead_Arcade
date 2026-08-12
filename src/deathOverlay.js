import { isSupabaseConfigured } from './supabaseClient.js';
import { saveRunScore } from './scores.js';

const PLAYER_NAME_KEY = 'undeadArcadePlayerName';

let activeCallbacks = null;
let saveInFlight = false;

function getOverlay() {
  return document.getElementById('death-overlay');
}

export function getSavedPlayerName() {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function savePlayerName(name) {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, (name || '').trim());
  } catch {
    // ignore quota errors
  }
}

function setStatus(message, isError = false) {
  const status = document.getElementById('death-status');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#ff6a6a' : '#8fa3b8';
}

function setStats(stats) {
  const survival = document.getElementById('death-survival');
  const levels = document.getElementById('death-levels');
  const kills = document.getElementById('death-kills');
  const coins = document.getElementById('death-coins');

  if (survival) survival.textContent = stats.survivalDisplay;
  if (levels) levels.textContent = String(stats.levelsCompleted);
  if (kills) kills.textContent = String(stats.kills);
  if (coins) coins.textContent = String(stats.coins);
}

function setSaveEnabled(enabled) {
  const saveBtn = document.getElementById('death-save-btn');
  if (saveBtn) saveBtn.disabled = !enabled;
}

async function handleSave() {
  if (!activeCallbacks || saveInFlight) return;

  const nameInput = document.getElementById('death-name-input');
  const playerName = nameInput?.value?.trim() || 'Anonymous';
  savePlayerName(playerName);

  if (!isSupabaseConfigured) {
    setStatus('Supabase not configured — add keys to .env and restart dev server.', true);
    return;
  }

  saveInFlight = true;
  setSaveEnabled(false);
  setStatus('Saving…');

  try {
    await saveRunScore({
      playerName,
      survivalMs: activeCallbacks.stats.survivalMs,
      levelsCompleted: activeCallbacks.stats.levelsCompleted,
      levelReached: activeCallbacks.stats.levelReached,
      kills: activeCallbacks.stats.kills,
      coins: activeCallbacks.stats.coins,
    });
    setStatus('Run saved!');
  } catch (error) {
    setStatus(error.message || 'Failed to save run', true);
    setSaveEnabled(true);
  } finally {
    saveInFlight = false;
  }
}

function bindOverlayOnce() {
  const overlay = getOverlay();
  if (!overlay || overlay.dataset.bound === 'true') return;
  overlay.dataset.bound = 'true';

  document.getElementById('death-save-btn')?.addEventListener('click', () => {
    handleSave();
  });

  document.getElementById('death-restart-btn')?.addEventListener('click', () => {
    if (!activeCallbacks?.onRestart) return;
    const onRestart = activeCallbacks.onRestart;
    hideDeathOverlay();
    onRestart();
  });

  document.getElementById('death-menu-btn')?.addEventListener('click', () => {
    if (!activeCallbacks?.onMenu) return;
    const onMenu = activeCallbacks.onMenu;
    hideDeathOverlay();
    onMenu();
  });
}

export function showDeathOverlay(stats, { onRestart, onMenu } = {}) {
  bindOverlayOnce();

  const overlay = getOverlay();
  if (!overlay) return;

  activeCallbacks = { stats, onRestart, onMenu };
  saveInFlight = false;

  const nameInput = document.getElementById('death-name-input');
  if (nameInput) nameInput.value = getSavedPlayerName();

  setStats(stats);
  setSaveEnabled(true);

  if (!isSupabaseConfigured) {
    setStatus('Add Supabase keys to .env to save scores online.');
  } else {
    setStatus('Enter your name and save your run.');
  }

  overlay.hidden = false;
}

export function hideDeathOverlay() {
  const overlay = getOverlay();
  if (overlay) overlay.hidden = true;
  activeCallbacks = null;
  saveInFlight = false;
}
