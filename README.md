# Valentine Web App (React + Vite)

A cute Valentine’s Day page:
- Center message: **“Will you be my Valentine?”**
- **Yes** shows a sweet, excited message
- **No** playfully runs away when you try to click it

## Run locally (localhost)

Prereqs: Node.js (recommended: current LTS) and npm.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Background music (Spring Snow - 10cm)

Due to copyright, the audio file is **not** included in this repo.

1. Add your audio file here:
   - `public/audio/spring-snow-10cm.mp3`
2. Start the app and click **Yes** to begin playback (it loops).

## Accepted video (portrait)

Add your video file here:
- `public/video/accepted.mp4`

When **Yes** is clicked, the accepted screen shows the video on the right in a portrait (9:16) frame.

## Build

```bash
npm run build
```

This outputs a production build to `dist/`.

## Deploy later (GitHub Pages idea)

When you’re ready to host on GitHub Pages, typical steps are:
- set `base` in `vite.config.ts` to `/<repo-name>/`
- add a GitHub Actions workflow to build and deploy `dist/` to Pages

