# TVApp popup guard (companion extension)

Stream embeds that TVApp plays (`embed.st`) open ad popups — sometimes landing on
gambling/adult/malware pages — when you press play. Browsers do not let a web page
stop a cross-origin iframe from opening popups, so this tiny MV3 extension runs a
content script in the embed's frame (`world: "MAIN"`, `document_start`, all frames
including `about:blank`) and neutralizes `window.open` plus `target="_blank"`
clicks. It only touches `embed.st` frames, so it does not affect your other
browsing.

Playback is unaffected: this is not `sandbox` (which the provider detects and
refuses), just a popup guard.

## Install (Chrome, Edge, Brave, or any Chromium browser)

If you are using a running TVApp instance, open **`/guard`** in it — that page
serves this folder as a zip and lists these steps. Otherwise grab the folder
from the repo.

1. Open the extensions page:
   - Chrome/Brave: `chrome://extensions`
   - Edge: `edge://extensions`
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Open TVApp and press play. Popups should no longer open.

Reload the extension from the same page after pulling updates.

## Notes

- Firefox uses a different extension model (`wrappedJSObject`); this is Chromium-only.
- If a stream provider is added that does not use `embed.st`, add its host to
  `matches` in `manifest.json`.
- Keep a network-level filter (NextDNS/AdGuard/Pi-hole) as well; the two are
  complementary. See the "Ads and safety" section in the root `README.md`.
