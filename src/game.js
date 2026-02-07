(() => {
  "use strict";

  const TILE = 48;
  const LEVEL_COLS = 240;
  const LEVEL_ROWS = 16;
  const GROUND_ROW = 13;

  const PLAYER_SMALL = { w: 40, h: 58 };
  const PLAYER_BIG = { w: 40, h: 84 };

  const GRAVITY = 1480;
  const MAX_FALL = 840;

  const WALK_SPEED = 285;
  const RUN_SPEED = 395;
  const ACCEL_GROUND = 3200;
  const ACCEL_AIR = 2200;
  const FRICTION = 3300;

  const JUMP_VELOCITY = 950;
  const BOUNCE_VELOCITY = 460;
  const COYOTE_TIME = 0.32;
  const JUMP_BUFFER = 0.34;

  const START_LIVES = 3;
  const RESPAWN_DELAY = 1.1;
  const DEATH_HOP = 660;
  const VIEW_ASPECT = 16 / 9;
  const VERTICAL_VIEW_PADDING = 24;
  const CHECKPOINTS = [3, 72, 138, 202].map((tileX) => tileX * TILE);
  const PIPE_TILE_COLUMNS = [22, 29, 37, 46, 61, 78, 110, 130, 170];
  const STAGE_CONFIGS = [
    {
      world: "1-1",
      time: 500,
      pitRanges: [[30, 30], [49, 49], [87, 87], [142, 142], [174, 174], [198, 198]],
      enemyTiles: [[55, 10], [126, 10], [188, 10]],
      enemySpeed: 42,
      pipeHeights: [2, 2, 2, 2, 2, 2, 2, 2, 2]
    },
    {
      world: "1-2",
      time: 420,
      pitRanges: [[28, 29], [47, 48], [84, 85], [140, 141], [172, 173], [196, 197]],
      enemyTiles: [[50, 10], [74, 10], [124, 10], [156, 10], [186, 10]],
      enemySpeed: 50,
      pipeHeights: [2, 2, 3, 2, 3, 2, 3, 2, 2]
    },
    {
      world: "1-3",
      time: 340,
      pitRanges: [[26, 28], [45, 47], [81, 83], [136, 138], [168, 170], [193, 195], [207, 208]],
      enemyTiles: [[42, 10], [68, 10], [92, 10], [118, 10], [146, 10], [176, 10], [204, 10]],
      enemySpeed: 58,
      pipeHeights: [2, 3, 3, 2, 3, 3, 3, 2, 3]
    },
    {
      world: "1-4",
      time: 280,
      pitRanges: [[24, 27], [42, 45], [78, 81], [132, 135], [162, 165], [188, 191], [206, 209]],
      enemyTiles: [[36, 10], [58, 10], [84, 10], [112, 10], [140, 10], [166, 10], [194, 10], [214, 10]],
      enemySpeed: 66,
      pipeHeights: [3, 3, 3, 2, 3, 3, 3, 3, 3]
    }
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const hud = {
    root: document.getElementById("hud"),
    score: document.getElementById("hudScore"),
    coins: document.getElementById("hudCoins"),
    world: document.getElementById("hudWorld"),
    time: document.getElementById("hudTime"),
    lives: document.getElementById("hudLives")
  };

  const ui = {
    title: document.getElementById("titleScreen"),
    gameOver: document.getElementById("gameOverScreen"),
    win: document.getElementById("winScreen"),
    startBtn: document.getElementById("startBtn"),
    retryBtn: document.getElementById("retryBtn"),
    againBtn: document.getElementById("againBtn"),
    touch: document.getElementById("touchControls")
  };

  const input = {
    left: false,
    right: false,
    down: false,
    run: false,
    jumpHeld: false,
    jumpPressed: false,
    jumpReleased: false
  };

  function resetInputState() {
    input.left = false;
    input.right = false;
    input.down = false;
    input.run = false;
    input.jumpHeld = false;
    input.jumpPressed = false;
    input.jumpReleased = false;
  }

  function isGameplayInputLocked() {
    if (state.mode !== "playing") {
      return true;
    }
    return Boolean(state.player && state.player.controlLocked);
  }

  const assetPath = {
    player_idle: "assets/player/idle.svg",
    player_run_1: "assets/player/run_1.svg",
    player_run_2: "assets/player/run_2.svg",
    player_run_3: "assets/player/run_3.svg",
    player_jump: "assets/player/jump.svg",
    player_duck: "assets/player/duck.svg",
    player_die: "assets/player/die.svg",
    player_skid: "assets/player/skid.svg",
    player_sheet: "assets/ethan_sheet.png",
    tiles_sheet: "assets/tileset_sheet.png",
    enemies_items_sheet: "assets/enemies_items_sheet.png",
    scenery_sheet: "assets/scenery_sheet.png",
    tile_ground: "assets/tiles/ground.svg",
    tile_dirt: "assets/tiles/dirt.svg",
    tile_brick: "assets/tiles/brick.svg",
    tile_qblock: "assets/tiles/qblock.svg",
    tile_empty: "assets/tiles/empty.svg",
    tile_hard: "assets/tiles/hard.svg",
    goomba: "assets/enemies/goomba.svg",
    goomba_squish: "assets/enemies/goomba_squish.svg",
    coin: "assets/items/coin.svg",
    mushroom: "assets/items/mushroom.svg",
    star: "assets/items/star.svg",
    sky_hq: "assets/sky.png",
    sky: "assets/scenery/bg_sky.svg",
    bush: "assets/scenery/bush_1.svg",
    cloud: "assets/scenery/cloud_1.svg",
    pipe_top: "assets/scenery/pipe_top.svg",
    pipe_body: "assets/scenery/pipe_body.svg",
    heart: "assets/ui/heart.svg"
  };

  const assets = {};
  const audio = { context: null };

  const state = {
    mode: "title",
    world: STAGE_CONFIGS[0].world,
    score: 0,
    coins: 0,
    lives: START_LIVES,
    timeLeft: STAGE_CONFIGS[0].time,
    secondTick: 0,
    cameraX: 0,
    flash: 0,
    level: null,
    player: null,
    enemies: [],
    items: [],
    floating: [],
    particles: [],
    flagCaptured: false,
    flagPoleX: 0,
    castleX: 0,
    respawnTimer: 0,
    checkpointX: 3 * TILE,
    nextCheckpointIdx: 1,
    stageIndex: 0,
    stageConfig: STAGE_CONFIGS[0]
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function pad(value, width) {
    return String(value).padStart(width, "0");
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function ensureAudioContext() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    if (!audio.context) {
      audio.context = new AudioContextCtor();
    }
    return audio.context;
  }

  function unlockAudio() {
    const context = ensureAudioContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }
  }

  function playCoinSound() {
    const context = audio.context;
    if (!context || context.state !== "running") {
      return;
    }

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    gain.connect(context.destination);

    const oscMain = context.createOscillator();
    oscMain.type = "triangle";
    oscMain.frequency.setValueAtTime(1046, now);
    oscMain.frequency.exponentialRampToValueAtTime(1568, now + 0.11);
    oscMain.connect(gain);
    oscMain.start(now);
    oscMain.stop(now + 0.16);

    const oscLayer = context.createOscillator();
    oscLayer.type = "sine";
    oscLayer.frequency.setValueAtTime(1318, now + 0.03);
    oscLayer.frequency.exponentialRampToValueAtTime(1760, now + 0.13);
    oscLayer.connect(gain);
    oscLayer.start(now + 0.03);
    oscLayer.stop(now + 0.16);
  }

  function parseHexColor(hex) {
    const value = hex.startsWith("#") ? hex.slice(1) : hex;
    if (value.length !== 6) {
      return null;
    }
    const int = Number.parseInt(value, 16);
    if (!Number.isFinite(int)) {
      return null;
    }
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
  }

  function colorDistanceSq(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return dr * dr + dg * dg + db * db;
  }

  function detectCornerColor(data, w, h) {
    const sampleOffsets = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
      [Math.floor(w * 0.5), 0],
      [Math.floor(w * 0.5), h - 1],
      [0, Math.floor(h * 0.5)],
      [w - 1, Math.floor(h * 0.5)]
    ];

    const colorCount = new Map();

    for (const [x, y] of sampleOffsets) {
      const idx = (y * w + x) * 4;
      const a = data[idx + 3];
      if (a < 230) {
        continue;
      }
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const key = `${r},${g},${b}`;
      colorCount.set(key, (colorCount.get(key) || 0) + 1);
    }

    let best = null;
    let bestCount = 0;
    for (const [key, count] of colorCount.entries()) {
      if (count > bestCount) {
        best = key;
        bestCount = count;
      }
    }

    if (!best) {
      return null;
    }

    const [r, g, b] = best.split(",").map(Number);
    return { r, g, b };
  }

  function prepareSprite(image, options = {}) {
    const { chroma = false, tolerance = 16, forceColor = null } = options;
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    const cvs = document.createElement("canvas");
    cvs.width = srcW;
    cvs.height = srcH;
    const c2 = cvs.getContext("2d", { willReadFrequently: true });
    c2.imageSmoothingEnabled = false;
    c2.drawImage(image, 0, 0);

    if (!chroma) {
      return cvs;
    }

    const imgData = c2.getImageData(0, 0, srcW, srcH);
    const pixels = imgData.data;

    let key = null;
    if (forceColor) {
      key = parseHexColor(forceColor);
    }
    if (!key) {
      key = detectCornerColor(pixels, srcW, srcH);
    }
    if (!key) {
      return cvs;
    }

    const threshold = tolerance * tolerance;
    for (let i = 0; i < pixels.length; i += 4) {
      const a = pixels[i + 3];
      if (a === 0) {
        continue;
      }
      const dist = colorDistanceSq(pixels[i], pixels[i + 1], pixels[i + 2], key.r, key.g, key.b);
      if (dist <= threshold) {
        pixels[i + 3] = 0;
      }
    }

    c2.putImageData(imgData, 0, 0);
    return cvs;
  }

  function cropSprite(image, rect, options = {}) {
    const { chroma = false, tolerance = 18 } = options;
    const out = document.createElement("canvas");
    out.width = rect.w;
    out.height = rect.h;
    const outCtx = out.getContext("2d");
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return prepareSprite(out, { chroma, tolerance });
  }

  function applyHighQualitySheetOverrides() {
    if (assets.sky_hq) {
      assets.sky = assets.sky_hq;
    }

    if (assets.player_sheet) {
      const playerRects = {
        player_run_1: { x: 36, y: 65, w: 129, h: 208 },
        player_run_2: { x: 188, y: 65, w: 122, h: 208 },
        player_run_3: { x: 334, y: 65, w: 124, h: 207 },
        player_skid: { x: 478, y: 65, w: 125, h: 208 },
        player_jump: { x: 176, y: 310, w: 138, h: 245 },
        player_idle: { x: 36, y: 338, w: 103, h: 257 },
        player_duck: { x: 318, y: 406, w: 127, h: 189 }
      };

      for (const [key, rect] of Object.entries(playerRects)) {
        assets[key] = cropSprite(assets.player_sheet, rect, { chroma: true, tolerance: 26 });
      }
    }

    if (assets.tiles_sheet) {
      const tileRects = {
        tile_ground: { x: 32, y: 44, w: 210, h: 172 },
        tile_dirt: { x: 247, y: 63, w: 154, h: 153 },
        tile_brick: { x: 415, y: 63, w: 167, h: 153 },
        tile_qblock: { x: 245, y: 232, w: 160, h: 175 },
        tile_empty: { x: 415, y: 232, w: 167, h: 176 },
        tile_hard: { x: 56, y: 433, w: 159, h: 159 },
        pipe_top: { x: 240, y: 427, w: 170, h: 178 },
        pipe_body: { x: 410, y: 427, w: 170, h: 178 }
      };

      for (const [key, rect] of Object.entries(tileRects)) {
        assets[key] = cropSprite(assets.tiles_sheet, rect, { chroma: false });
      }
    }

    if (assets.enemies_items_sheet) {
      const entityRects = {
        goomba: { x: 60, y: 65, w: 151, h: 170 },
        coin: { x: 456, y: 252, w: 116, h: 136 },
        mushroom: { x: 60, y: 422, w: 150, h: 147 },
        star: { x: 255, y: 417, w: 146, h: 150 },
        heart: { x: 445, y: 437, w: 135, h: 120 }
      };

      for (const [key, rect] of Object.entries(entityRects)) {
        assets[key] = cropSprite(assets.enemies_items_sheet, rect, { chroma: true, tolerance: 24 });
      }

      if (assets.goomba) {
        assets.goomba_squish = assets.goomba;
      }
    }

    if (assets.scenery_sheet) {
      const sceneryRects = {
        cloud: { x: 249, y: 36, w: 354, h: 196 },
        bush: { x: 27, y: 213, w: 272, h: 204 },
        hill: { x: 26, y: 485, w: 588, h: 138 }
      };

      for (const [key, rect] of Object.entries(sceneryRects)) {
        assets[key] = cropSprite(assets.scenery_sheet, rect, { chroma: true, tolerance: 20 });
      }
    }
  }

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load ${path}`));
      image.src = path;
    });
  }

  async function loadAssets() {
    const entries = Object.entries(assetPath);
    const loadPromises = entries.map(async ([key, path]) => {
      try {
        const image = await loadImage(path);
        const isTile = key.startsWith("tile_")
          || key === "sky"
          || key === "sky_hq"
          || key === "pipe_top"
          || key === "pipe_body"
          || key.endsWith("_sheet");
        const isDynamicSprite = !isTile;
        assets[key] = prepareSprite(image, {
          chroma: isDynamicSprite,
          tolerance: 18,
          forceColor: null
        });
      } catch (err) {
        assets[key] = null;
        console.warn(err.message);
      }
    });

    await Promise.all(loadPromises);
    applyHighQualitySheetOverrides();
  }

  function makeEmptyGrid(cols, rows) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  function createLevel(stage = STAGE_CONFIGS[0]) {
    const tiles = makeEmptyGrid(LEVEL_COLS, LEVEL_ROWS);

    const level = {
      cols: LEVEL_COLS,
      rows: LEVEL_ROWS,
      width: LEVEL_COLS * TILE,
      height: LEVEL_ROWS * TILE,
      tiles,
      pipes: [],
      sceneryClouds: [],
      sceneryBushes: []
    };

    function setTile(x, y, type, extras = {}) {
      if (x < 0 || x >= LEVEL_COLS || y < 0 || y >= LEVEL_ROWS) {
        return;
      }
      tiles[y][x] = {
        type,
        solid: ["ground", "dirt", "brick", "qblock", "empty", "hard"].includes(type),
        bump: 0,
        ...extras
      };
    }

    for (let x = 0; x < LEVEL_COLS; x += 1) {
      setTile(x, GROUND_ROW, "ground");
      setTile(x, GROUND_ROW + 1, "dirt");
      setTile(x, GROUND_ROW + 2, "dirt");
    }

    function addQuestionLine(y, xStart, sequence) {
      let gaveMushroom = false;
      for (let i = 0; i < sequence.length; i += 1) {
        const type = sequence[i];
        const x = xStart + i;
        if (type === "Q") {
          setTile(x, y, "qblock", { used: false, content: gaveMushroom ? "coin" : "mushroom" });
          gaveMushroom = true;
        } else if (type === "B") {
          setTile(x, y, "brick");
        }
      }
    }

    addQuestionLine(9, 15, ["B", "Q", "B", "Q", "B"]);
    addQuestionLine(9, 36, ["Q", "B", "Q", "B"]);
    addQuestionLine(8, 58, ["B", "B", "Q", "B", "B"]);
    addQuestionLine(9, 71, ["Q", "B", "Q"]);
    addQuestionLine(9, 95, ["B", "Q", "B", "Q", "B", "Q"]);
    addQuestionLine(7, 120, ["B", "Q", "B"]);
    addQuestionLine(9, 154, ["Q", "Q", "B", "Q"]);
    addQuestionLine(9, 182, ["B", "B", "Q", "B", "B"]);

    const stairBaseX = 210;
    for (let step = 0; step < 3; step += 1) {
      for (let y = 0; y <= step; y += 1) {
        setTile(stairBaseX + step, GROUND_ROW - y, "hard");
      }
    }

    function addPipe(tileX, height) {
      const topTileY = GROUND_ROW - (height - 1);
      level.pipes.push({ x: tileX * TILE, y: topTileY * TILE, w: TILE * 2, h: TILE * height, heightTiles: height });
    }

    const pipeHeights = (stage && stage.pipeHeights) || [];
    for (let i = 0; i < PIPE_TILE_COLUMNS.length; i += 1) {
      addPipe(PIPE_TILE_COLUMNS[i], pipeHeights[i] || 2);
    }

    const pitRanges = (stage && stage.pitRanges) || [];
    for (const [start, end] of pitRanges) {
      for (let x = start; x <= end; x += 1) {
        for (let y = GROUND_ROW; y <= GROUND_ROW + 2; y += 1) {
          if (x >= 0 && x < LEVEL_COLS && y >= 0 && y < LEVEL_ROWS) {
            level.tiles[y][x] = null;
          }
        }
      }
    }

    for (let x = 8; x < LEVEL_COLS; x += 14) {
      level.sceneryClouds.push({ x: x * TILE + (x % 2) * 80, y: 60 + (x % 3) * 34, w: TILE * 2.6, h: TILE * 1.3 });
    }

    for (let x = 6; x < LEVEL_COLS; x += 18) {
      level.sceneryBushes.push({ x: x * TILE, y: GROUND_ROW * TILE - TILE * 0.9, w: TILE * 2.4, h: TILE * 1.2 });
    }

    return level;
  }

  function tileAt(level, tx, ty) {
    if (tx < 0 || tx >= level.cols || ty < 0 || ty >= level.rows) {
      return null;
    }
    return level.tiles[ty][tx];
  }

  function collectCoin(x, y) {
    state.coins += 1;
    state.score += 100;
    playCoinSound();
    if (state.coins % 50 === 0) {
      state.lives += 1;
      state.floating.push({ text: "חיים +1", x, y: y - 18, t: 0.9, color: "#d4ff8f" });
    }
    state.floating.push({ text: "+100", x, y, t: 0.7, color: "#ffe26f" });
  }

  function spawnMushroom(x, y) {
    state.items.push({
      kind: "mushroom",
      x,
      y,
      w: 28,
      h: 28,
      vx: 72,
      vy: -80,
      alive: true
    });
  }

  function spawnCoinItem(x, y) {
    state.items.push({
      kind: "coin",
      x,
      y,
      w: 28,
      h: 28,
      vx: 0,
      vy: 0,
      baseY: y,
      alive: true,
      t: 0
    });
  }

  function spawnEnemy(x, y, speed = 42) {
    state.enemies.push({
      kind: "goomba",
      x,
      y,
      w: 36,
      h: 36,
      vx: -speed,
      vy: 0,
      dir: -1,
      speed,
      dead: false,
      deadTimer: 0,
      grounded: false
    });
  }

  function initialEnemyLayout(stage = state.stageConfig) {
    const positions = (stage && stage.enemyTiles) || [[55, 10], [126, 10], [188, 10]];
    const speed = Math.max(36, (stage && stage.enemySpeed) || 42);
    for (const [tx, ty] of positions) {
      spawnEnemy(tx * TILE + 6, ty * TILE, speed);
    }
  }

  function initialCoinsLayout() {
    const uniqueCoins = new Set();

    function addCoin(tx, ty) {
      if (!state.level || tx < 1 || tx >= LEVEL_COLS - 1 || ty < 1 || ty >= LEVEL_ROWS - 1) {
        return;
      }
      const key = `${tx},${ty}`;
      if (uniqueCoins.has(key)) {
        return;
      }
      const coinRect = { x: tx * TILE + 10, y: ty * TILE + 10, w: 28, h: 28 };
      const blockers = getVisibleSolidRects(state.level, coinRect.x, coinRect.y, coinRect.w, coinRect.h);
      for (const blocker of blockers) {
        if (overlap(coinRect, blocker)) {
          return;
        }
      }
      uniqueCoins.add(key);
      spawnCoinItem(coinRect.x, coinRect.y);
    }

    for (let tx = 8; tx <= 222; tx += 4) {
      addCoin(tx, tx % 12 === 0 ? 7 : 8);
    }

    for (let tx = 16; tx <= 216; tx += 10) {
      addCoin(tx, 6);
      addCoin(tx + 1, 6);
    }

    const pitRanges = (state.stageConfig && state.stageConfig.pitRanges) || [];
    for (const [start, end] of pitRanges) {
      for (let tx = start - 1; tx <= end + 1; tx += 1) {
        addCoin(tx, 7);
      }
    }

    for (const pipe of state.level.pipes) {
      const tx = Math.round(pipe.x / TILE);
      const ty = Math.max(4, Math.round(pipe.y / TILE) - 1);
      addCoin(tx, ty);
      addCoin(tx + 1, ty);
    }

    for (let tx = 208; tx <= 215; tx += 1) {
      addCoin(tx, tx % 2 === 0 ? 6 : 5);
    }
  }

  function createPlayer(spawnX = 3 * TILE) {
    return {
      x: spawnX,
      y: (GROUND_ROW - 3) * TILE,
      w: PLAYER_SMALL.w,
      h: PLAYER_SMALL.h,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyote: 0,
      jumpBuffer: 0,
      invulnerable: 0,
      hurtTimer: 0,
      big: false,
      controlLocked: false,
      jumpCount: 0,
      animT: 0,
      dead: false
    };
  }

  function getVisibleSolidRects(level, x, y, w, h) {
    const minX = Math.floor((x - TILE) / TILE);
    const maxX = Math.floor((x + w + TILE) / TILE);
    const minY = Math.floor((y - TILE) / TILE);
    const maxY = Math.floor((y + h + TILE) / TILE);

    const solids = [];

    for (let ty = minY; ty <= maxY; ty += 1) {
      for (let tx = minX; tx <= maxX; tx += 1) {
        const tile = tileAt(level, tx, ty);
        if (!tile || !tile.solid) {
          continue;
        }
        solids.push({ x: tx * TILE, y: ty * TILE, w: TILE, h: TILE, tx, ty, tile, category: "tile" });
      }
    }

    for (const pipe of level.pipes) {
      if (pipe.x + pipe.w < x - TILE || pipe.x > x + w + TILE || pipe.y + pipe.h < y - TILE || pipe.y > y + h + TILE) {
        continue;
      }
      solids.push({ ...pipe, category: "pipe" });
    }

    return solids;
  }

  function settleTileHitFromBelow(solid) {
    if (solid.category !== "tile") {
      return;
    }
    const tile = solid.tile;
    if (!tile) {
      return;
    }

    tile.bump = 0.15;
    const worldX = solid.x + TILE / 2;
    const worldY = solid.y;

    if (tile.type === "qblock") {
      if (!tile.used) {
        tile.used = true;
        tile.type = "empty";
        if (tile.content === "mushroom") {
          spawnMushroom(solid.x + 10, solid.y - 30);
          state.score += 1000;
          state.floating.push({ text: "+1000", x: worldX, y: worldY - 6, t: 0.9, color: "#ffe26f" });
        } else {
          collectCoin(worldX, worldY - 6);
        }
      }
    } else if (tile.type === "brick") {
      if (state.player.big) {
        state.level.tiles[solid.ty][solid.tx] = null;
        state.score += 50;
        state.floating.push({ text: "+50", x: worldX, y: worldY - 6, t: 0.7, color: "#ffc8a2" });
        for (let i = 0; i < 6; i += 1) {
          state.particles.push({
            x: worldX,
            y: worldY + 10,
            vx: (Math.random() * 180) - 90,
            vy: -220 - Math.random() * 120,
            life: 0.5,
            color: "#c14f35"
          });
        }
      } else {
        state.score += 10;
      }
    }
  }

  function moveWithCollisions(entity, dt, onHeadHit) {
    const level = state.level;

    entity.x += entity.vx * dt;
    let solids = getVisibleSolidRects(level, entity.x, entity.y, entity.w, entity.h);
    for (const s of solids) {
      if (!overlap(entity, s)) {
        continue;
      }
      if (entity.vx > 0) {
        entity.x = s.x - entity.w;
      } else if (entity.vx < 0) {
        entity.x = s.x + s.w;
      }
      entity.vx = 0;
    }

    entity.onGround = false;

    const prevY = entity.y;
    entity.y += entity.vy * dt;
    solids = getVisibleSolidRects(level, entity.x, entity.y, entity.w, entity.h);

    for (const s of solids) {
      if (!overlap(entity, s)) {
        continue;
      }
      const wasAbove = prevY + entity.h <= s.y + 1;
      const wasBelow = prevY >= s.y + s.h - 1;
      if (entity.vy > 0 || (entity.vy === 0 && wasAbove)) {
        entity.y = s.y - entity.h;
        entity.vy = 0;
        entity.onGround = true;
      } else if (entity.vy < 0 || (entity.vy === 0 && wasBelow)) {
        entity.y = s.y + s.h;
        entity.vy = 0;
        if (onHeadHit) {
          onHeadHit(s);
        }
      }
    }
  }

  function hurtPlayer() {
    const p = state.player;
    if (p.invulnerable > 0 || state.mode !== "playing") {
      return;
    }

    if (p.big) {
      p.big = false;
      p.h = PLAYER_SMALL.h;
      p.invulnerable = 2.2;
      p.y += PLAYER_BIG.h - PLAYER_SMALL.h;
      return;
    }

    state.lives -= 1;
    state.mode = "dying";
    p.dead = true;
    p.controlLocked = true;
    p.vx = 0;
    p.vy = -DEATH_HOP;
    resetInputState();
    state.respawnTimer = RESPAWN_DELAY;
  }

  function collectMushroom() {
    const p = state.player;
    if (p.big) {
      state.score += 500;
      state.floating.push({ text: "+500", x: p.x + 20, y: p.y - 10, t: 0.8, color: "#c5ff85" });
      return;
    }
    p.big = true;
    p.y -= PLAYER_BIG.h - PLAYER_SMALL.h;
    p.h = PLAYER_BIG.h;
    p.invulnerable = 1.6;
    state.score += 1000;
    state.floating.push({ text: "כוח על!", x: p.x + 20, y: p.y - 10, t: 1.0, color: "#c5ff85" });
  }

  function loadStage(stageIndex) {
    const safeIndex = clamp(stageIndex, 0, STAGE_CONFIGS.length - 1);
    const stage = STAGE_CONFIGS[safeIndex];

    state.stageIndex = safeIndex;
    state.stageConfig = stage;
    state.world = stage.world;
    state.timeLeft = stage.time;
    state.secondTick = 0;
    state.cameraX = 0;
    state.flash = 0;
    state.flagCaptured = false;
    state.checkpointX = CHECKPOINTS[0];
    state.nextCheckpointIdx = 1;
    state.level = createLevel(stage);
    state.player = createPlayer(state.checkpointX);
    state.enemies = [];
    state.items = [];
    state.floating = [];
    state.particles = [];
    state.flagPoleX = 224 * TILE;
    state.castleX = 230 * TILE;

    initialEnemyLayout(stage);
    initialCoinsLayout();
  }

  function advanceToNextStage() {
    if (state.stageIndex >= STAGE_CONFIGS.length - 1) {
      state.mode = "win";
      ui.win.classList.remove("hidden");
      return;
    }

    const timeBonus = Math.max(0, state.timeLeft) * 5;
    state.score += 2500 + timeBonus;
    loadStage(state.stageIndex + 1);
    state.mode = "playing";
    state.player.invulnerable = 1.2;
    state.floating.push({ text: `שלב ${state.world}`, x: state.player.x + 70, y: state.player.y - 18, t: 1.2, color: "#fff5a8" });
  }

  function startGame() {
    state.mode = "playing";
    resetInputState();
    state.score = 0;
    state.coins = 0;
    state.lives = START_LIVES;
    loadStage(0);
    state.mode = "playing";

    ui.title.classList.add("hidden");
    ui.gameOver.classList.add("hidden");
    ui.win.classList.add("hidden");
    hud.root.classList.remove("hidden");
  }

  function resetAfterDeath() {
    if (state.lives <= 0) {
      state.mode = "gameover";
      ui.gameOver.classList.remove("hidden");
      resetInputState();
      return;
    }

    state.mode = "playing";
    resetInputState();
    state.timeLeft = Math.max(90, state.timeLeft);
    state.player = createPlayer(state.checkpointX);
    state.player.invulnerable = 1.8;
    state.cameraX = clamp(state.checkpointX - canvas.clientWidth * 0.25, 0, Math.max(0, state.level.width - canvas.clientWidth));
  }

  function keySet(code, down) {
    if (down && isGameplayInputLocked()) {
      return;
    }

    if (code === "ArrowLeft" || code === "KeyA") {
      input.left = down;
    }
    if (code === "ArrowRight" || code === "KeyD") {
      input.right = down;
    }
    if (code === "ArrowDown" || code === "KeyS") {
      input.down = down;
    }
    if (code === "ShiftLeft" || code === "ShiftRight") {
      input.run = down;
    }

    if (code === "Space" || code === "ArrowUp" || code === "KeyW" || code === "KeyZ") {
      if (down && !input.jumpHeld) {
        input.jumpPressed = true;
      }
      if (!down && input.jumpHeld) {
        input.jumpReleased = true;
      }
      input.jumpHeld = down;
    }
  }

  function setupInput() {
    window.addEventListener("keydown", (event) => {
      unlockAudio();
      keySet(event.code, true);
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(event.code)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    window.addEventListener("keyup", (event) => {
      keySet(event.code, false);
    });

    const buttons = ui.touch.querySelectorAll("button[data-touch]");
    buttons.forEach((btn) => {
      const action = btn.dataset.touch;
      const press = (on) => {
        if (on && isGameplayInputLocked()) {
          return;
        }
        if (action === "left") {
          input.left = on;
        } else if (action === "right") {
          input.right = on;
        } else if (action === "run") {
          input.run = on;
        } else if (action === "jump") {
          if (on && !input.jumpHeld) {
            input.jumpPressed = true;
          }
          if (!on && input.jumpHeld) {
            input.jumpReleased = true;
          }
          input.jumpHeld = on;
        }
      };

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        unlockAudio();
        press(true);
      });
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        press(false);
      });
      btn.addEventListener("pointercancel", () => press(false));
      btn.addEventListener("pointerleave", () => press(false));
    });
  }

  function updatePlayer(dt) {
    const p = state.player;

    if (p.invulnerable > 0) {
      p.invulnerable -= dt;
    }

    if (state.flagCaptured) {
      p.controlLocked = true;
      if (!p.onGround) {
        p.vx = 0;
        p.vy = Math.max(p.vy, 180);
      } else {
        p.vx = 120;
      }
    }

    if (!p.controlLocked) {
      const dir = (input.left ? -1 : 0) + (input.right ? 1 : 0);
      const topSpeed = input.run ? RUN_SPEED : WALK_SPEED;
      const target = dir * topSpeed;
      const accel = p.onGround ? ACCEL_GROUND : ACCEL_AIR;

      if (dir !== 0) {
        p.facing = dir;
        const turning = p.onGround && Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== dir;
        const steerAccel = turning ? accel * 1.45 : accel;
        if (p.vx < target) {
          p.vx = Math.min(target, p.vx + steerAccel * dt);
        } else if (p.vx > target) {
          p.vx = Math.max(target, p.vx - steerAccel * dt);
        }
      } else {
        const frictionDelta = FRICTION * dt;
        if (p.vx > 0) {
          p.vx = Math.max(0, p.vx - frictionDelta);
        } else if (p.vx < 0) {
          p.vx = Math.min(0, p.vx + frictionDelta);
        }
      }

      if (p.onGround) {
        p.coyote = COYOTE_TIME;
        p.jumpCount = 0;
      } else {
        p.coyote = Math.max(0, p.coyote - dt);
      }

      if (input.jumpPressed) {
        p.jumpBuffer = JUMP_BUFFER;
      } else {
        p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
      }

      const canGroundJump = p.onGround || p.coyote > 0;
      const canDoubleJump = !canGroundJump && p.jumpCount === 1;
      if (p.jumpBuffer > 0 && (canGroundJump || canDoubleJump)) {
        p.vy = canDoubleJump ? -JUMP_VELOCITY * 0.96 : -JUMP_VELOCITY;
        p.onGround = false;
        p.jumpBuffer = 0;
        p.coyote = 0;
        p.jumpCount = Math.min(2, p.jumpCount + 1);
      }

      if (input.jumpReleased && p.vy < -280) {
        p.vy *= 0.62;
      }
    }

    p.vy = clamp(p.vy + GRAVITY * dt, -1200, MAX_FALL);

    moveWithCollisions(p, dt, settleTileHitFromBelow);

    if (p.y > state.level.height + TILE * 2) {
      hurtPlayer();
    }

    if (!state.flagCaptured) {
      const flagRect = { x: state.flagPoleX, y: (GROUND_ROW - 5) * TILE, w: 16, h: 6 * TILE };
      if (overlap(p, flagRect)) {
        state.flagCaptured = true;
        state.score += 5000;
        state.floating.push({ text: "דגל +5000", x: p.x, y: p.y - 20, t: 1.2, color: "#fff5a8" });
      }
    } else if (p.x > state.castleX + TILE * 1.5 && state.mode === "playing") {
      advanceToNextStage();
    }

    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }

    if (p.x + p.w > state.level.width) {
      p.x = state.level.width - p.w;
      p.vx = 0;
    }

    if (!state.flagCaptured && state.nextCheckpointIdx < CHECKPOINTS.length && p.x >= CHECKPOINTS[state.nextCheckpointIdx]) {
      state.checkpointX = CHECKPOINTS[state.nextCheckpointIdx];
      state.nextCheckpointIdx += 1;
      state.floating.push({ text: "נקודת שמירה", x: p.x + 12, y: p.y - 14, t: 1, color: "#b7ebff" });
    }

    p.animT += dt;
  }

  function enemySupportCheck(enemy) {
    const dir = Math.sign(enemy.vx || enemy.dir || -1) || -1;
    const feetY = enemy.y + enemy.h + 2;
    const frontEdgeX = dir > 0 ? enemy.x + enemy.w - 2 : enemy.x - 2;
    const probeOffsets = [dir * 4, dir * 10];

    for (const offset of probeOffsets) {
      const probe = {
        x: frontEdgeX + offset,
        y: feetY,
        w: 4,
        h: 4
      };
      const solids = getVisibleSolidRects(state.level, probe.x, probe.y, probe.w, probe.h);
      for (const s of solids) {
        if (overlap(probe, s)) {
          return true;
        }
      }
    }
    return false;
  }

  function updateEnemies(dt) {
    const p = state.player;

    for (const enemy of state.enemies) {
      if (enemy.dead) {
        enemy.deadTimer -= dt;
        continue;
      }

      const prevVx = enemy.vx;
      const speed = enemy.speed || 42;
      enemy.vy = clamp(enemy.vy + GRAVITY * dt, -900, MAX_FALL);
      moveWithCollisions(enemy, dt, null);

      if (Math.abs(enemy.vx) < 1 && enemy.onGround) {
        const lastDir = Math.sign(prevVx) || enemy.dir || -1;
        enemy.dir = -lastDir;
        enemy.vx = enemy.dir * speed;
      }

      if (enemy.onGround && !enemySupportCheck(enemy)) {
        enemy.dir = -(Math.sign(enemy.vx) || enemy.dir || 1);
        enemy.vx = enemy.dir * speed;
      }

      if (enemy.x < 0) {
        enemy.x = 0;
        enemy.dir = 1;
        enemy.vx = speed;
      } else if (enemy.x > state.level.width - enemy.w) {
        enemy.x = state.level.width - enemy.w;
        enemy.dir = -1;
        enemy.vx = -speed;
      } else if (Math.abs(enemy.vx) >= 1) {
        enemy.dir = Math.sign(enemy.vx);
      }

      if (overlap(p, enemy) && !p.dead && state.mode === "playing") {
        const playerBottom = p.y + p.h;
        const stomp = p.vy > 120 && playerBottom - enemy.y < 28;
        if (stomp) {
          enemy.dead = true;
          enemy.deadTimer = 0.45;
          p.vy = -BOUNCE_VELOCITY;
          state.score += 100;
          state.floating.push({ text: "+100", x: enemy.x, y: enemy.y, t: 0.7, color: "#ffe26f" });
        } else {
          hurtPlayer();
        }
      }
    }

    state.enemies = state.enemies.filter((e) => e.deadTimer > 0 || !e.dead);
  }

  function updateItems(dt) {
    const p = state.player;

    for (const item of state.items) {
      if (!item.alive) {
        continue;
      }

      if (item.kind === "coin") {
        item.t += dt;
        item.y = item.baseY + Math.sin(item.t * 7) * 5;
      } else if (item.kind === "mushroom") {
        item.vy = clamp(item.vy + GRAVITY * dt, -900, MAX_FALL);
        moveWithCollisions(item, dt, null);
        if (Math.abs(item.vx) < 1) {
          item.vx = (Math.random() > 0.5 ? 1 : -1) * 80;
        }
        if (item.x < 0 || item.x > state.level.width - item.w) {
          item.vx *= -1;
        }
      }

      if (overlap(item, p)) {
        item.alive = false;
        if (item.kind === "coin") {
          collectCoin(item.x + 8, item.y - 8);
        } else if (item.kind === "mushroom") {
          collectMushroom();
        }
      }
    }

    state.items = state.items.filter((it) => it.alive);
  }

  function updateTiles(dt) {
    const level = state.level;
    for (let y = 0; y < level.rows; y += 1) {
      for (let x = 0; x < level.cols; x += 1) {
        const tile = level.tiles[y][x];
        if (!tile) {
          continue;
        }
        if (tile.bump > 0) {
          tile.bump = Math.max(0, tile.bump - dt);
        }
      }
    }
  }

  function updateFloating(dt) {
    for (const msg of state.floating) {
      msg.t -= dt;
      msg.y -= 34 * dt;
    }
    state.floating = state.floating.filter((msg) => msg.t > 0);
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.vy += GRAVITY * 0.55 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
  }

  function updateCamera(dt) {
    const viewW = canvas.clientWidth;
    const p = state.player;
    const target = p.x - viewW * 0.35;
    const maxCam = Math.max(0, state.level.width - viewW);
    state.cameraX += (target - state.cameraX) * Math.min(1, dt * 5.5);
    state.cameraX = clamp(state.cameraX, 0, maxCam);
  }

  function updateTimer(dt) {
    if (state.mode !== "playing") {
      return;
    }

    state.secondTick += dt;
    while (state.secondTick >= 1) {
      state.secondTick -= 1;
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        hurtPlayer();
        break;
      }
    }
  }

  function update(dt) {
    if (!state.level || !state.player) {
      return;
    }

    if (state.mode === "title" || state.mode === "gameover" || state.mode === "win") {
      input.jumpPressed = false;
      input.jumpReleased = false;
      return;
    }

    if (state.mode === "dying") {
      const p = state.player;
      p.vy = clamp(p.vy + GRAVITY * dt, -1200, MAX_FALL);
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      state.respawnTimer -= dt;
      if (state.respawnTimer <= 0) {
        resetAfterDeath();
      }
      updateCamera(dt);
      input.jumpPressed = false;
      input.jumpReleased = false;
      return;
    }

    updateTiles(dt);
    updatePlayer(dt);
    updateEnemies(dt);
    updateItems(dt);
    updateFloating(dt);
    updateParticles(dt);
    updateCamera(dt);
    updateTimer(dt);

    if (state.player.invulnerable > 0) {
      state.flash += dt * 18;
    }

    input.jumpPressed = false;
    input.jumpReleased = false;
  }

  function getTileImage(type) {
    if (type === "ground") return assets.tile_ground;
    if (type === "dirt") return assets.tile_dirt;
    if (type === "brick") return assets.tile_brick;
    if (type === "qblock") return assets.tile_qblock;
    if (type === "empty") return assets.tile_empty;
    if (type === "hard") return assets.tile_hard;
    return null;
  }

  function drawImageOrFallback(image, x, y, w, h, color) {
    if (image) {
      ctx.drawImage(image, x, y, w, h);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
  }

  function getWorldRenderOffsetY(viewH) {
    if (!state.level) {
      return 0;
    }
    return Math.min(0, viewH - state.level.height - VERTICAL_VIEW_PADDING);
  }

  function drawBackground(viewW, viewH, offsetY) {
    const sky = assets.sky_hq || assets.sky;
    if (sky) {
      if (sky.width >= 256 && sky.height >= 256) {
        const drift = ((state.cameraX * 0.12) % viewW);
        ctx.drawImage(sky, -drift, 0, viewW, viewH);
        ctx.drawImage(sky, viewW - drift, 0, viewW, viewH);
      } else {
        const sw = 64;
        const sh = 64;
        for (let x = -((state.cameraX * 0.15) % sw) - sw; x < viewW + sw; x += sw) {
          for (let y = 0; y < viewH + sh; y += sh) {
            ctx.drawImage(sky, x, y, sw, sh);
          }
        }
      }
    } else {
      ctx.fillStyle = "#87ceeb";
      ctx.fillRect(0, 0, viewW, viewH);
    }

    const cloudImg = assets.cloud;
    const bushImg = assets.bush;
    const hillImg = assets.hill || null;

    for (const cloud of state.level.sceneryClouds) {
      const x = cloud.x - state.cameraX * 0.45;
      drawImageOrFallback(cloudImg, x, cloud.y + offsetY, cloud.w, cloud.h, "rgba(255,255,255,0.8)");
    }

    if (hillImg) {
      for (let x = -220; x < viewW + 220; x += 290) {
        const hillX = x - (state.cameraX * 0.22 % 290);
        drawImageOrFallback(hillImg, hillX, (GROUND_ROW * TILE - 112) + offsetY, 290, 96, "#66a64b");
      }
    }

    for (const bush of state.level.sceneryBushes) {
      const x = bush.x - state.cameraX * 0.78;
      drawImageOrFallback(bushImg, x, bush.y + offsetY, bush.w, bush.h, "#2f9e4f");
    }
  }

  function drawTiles(offsetY) {
    const level = state.level;
    const viewW = canvas.clientWidth;
    const startX = Math.floor(state.cameraX / TILE) - 1;
    const endX = Math.floor((state.cameraX + viewW) / TILE) + 1;

    for (let y = 0; y < level.rows; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const tile = tileAt(level, x, y);
        if (!tile) {
          continue;
        }

        let drawY = y * TILE;
        if (tile.bump > 0) {
          const bumpNorm = tile.bump / 0.15;
          drawY -= Math.sin(bumpNorm * Math.PI) * 8;
        }

        const image = getTileImage(tile.type);
        drawImageOrFallback(image, x * TILE - state.cameraX, drawY + offsetY, TILE, TILE, "#7d5a34");
      }
    }
  }

  function drawPipes(offsetY) {
    const topImg = assets.pipe_top;
    const bodyImg = assets.pipe_body;

    for (const pipe of state.level.pipes) {
      for (let i = 0; i < pipe.heightTiles; i += 1) {
        const py = pipe.y + i * TILE;
        const isTop = i === 0;
        const img = isTop ? topImg : bodyImg;
        drawImageOrFallback(img, pipe.x - state.cameraX, py + offsetY, pipe.w, TILE, "#169b3d");
      }
    }
  }

  function drawFlagAndCastle(offsetY) {
    const poleX = state.flagPoleX - state.cameraX;
    const poleY = (GROUND_ROW - 5) * TILE + offsetY;

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(poleX, poleY, 10, 6 * TILE);

    ctx.fillStyle = "#2ecf56";
    ctx.fillRect(poleX + 10, poleY + 16, 52, 32);

    const castleBaseX = state.castleX - state.cameraX;
    const castleBaseY = (GROUND_ROW - 2) * TILE + offsetY;
    ctx.fillStyle = "#8a8478";
    ctx.fillRect(castleBaseX, castleBaseY, TILE * 3.5, TILE * 2);
    ctx.fillStyle = "#6f6558";
    ctx.fillRect(castleBaseX + TILE * 1.1, castleBaseY - TILE * 1.2, TILE * 1.3, TILE * 1.2);
  }

  function drawItems(offsetY) {
    for (const item of state.items) {
      const x = item.x - state.cameraX;
      if (item.kind === "coin") {
        drawImageOrFallback(assets.coin, x, item.y + offsetY, item.w, item.h, "#f6da55");
      } else if (item.kind === "mushroom") {
        drawImageOrFallback(assets.mushroom, x, item.y + offsetY, item.w, item.h, "#ff4747");
      }
    }
  }

  function drawEnemies(offsetY) {
    for (const enemy of state.enemies) {
      const x = enemy.x - state.cameraX;
      if (enemy.dead) {
        drawImageOrFallback(assets.goomba_squish || assets.goomba, x, enemy.y + enemy.h * 0.45 + offsetY, enemy.w, enemy.h * 0.55, "#7f4f2f");
      } else {
        drawImageOrFallback(assets.goomba, x, enemy.y + offsetY, enemy.w, enemy.h, "#7f4f2f");
      }
    }
  }

  function drawPlayer(offsetY) {
    const p = state.player;
    const drawX = p.x - state.cameraX;
    const drawY = p.y + offsetY;

    let image = assets.player_idle;
    const speed = Math.abs(p.vx);
    const skidding = !p.controlLocked && p.onGround && ((input.left && p.vx > 40) || (input.right && p.vx < -40));

    if (p.dead) {
      image = assets.player_die;
    } else if (!p.onGround) {
      image = assets.player_jump;
    } else if (input.down && p.big) {
      image = assets.player_duck;
    } else if (skidding) {
      image = assets.player_skid;
    } else if (speed > 45) {
      const frame = Math.floor(p.animT * 13) % 3;
      image = frame === 0 ? assets.player_run_1 : (frame === 1 ? assets.player_run_2 : assets.player_run_3);
    }

    const flicker = p.invulnerable > 0 && Math.floor(state.flash) % 2 === 0;
    if (flicker) {
      return;
    }

    ctx.save();
    if (p.facing < 0) {
      ctx.translate(drawX + p.w, drawY);
      ctx.scale(-1, 1);
      drawImageOrFallback(image, 0, 0, p.w, p.h, "#3153e1");
    } else {
      drawImageOrFallback(image, drawX, drawY, p.w, p.h, "#3153e1");
    }
    ctx.restore();
  }

  function drawFloatingText(offsetY) {
    ctx.font = "bold 16px Verdana";
    ctx.textAlign = "center";
    for (const msg of state.floating) {
      ctx.fillStyle = msg.color;
      ctx.fillText(msg.text, msg.x - state.cameraX, msg.y + offsetY);
    }
    ctx.textAlign = "left";
  }

  function drawParticles(offsetY) {
    for (const p of state.particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - state.cameraX, p.y + offsetY, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    const viewW = canvas.clientWidth;
    const viewH = canvas.clientHeight;
    const offsetY = getWorldRenderOffsetY(viewH);

    ctx.clearRect(0, 0, viewW, viewH);

    if (!state.level || !state.player) {
      return;
    }

    drawBackground(viewW, viewH, offsetY);
    drawTiles(offsetY);
    drawPipes(offsetY);
    drawFlagAndCastle(offsetY);
    drawItems(offsetY);
    drawEnemies(offsetY);
    drawParticles(offsetY);
    drawPlayer(offsetY);
    drawFloatingText(offsetY);
  }

  function updateHud() {
    hud.score.textContent = `ניקוד ${pad(state.score, 6)}`;
    hud.coins.textContent = `מטבעות x${pad(state.coins, 2)}`;
    hud.world.textContent = `עולם ${state.world}`;
    hud.time.textContent = `זמן ${pad(Math.max(0, state.timeLeft), 3)}`;
    hud.lives.textContent = `חיים x${state.lives}`;
  }

  function resizeCanvas() {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    let cssW = window.innerWidth;
    let cssH = window.innerHeight;
    const targetAspect = window.innerHeight > window.innerWidth ? (4 / 3) : VIEW_ASPECT;
    const currentAspect = cssW / cssH;

    if (currentAspect > targetAspect) {
      cssW = Math.floor(cssH * targetAspect);
    } else {
      cssH = Math.floor(cssW / targetAspect);
    }

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * ratio);
    canvas.height = Math.floor(cssH * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  let lastFrame = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - lastFrame) / 1000);
    lastFrame = now;

    update(dt);
    render();
    updateHud();

    requestAnimationFrame(loop);
  }

  function wireUi() {
    ui.startBtn.addEventListener("click", () => {
      unlockAudio();
      startGame();
    });
    ui.retryBtn.addEventListener("click", () => {
      unlockAudio();
      ui.gameOver.classList.add("hidden");
      startGame();
    });
    ui.againBtn.addEventListener("click", () => {
      unlockAudio();
      ui.win.classList.add("hidden");
      startGame();
    });
  }

  async function init() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    wireUi();
    setupInput();

    await loadAssets();
    loadStage(0);
    state.mode = "title";

    hud.root.classList.add("hidden");
    requestAnimationFrame(loop);
  }

  init().catch((err) => {
    console.error(err);
    ui.title.innerHTML = "<h1>שגיאת טעינה</h1><p>לא ניתן לטעון את קבצי המשחק.</p>";
  });
})();
