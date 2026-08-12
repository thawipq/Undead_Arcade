import { fetchTopScores } from './scores.js';
import { isSupabaseConfigured } from './supabaseClient.js';
import { formatTime } from './ui/fonts.js';

function getOverlay() {
  return document.getElementById('highscores-overlay');
}

function bindOverlayOnce() {
  const overlay = getOverlay();
  if (!overlay || overlay.dataset.bound === 'true') return;
  overlay.dataset.bound = 'true';

  document.getElementById('highscores-close-btn')?.addEventListener('click', () => {
    hideHighscoresOverlay();
  });
}

function setStatus(message, isError = false) {
  const status = document.getElementById('highscores-status');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#ff6a6a' : '#8fa3b8';
}

function renderRows(rows) {
  const list = document.getElementById('highscores-list');
  if (!list) return;

  list.innerHTML = rows
    .map((row, index) => {
      const name = (row.player_name || 'Anonymous').slice(0, 16);
      const time = formatTime(row.survival_ms ?? 0);
      const levels = row.levels_completed ?? 0;
      const kills = row.kills ?? 0;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(name)}</td>
          <td>${time}</td>
          <td>${levels}</td>
          <td>${kills}</td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function showHighscoresOverlay() {
  bindOverlayOnce();

  const overlay = getOverlay();
  if (!overlay) return;

  overlay.hidden = false;
  setStatus('Loading…');

  const list = document.getElementById('highscores-list');
  if (list) list.innerHTML = '';

  if (!isSupabaseConfigured) {
    setStatus('Supabase not configured — add keys to .env', true);
    return;
  }

  try {
    const rows = await fetchTopScores(15);
    if (!rows.length) {
      setStatus('No scores yet — die in-game and save a run!');
      return;
    }

    renderRows(rows);
    setStatus('Top runs by survival time');
  } catch (error) {
    setStatus(error.message || 'Could not load scores', true);
  }
}

export function hideHighscoresOverlay() {
  const overlay = getOverlay();
  if (overlay) overlay.hidden = true;
}
