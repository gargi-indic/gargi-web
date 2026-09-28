# Reflex launch film, direction A

Recoloured copy of `../gargi-film.jsx` for DESIGN.md direction A (Archivo, red `#ec3013`,
square corners, `[ഗ] GARGI LABS` lockup). Output: `web/public/reflex/film.mp4` (1920×1080,
30 fps, 66.5 s) and `film-poster.jpg` (frame at 62 s).

To re-render: copy `../support.js ../animations-v3.jsx ../tweaks-panel.jsx` next to these
files, serve the folder (`python3 -m http.server 8765`), `npm i puppeteer-core@23`, then
`node render.mjs frames` (needs Google Chrome and ffmpeg; frames stream straight into ffmpeg).
