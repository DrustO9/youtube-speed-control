(function () {
  // ── Constants ────────────────────────────────────────────────
  const SPEED_STEP    = 0.25;
  const MIN_SPEED     = 0.25;
  const MAX_SPEED     = 4.0;
  const VOLUME_STEP   = 0.25;   // 25% per keypress
  const MIN_VOLUME    = 0.0;    // 0%
  const MAX_VOLUME    = 3.0;    // 300%
  const TOAST_ID      = '__yt-ext-toast';

  // ── State ────────────────────────────────────────────────────
  let audioCtx    = null;
  let gainNode    = null;
  let sourceNode  = null;
  let currentGain = 1.0;   // 1.0 = 100% (native volume)

  // ── Helpers ──────────────────────────────────────────────────
  function getVideo() {
    return document.querySelector('video');
  }

  function showToast(message) {
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      Object.assign(toast.style, {
        position:      'fixed',
        bottom:        '80px',
        left:          '50%',
        transform:     'translateX(-50%)',
        background:    'rgba(0, 0, 0, 0.82)',
        color:         '#ffffff',
        padding:       '10px 24px',
        borderRadius:  '8px',
        fontSize:      '18px',
        fontWeight:    '600',
        fontFamily:    'sans-serif',
        zIndex:        '999999',
        pointerEvents: 'none',
        transition:    'opacity 0.3s ease',
        opacity:       '0',
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 1400);
  }

  // ── Web Audio API setup for volume boost ─────────────────────
  //
  // The <video> element's native .volume maxes out at 1.0 (100%).
  // To exceed that, we route audio through a Web Audio GainNode,
  // which can amplify the signal beyond 1.0 — up to 3.0 (300%).
  //
  function setupAudioBoost(video) {
    if (audioCtx) return;   // already set up
    audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
    gainNode   = audioCtx.createGain();
    sourceNode = audioCtx.createMediaElementSource(video);
    gainNode.gain.value = currentGain;
    sourceNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }

  function setVolume(newGain) {
    const video = getVideo();
    if (!video) return;
    // First-time setup — must be triggered by a user gesture (keypress qualifies)
    setupAudioBoost(video);
    currentGain          = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, +newGain.toFixed(2)));
    gainNode.gain.value  = currentGain;
    const pct = Math.round(currentGain * 100);
    const icon = currentGain === 0 ? '🔇' : currentGain <= 1.0 ? '🔉' : '🔊';
    showToast(icon + ' Volume: ' + pct + '%');
  }

  // ── Key handler ──────────────────────────────────────────────
  function handleKey(event) {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return;
    const video = getVideo();
    if (!video) return;

    switch (event.key) {
      // Speed up
      case 'd': case 'D': {
        const rate = Math.min(MAX_SPEED, +(video.playbackRate + SPEED_STEP).toFixed(2));
        video.playbackRate = rate;
        showToast('⚡ Speed: ' + rate.toFixed(2) + '×');
        break;
      }
      // Slow down
      case 's': case 'S': {
        const rate = Math.max(MIN_SPEED, +(video.playbackRate - SPEED_STEP).toFixed(2));
        video.playbackRate = rate;
        showToast('🐢 Speed: ' + rate.toFixed(2) + '×');
        break;
      }
      // Volume up
      case 'w': case 'W': {
        setVolume(currentGain + VOLUME_STEP);
        break;
      }
      // Volume down
      case 'a': case 'A': {
        setVolume(currentGain - VOLUME_STEP);
        break;
      }
    }
  }

  document.addEventListener('keydown', handleKey);

  // ── Popup message handler ────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    const video = getVideo();

    function state() {
      return { speed: video ? video.playbackRate : 1.0, gain: currentGain };
    }

    switch (msg.action) {
      case 'getState':
        sendResponse(state());
        break;
      case 'speedUp': {
        if (video) {
          const rate = Math.min(MAX_SPEED, +(video.playbackRate + SPEED_STEP).toFixed(2));
          video.playbackRate = rate;
          showToast('⚡ Speed: ' + rate.toFixed(2) + '×');
        }
        sendResponse(state());
        break;
      }
      case 'speedDown': {
        if (video) {
          const rate = Math.max(MIN_SPEED, +(video.playbackRate - SPEED_STEP).toFixed(2));
          video.playbackRate = rate;
          showToast('🐢 Speed: ' + rate.toFixed(2) + '×');
        }
        sendResponse(state());
        break;
      }
      case 'volumeUp':
        setVolume(currentGain + VOLUME_STEP);
        sendResponse(state());
        break;
      case 'volumeDown':
        setVolume(currentGain - VOLUME_STEP);
        sendResponse(state());
        break;
      case 'reset': {
        if (video) video.playbackRate = 1.0;
        currentGain = 1.0;
        if (gainNode) gainNode.gain.value = 1.0;
        showToast('↺ Reset · Speed 1.00× · Volume 100%');
        sendResponse({ speed: 1.0, gain: 1.0 });
        break;
      }
      default:
        sendResponse(state());
    }
    return true; // keep message channel open for MV3
  });
})();
