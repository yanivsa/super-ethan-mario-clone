# Super Ethan Clone

A Mario-style 2D platformer clone built with plain HTML5 Canvas and your placeholder asset pack.

## Run locally
```bash
python3 -m http.server 4173
# then open http://127.0.0.1:4173
```

## Controls
- Move: `A/D` or `Arrow Left/Right`
- Jump: `Space`, `Z`, `W`, or `Arrow Up`
- Run: `Shift`
- Duck (big form): `S` or `Arrow Down`

## Files
- `index.html`: main page and overlays
- `styles.css`: UI and responsive styling
- `src/game.js`: game engine, level, physics, entities
- `PLAN.md`: detailed clone plan and asset prompting guidance

## Notes on generated placeholders
The runtime includes sprite chroma-key cleanup for non-transparent backgrounds, because generated SVG placeholders can include a flat backdrop unexpectedly.
