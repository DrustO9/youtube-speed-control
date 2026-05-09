const speedEl = document.getElementById('speed-val');
const volEl   = document.getElementById('vol-val');

// Local state mirror — updated optimistically so clicks feel instant
let localSpeed  = 1.0;
let localGain   = 1.0;
let activeTabId = null;

// Speed / gain bounds (must match content.js constants)
const SPEED_STEP = 0.25, MIN_SPEED = 0.25, MAX_SPEED = 4.0;
const VOL_STEP   = 0.25, MIN_VOL   = 0.0,  MAX_VOL   = 3.0;

function updateUI() {
  speedEl.textContent = localSpeed.toFixed(2) + '×';
  volEl.textContent   = Math.round(localGain * 100) + '%';
  speedEl.className   = 'val' + (localSpeed !== 1.0 ? ' changed' : '');
  volEl.className     = 'val' + (localGain  !== 1.0 ? ' changed' : '');
}

function applyLocal(action) {
  switch (action) {
    case 'speedUp':    localSpeed = Math.min(MAX_SPEED, +(localSpeed + SPEED_STEP).toFixed(2)); break;
    case 'speedDown':  localSpeed = Math.max(MIN_SPEED, +(localSpeed - SPEED_STEP).toFixed(2)); break;
    case 'volumeUp':   localGain  = Math.min(MAX_VOL,   +(localGain  + VOL_STEP  ).toFixed(2)); break;
    case 'volumeDown': localGain  = Math.max(MIN_VOL,   +(localGain  - VOL_STEP  ).toFixed(2)); break;
    case 'reset':      localSpeed = 1.0; localGain = 1.0; break;
  }
  updateUI();
}

// Fire-and-forget — no await, no round-trip delay on button clicks
function sendCmd(action) {
  if (!activeTabId) return;
  chrome.tabs.sendMessage(activeTabId, { action }).catch(() => {});
  applyLocal(action);
}

function bind(id, action) {
  document.getElementById(id).addEventListener('click', () => sendCmd(action));
}

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url?.includes('youtube.com')) {
    document.body.classList.add('no-yt');
    return;
  }

  activeTabId = tab.id;

  // One-time async load of real current state
  try {
    const state = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
    if (state) { localSpeed = state.speed; localGain = state.gain; }
  } catch { /* content script not ready — keep defaults */ }

  updateUI();

  bind('btn-slow',     'speedDown');
  bind('btn-fast',     'speedUp');
  bind('btn-vol-down', 'volumeDown');
  bind('btn-vol-up',   'volumeUp');
  bind('btn-reset',    'reset');
});
