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

## Graphics Runtime Plan
- Treat the current `assets/ethan_sheet.png` as the premium player-art source.
- Keep player crop metadata in `assets/atlas/player_sheet_manifest.json` during normal runtime; keep the built-in JS copy only as an offline fallback if the JSON fails to load.
- Validate every atlas rect before it overrides an existing asset; if a crop is invalid or empty, keep the fallback asset already loaded.
- `player_win` is an explicit runtime capability and stays disabled until a dedicated high-quality win asset is shipped.
- Missing future states such as `jump_apex`, `jump_fall`, `land`, or `run_start` should be declared as aliases in the manifest until real art exists.

## Ending Assets And Fallback Rules
- Preferred long-term direction: dedicated ending assets for `flag`, `castle`, `checkpoint`, and `win` presentation.
- Current acceptable runtime fallback: procedural `flag/castle` drawing in code, plus normal player animation when dedicated win art is absent.
- Do not block gameplay on missing ending art. Missing end assets should degrade gracefully to the procedural fallback, not crash the game.
- Asset verification must explicitly include `player_win` and the current ending fallback policy.

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
- Mobile-safe HUD and touch layout.
- Atlas validation before runtime overrides.

8. QA + balancing
- Validate all asset loads.
- Test pits, enemy collisions, block hits from below, timer death, and win trigger.
- Fine-tune physics for feel and fairness.

## QA Checklist
- Start screen launches game and HUD updates.
- Player can run/jump/duck and collides correctly with ground/blocks/pipes.
- Mobile touch controls support left/right/run/jump/down.
- Enemy stomp works; side hit causes damage.
- Question blocks become empty after use.
- Mushroom increases player size.
- Falling into pit or timer reaching 0 causes life loss.
- Winning at flag triggers win state.
- Mobile touch controls move and jump consistently.
- `player_win` only enables when a dedicated high-quality asset is explicitly marked ready, and ending visuals fall back cleanly when dedicated art is missing.
- Player sheet manifest loads and invalid atlas crops do not override working fallback assets.

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
- Current graphics direction: HD rendering, improved effects, manifest-backed player sheet overrides with feet-locked placement, and mobile hardening.
- Next graphics step: replace procedural end-goal visuals with a dedicated ending asset pack while keeping the current fallback path.
