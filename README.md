# ⚡ YouTube Speed Control & Volume Booster

> A lightweight Chrome extension that gives you **keyboard shortcuts** and a **popup remote** to control YouTube playback speed and boost volume beyond the browser's 100% cap.

---

## Preview

<table>
  <tr>
    <td align="center"><b>Popup Remote</b></td>
    <td align="center"><b>On-screen Toast</b></td>
  </tr>
  <tr>
    <td><img src="icons/icon128.png" width="180" alt="Extension icon"/></td>
    <td><pre>⚡ Speed: 1.75×</pre></td>
  </tr>
</table>

---

## Features

| Feature | Detail |
|---|---|
| **Speed control** | Raise or lower playback rate in 0.25× steps (0.25× → 4.0×) |
| **Volume boost** | Amplify audio up to **300%** using the Web Audio API |
| **Popup remote** | Click the extension icon for a full control panel |
| **Keyboard shortcuts** | Works on any YouTube page — ignored while typing |
| **Live toast** | On-screen notification for every change |
| **Reset button** | One click to restore defaults |
| **Royal dark UI** | Deep navy + gold design with smooth hover animations |

---

## Installation

### Option A — Load unpacked (Developer Mode)

1. Download or clone this repository
   ```bash
   git clone https://github.com/DrustO9/youtube-speed-control.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle, top-right)
4. Click **Load unpacked**
5. Select the `youtube-speed-control/` folder
6. The extension appears in your toolbar — click the icon to open the remote

### Option B — Chrome Web Store *(coming soon)*

---

## Keyboard Shortcuts

| Key | Action | Range |
|-----|--------|-------|
| `D` | Speed up by 0.25× | up to **4.00×** |
| `S` | Slow down by 0.25× | down to **0.25×** |
| `W` | Volume up by 25% | up to **300%** |
| `A` | Volume down by 25% | down to **0%** |

> Keys are automatically ignored when you're typing in the search bar, comments, or any input field.

---

## Popup Remote

Click the extension icon (🏎️) on any YouTube page to open the **remote control panel**:

- **Live status** — shows current speed and volume (values glow gold when changed)
- **Speed Control** — 🐢 Slow Down / ⚡ Speed Up buttons
- **Volume Control** — 🔉 Vol Down / 🔊 Vol Up buttons
- **Reset to Default** — restores 1.00× speed and 100% volume in one click
- **Keyboard reference** — shortcut cheatsheet at the bottom

The popup syncs with the actual video state on open and updates instantly on each click.

---

## How It Works

### Speed control

Sets `HTMLVideoElement.playbackRate` directly — a native browser API supported everywhere.

### Volume boost beyond 100%

The browser caps `video.volume` at `1.0`. To exceed that, the extension routes audio through the **Web Audio API**:

```
<video> element
      │
      ▼
MediaElementSourceNode   ← taps the raw audio stream
      │
      ▼
GainNode  (gain 0.0 – 3.0)  ← amplifies signal (1.0 = 100%, 3.0 = 300%)
      │
      ▼
AudioContext.destination ← your speakers
```

The `AudioContext` is only created on the **first volume keypress or button click** (required by browser autoplay policy). Subsequent presses use the same context.

> **Note:** Boosting above 200% may cause audio clipping on some videos. If audio sounds distorted, reduce the gain or lower your system volume.

---

## Project Structure

```
youtube-speed-control/
├── manifest.json      # MV3 extension manifest
├── content.js         # Injected into YouTube — handles keys & audio
├── popup.html         # Remote control UI
├── popup.js           # Popup logic — fire-and-forget message passing
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Customization

Edit the constants at the top of `content.js`:

```js
const SPEED_STEP  = 0.25;   // speed change per keypress
const MIN_SPEED   = 0.25;   // minimum playback rate
const MAX_SPEED   = 4.0;    // maximum playback rate
const VOLUME_STEP = 0.25;   // volume change per keypress (25%)
const MIN_VOLUME  = 0.0;    // 0% (muted)
const MAX_VOLUME  = 3.0;    // 300%
```

### Changing keybindings

Modify the `switch (event.key)` cases inside `handleKey()`. Example — arrow keys for volume:

```js
case 'ArrowUp':   setVolume(currentGain + VOLUME_STEP); break;
case 'ArrowDown': setVolume(currentGain - VOLUME_STEP); break;
```

---

## Troubleshooting

**Speed doesn't change**
- Click on the video player first so the page has keyboard focus
- Make sure the extension is enabled on `chrome://extensions`

**Volume boost has no effect on first press**
- Normal — the Web Audio context initialises on the first `W`/`A` press or popup button click. Press again and it will work.

**Audio sounds distorted at high volume**
- Digital clipping. Reduce gain to ≤ 200%, or lower system volume and boost with the extension.

**`W` key opens YouTube's watch history panel**
- Click directly on the video player (not the page background) before using shortcuts.

**Extension not loading**
- Ensure `manifest.json` is at the root of the folder, not inside a subfolder
- Check for JSON syntax errors — even a trailing comma will block loading

---

## Manifest V3 Notes

This extension is fully MV3-compliant:

- No background service worker required
- Scoped to `*.youtube.com` only — no broad host permissions
- No remote code execution or `eval`
- Web Audio API works in content scripts without extra permissions

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Commit your changes: `git commit -m "add my change"`
4. Push to the branch: `git push origin feature/my-change`
5. Open a Pull Request

---

## License

[MIT](LICENSE)
