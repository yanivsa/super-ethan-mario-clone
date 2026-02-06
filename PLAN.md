# Super Ethan Clone Plan (2D Mario-Style)

## Goal
Build the closest legal-feasible gameplay clone of early 2D Mario (movement feel, level structure, enemies, item loop, HUD/timer, flag finish) using plain HTML/CSS/JavaScript and your placeholder assets.

## What "closest clone" means in this project
- Side-scrolling tile-based world with pits, pipes, stairs, bricks, and question blocks.
- Momentum-based movement: acceleration, friction, coyote time, jump buffering, variable jump height.
- Core interactions: stomping enemies, getting hurt, power-up state (small/big), coins, score, lives, timer.
- World flow: start screen, active run, death-respawn, game over, win condition via flag/castle.
- Responsive canvas and touch controls for mobile.

## Asset Strategy (important constraints)
Your image generator may produce non-transparent sprite backgrounds. To make these usable:
- Use explicit prompt requirement: "transparent background, no backdrop rectangle, alpha channel required".
- Runtime safety net in engine: chroma-key cleanup for dynamic sprites (sample corner color and remove matching pixels).
- Keep tiles fully opaque (do not chroma-key terrain tiles).

## Recommended Prompt Template for Future Asset Re-generation
Use this exact shape when requesting replacement assets:

"Create a pixel-art [ASSET_NAME] sprite for a 2D platformer.
- Output: SVG, exact size [WIDTH]x[HEIGHT]
- Background: fully transparent (alpha), no sky or solid fill
- Style: retro 16-bit, clean edges, high contrast
- Composition: centered, with 2-4 px padding from canvas bounds
- No text except when explicitly requested
- Return only valid standalone SVG markup"

If transparency still fails, request:
"Use `fill=\"none\"` for background and do not include full-canvas rect." 

## Implementation Milestones
1. Engine foundation
- Create canvas game loop, fixed timestep behavior, camera, and world coordinates.
- Add keyboard + touch input abstraction.

2. Asset loading & fallback
- Load all placeholder SVGs.
- Add robust fallback rendering for missing asset files.
- Add sprite chroma-key cleanup for non-transparent outputs.

3. Tilemap and collision
- Build level data grid and pipe solids.
- Implement axis-separated AABB collision for player, enemies, and moving items.

4. Player controller parity
- Tune movement constants (walk/run speed, acceleration/friction, gravity).
- Add jump buffering, coyote time, and jump-cut for variable jump height.

5. Gameplay entities
- Goomba patrol logic, stomp detection, and squish state.
- Question blocks and bricks with bumping and content rules.
- Coin collectibles and mushroom power-ups.

6. State machine + progression
- HUD score/coins/time/lives.
- Damage model: small -> death, big -> shrink.
- Death, respawn, game over, flagpole win flow.

7. Visual polish
- Parallax sky/cloud/bush layers.
- Floating score text and simple particles.
- Retro UI overlays.

8. QA + balancing
- Validate all asset loads.
- Test pits, enemy collisions, block hits from below, timer death, and win trigger.
- Fine-tune physics for feel and fairness.

## QA Checklist
- Start screen launches game and HUD updates.
- Player can run/jump/duck and collides correctly with ground/blocks/pipes.
- Enemy stomp works; side hit causes damage.
- Question blocks become empty after use.
- Mushroom increases player size.
- Falling into pit or timer reaching 0 causes life loss.
- Winning at flag triggers win state.
- Mobile touch controls move and jump consistently.

## Deployment Plan
1. Initialize git in workspace.
2. Commit the full static game.
3. Create GitHub repository and push `main`.
4. Deploy static output to Cloudflare (Pages preferred; Worker fallback if Pages API unavailable in MCP).
5. Verify public URL and run live smoke test.

## Current Status
- Engine and playable clone implemented in `src/game.js`.
- UI and responsive controls implemented in `index.html` and `styles.css`.
- Asset placeholders wired from `assets/`.
- Browser smoke test completed locally.
- Next step: repository creation + push + Cloudflare deployment URL verification.
