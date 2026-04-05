# Super Ethan

A holiday-themed 2D platformer inspired by classic Mario pacing, built with plain HTML5 Canvas and the current placeholder asset pack.

## Current direction
- Each stage represents a different Jewish holiday.
- The current runtime already supports stage-by-stage theming, banners, and distinct end-goal set pieces.
- The long-term target is a full campaign arc across the holidays, with stage-specific mechanics, enemy presentation, and stronger bespoke art.

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
- `PLAN.md`: detailed holiday-game concept and execution plan

## Notes on generated placeholders
The runtime includes sprite chroma-key cleanup for non-transparent backgrounds, because generated SVG placeholders can include a flat backdrop unexpectedly.
