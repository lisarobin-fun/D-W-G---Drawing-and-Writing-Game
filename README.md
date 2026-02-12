# Denan's Stylus Adventure

A lightweight touch-first web game designed to help a 9-year-old practice fine motor control for drawing and writing using a stylus (or finger).

## Activities
- **Trace Path**: follow dotted roads and get scored by tracing accuracy.
- **Shape Builder**: trace fun shapes (circle, star, heart, etc.) with accuracy grading.
- **Story Words**: trace themed mixed-case words in a single-line script style.
- **Free Draw**: creative prompt mode for storytelling doodles.

## Easiest way on Windows (no terminal typing)
## ⚠️ Important: Do NOT run from inside the ZIP file
If you open `index.html` while still browsing the `.zip` archive, the game may look broken (unstyled page, no canvas/game logic).

Use this exact flow:
1. Right-click the ZIP file and click **Extract All...**
2. Open the extracted folder (not the ZIP view).
3. Double-click `run-game.bat`.
4. Keep the black terminal window open while playing.

1. Open the project folder.
2. Double-click `run-game.bat`.
3. Your browser opens automatically at `http://localhost:3000`.

> This avoids local file security issues that can happen when double-clicking `index.html` directly.

## Add Denan's photo to the hero banner
Two easy options:
1. **In-game upload (recommended):** click **Use your photo** on the banner and choose the picture.
2. **File method:** place your photo in the project root and name it `denan-banner.jpg`.

The chosen image is saved in the browser so it appears next time too.

If your picture is very large, it still loads immediately; if browser storage is full it may not persist after restart.

## Run locally
```bash
npm start
```
Then open `http://localhost:3000`.

## Goals for fine motor growth
- Controlled pressure and direction changes.
- Smooth curved and angled strokes.
- Mixed-case word tracing instead of only block letters.
- Motivation via star rewards based on actual tracing accuracy.
- Celebration cheer/clap sound when tracing is over 90% accuracy.
