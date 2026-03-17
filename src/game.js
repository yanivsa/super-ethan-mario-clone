(() => {
  "use strict";

  const TILE = 48;
  const LEVEL_COLS = 240;
  const LEVEL_ROWS = 16;
  const GROUND_ROW = 13;

  const PLAYER_SMALL = { w: 40, h: 58 };
  const PLAYER_BIG = { w: 40, h: 84 };
  const GOOMBA_SIZE = 44;
  const MUSHROOM_SIZE = 42;

  const GRAVITY = 1480;
  const MAX_FALL = 840;

  const WALK_SPEED = 300;
  const RUN_SPEED = 425;
  const ACCEL_GROUND = 3450;
  const ACCEL_AIR = 2350;
  const FRICTION = 3500;

  const JUMP_VELOCITY = 975;
  const BOUNCE_VELOCITY = 460;
  const COYOTE_TIME = 0.32;
  const JUMP_BUFFER = 0.34;

  const START_LIVES = 3;
  const RESPAWN_DELAY = 1.1;
  const DEATH_HOP = 660;
  const VIEW_ASPECT = 16 / 9;
  const VERTICAL_VIEW_PADDING = 24;
  const MAX_RENDER_RATIO = 3;
  const CAMERA_FOLLOW = 6.6;
  const CAMERA_LOOKAHEAD = 0.2;
  const PLAYER_FRAME_KEYS = [
    "player_idle",
    "player_run_1",
    "player_run_2",
    "player_run_3",
    "player_jump",
    "player_duck",
    "player_die",
    "player_skid"
  ];
  const CHECKPOINTS = [3, 72, 138, 202].map((tileX) => tileX * TILE);
  const PIPE_TILE_COLUMNS = [22, 29, 37, 46, 61, 78, 110, 130, 170];
  const STAGE_CONFIGS = [
    {
      world: "1-1",
      time: 500,
      pitRanges: [[30, 30], [49, 49], [87, 87], [142, 142], [174, 174], [198, 198]],
      enemyTiles: [[55, 10], [126, 10], [188, 10]],
      enemySpeed: 42,
      pipeHeights: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      theme: {
        skyTop: "#9cdeff",
        skyMid: "#67b9ff",
        skyBottom: "#2767c3",
        haze: "#fef4c7",
        bannerAccent: "#ffd25b",
        bannerGlow: "#ff9340",
        hillTint: "rgba(130, 212, 113, 0.32)",
        bushTint: "rgba(59, 183, 117, 0.16)"
      }
    },
    {
      world: "1-2",
      time: 420,
      pitRanges: [[28, 29], [47, 48], [84, 85], [140, 141], [172, 173], [196, 197]],
      enemyTiles: [[50, 10], [74, 10], [124, 10], [156, 10], [186, 10]],
      enemySpeed: 50,
      pipeHeights: [2, 2, 3, 2, 3, 2, 3, 2, 2],
      theme: {
        skyTop: "#9ff1ff",
        skyMid: "#46c6f8",
        skyBottom: "#1767a2",
        haze: "#fff0bf",
        bannerAccent: "#61e4ff",
        bannerGlow: "#1dc4ff",
        hillTint: "rgba(162, 220, 118, 0.28)",
        bushTint: "rgba(76, 190, 123, 0.18)"
      }
    },
    {
      world: "1-3",
      time: 340,
      pitRanges: [[26, 28], [45, 47], [81, 83], [136, 138], [168, 170], [193, 195], [207, 208]],
      enemyTiles: [[42, 10], [68, 10], [92, 10], [118, 10], [146, 10], [176, 10], [204, 10]],
      enemySpeed: 58,
      pipeHeights: [2, 3, 3, 2, 3, 3, 3, 2, 3],
      theme: {
        skyTop: "#ffcc97",
        skyMid: "#ff8f63",
        skyBottom: "#7a3a8d",
        haze: "#ffe0a3",
        bannerAccent: "#ffbf5a",
        bannerGlow: "#ff6e5d",
        hillTint: "rgba(255, 188, 109, 0.18)",
        bushTint: "rgba(158, 205, 114, 0.16)"
      }
    },
    {
      world: "1-4",
      time: 280,
      pitRanges: [[24, 27], [42, 45], [78, 81], [132, 135], [162, 165], [188, 191], [206, 209]],
      enemyTiles: [[36, 10], [58, 10], [84, 10], [112, 10], [140, 10], [166, 10], [194, 10], [214, 10]],
      enemySpeed: 66,
      pipeHeights: [3, 3, 3, 2, 3, 3, 3, 3, 3],
      theme: {
        skyTop: "#1d3163",
        skyMid: "#274b91",
        skyBottom: "#0f1a34",
        haze: "#7ed5ff",
        bannerAccent: "#8ce7ff",
        bannerGlow: "#3ac6ff",
        hillTint: "rgba(70, 112, 184, 0.16)",
        bushTint: "rgba(49, 113, 121, 0.14)"
      }
    }
  ];

  const canvas = document.getElementById("gameCanvas");
  function showBootError(title, message) {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0d1b33;color:#f8fbff;font-family:Heebo,Rubik,sans-serif;text-align:center">
        <div style="max-width:560px;padding:28px;border-radius:24px;background:rgba(7,17,34,0.92);border:1px solid rgba(255,255,255,0.12)">
          <h1 style="margin:0 0 12px;font-size:32px">${title}</h1>
          <p style="margin:0;color:rgba(229,243,255,0.86);line-height:1.6">${message}</p>
        </div>
      </div>`;
  }

  if (!canvas) {
    showBootError("Canvas Error", "The game canvas element is missing from index.html.");
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d");
  if (!ctx) {
    showBootError("Canvas Error", "This browser cannot create a 2D canvas context.");
    return;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

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
    help: document.getElementById("helpScreen"),
    gameOver: document.getElementById("gameOverScreen"),
    win: document.getElementById("winScreen"),
    startBtn: document.getElementById("startBtn"),
    helpBtn: document.getElementById("hudHelpBtn"),
    closeHelpBtn: document.getElementById("closeHelpBtn"),
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
    if (state.mode !== "playing" || state.helpOpen) {
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
    player_win: "assets/player/win.svg",
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
    bush_alt: "assets/scenery/bush_2.svg",
    cloud: "assets/scenery/cloud_1.svg",
    cloud_alt: "assets/scenery/cloud_2.svg",
    hill_alt: "assets/scenery/hill_1.svg",
    pipe_top: "assets/scenery/pipe_top.svg",
    pipe_body: "assets/scenery/pipe_body.svg",
    heart: "assets/ui/heart.svg"
  };

  const manifestPath = {
    player_sheet: "assets/atlas/player_sheet_manifest.json"
  };
  const DEFAULT_PLAYER_SHEET_METADATA = {
    frames: {
      player_idle: { x: 36, y: 338, w: 103, h: 257, fallback: "player_idle" },
      player_run_1: { x: 36, y: 65, w: 129, h: 208, fallback: "player_run_1" },
      player_run_2: { x: 188, y: 65, w: 122, h: 208, fallback: "player_run_2" },
      player_run_3: { x: 334, y: 65, w: 124, h: 207, fallback: "player_run_3" },
      player_skid: { x: 478, y: 65, w: 125, h: 208, fallback: "player_skid" },
      player_jump: { x: 176, y: 310, w: 138, h: 245, fallback: "player_jump" },
      player_duck: { x: 318, y: 406, w: 127, h: 189, fallback: "player_duck" }
    },
    aliases: {
      player_jump_rise: "player_jump",
      player_jump_apex: "player_jump",
      player_jump_fall: "player_jump",
      player_land: "player_jump",
      player_run_start: "player_run_1",
      player_run_stop: "player_skid"
    },
    capabilities: {
      player_win: false
    }
  };

  const assets = {};
  const manifests = {};
  const runtimeCapabilities = {
    playerWin: false
  };
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
    stageConfig: STAGE_CONFIGS[0],
    stageBannerTitle: "",
    stageBannerSubtitle: "",
    stageBannerTimer: 0,
    stageBannerDuration: 0,
    renderCameraX: 0,
    helpOpen: false
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pad(value, width) {
    return String(value).padStart(width, "0");
  }

  function alphaColor(hex, alpha) {
    const color = parseHexColor(hex);
    if (!color) {
      return hex;
    }
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(alpha, 0, 1)})`;
  }

  function currentTheme() {
    return (state.stageConfig && state.stageConfig.theme) || STAGE_CONFIGS[0].theme;
  }

  function screenX(worldX) {
    return worldX - state.renderCameraX;
  }

  function screenY(worldY, offsetY) {
    return worldY + offsetY;
  }

  function pushFloatingText(text, x, y, color, life = 0.75, options = {}) {
    state.floating.push({
      text,
      x,
      y,
      color,
      t: life,
      life,
      rise: options.rise || 34,
      size: options.size || 16
    });
  }

  function emitParticle(config) {
    state.particles.push({
      kind: config.kind || "spark",
      x: config.x,
      y: config.y,
      vx: config.vx || 0,
      vy: config.vy || 0,
      gravity: config.gravity ?? GRAVITY * 0.18,
      life: config.life ?? 0.45,
      maxLife: config.life ?? 0.45,
      color: config.color || "#ffffff",
      size: config.size ?? 6,
      shrink: config.shrink ?? 10,
      rotation: config.rotation ?? 0,
      vr: config.vr ?? 0,
      outline: config.outline || null
    });
  }

  function emitBurst(x, y, options = {}) {
    const count = options.count ?? 6;
    const colors = options.colors || ["#fff7c2"];
    for (let i = 0; i < count; i += 1) {
      const spread = (i / Math.max(1, count - 1)) - 0.5;
      emitParticle({
        kind: options.kind || "spark",
        x,
        y,
        vx: spread * (options.spreadX ?? 180) + (Math.random() * 40 - 20),
        vy: -(options.lift ?? 90) - Math.random() * (options.liftVariance ?? 90) + (options.vyOffset || 0),
        gravity: options.gravity ?? GRAVITY * 0.16,
        life: lerp(options.lifeMin ?? 0.22, options.lifeMax ?? 0.5, Math.random()),
        color: colors[i % colors.length],
        size: lerp(options.sizeMin ?? 4, options.sizeMax ?? 9, Math.random()),
        shrink: options.shrink ?? 11,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 5
      });
    }
  }

  function emitJumpBurst(player) {
    const centerX = player.x + player.w * 0.5;
    const feetY = player.y + player.h - 4;
    emitParticle({
      kind: "ring",
      x: centerX,
      y: feetY,
      life: 0.28,
      size: 10,
      shrink: -48,
      gravity: 0,
      color: "#fff2bf",
      outline: "#61e4ff"
    });
    emitBurst(centerX, feetY, {
      kind: "dust",
      count: 5,
      colors: ["#fef7d0", "#b6efff"],
      spreadX: 120,
      lift: 30,
      liftVariance: 28,
      gravity: GRAVITY * 0.1,
      sizeMin: 10,
      sizeMax: 16,
      lifeMin: 0.24,
      lifeMax: 0.38,
      shrink: 18
    });
  }

  function emitLandingBurst(player, impact = 0.5) {
    const centerX = player.x + player.w * 0.5;
    const feetY = player.y + player.h - 2;
    emitParticle({
      kind: "ring",
      x: centerX,
      y: feetY,
      life: 0.34,
      size: 14 + impact * 6,
      shrink: -62,
      gravity: 0,
      color: "#fff1c7",
      outline: "#ffd25b"
    });
    emitBurst(centerX, feetY, {
      kind: "dust",
      count: 8,
      colors: ["#fff7d8", "#c0ecff", "#ffd9ab"],
      spreadX: 210 + impact * 80,
      lift: 54 + impact * 40,
      liftVariance: 36,
      gravity: GRAVITY * 0.14,
      sizeMin: 9,
      sizeMax: 18,
      lifeMin: 0.22,
      lifeMax: 0.48,
      shrink: 14
    });
  }

  function emitSkidBurst(player) {
    const centerX = player.x + player.w * 0.5;
    const feetY = player.y + player.h - 4;
    emitBurst(centerX, feetY, {
      kind: "streak",
      count: 5,
      colors: ["#ffd67a", "#d7fbff"],
      spreadX: 110,
      lift: 26,
      liftVariance: 22,
      gravity: GRAVITY * 0.08,
      sizeMin: 10,
      sizeMax: 16,
      lifeMin: 0.16,
      lifeMax: 0.28,
      shrink: 10
    });
  }

  function emitPickupBurst(x, y, colors) {
    emitParticle({
      kind: "ring",
      x,
      y,
      life: 0.3,
      size: 10,
      shrink: -54,
      gravity: 0,
      color: colors[0],
      outline: colors[1] || colors[0]
    });
    emitBurst(x, y, {
      kind: "spark",
      count: 7,
      colors,
      spreadX: 160,
      lift: 80,
      liftVariance: 50,
      gravity: GRAVITY * 0.04,
      sizeMin: 5,
      sizeMax: 9,
      lifeMin: 0.2,
      lifeMax: 0.42,
      shrink: 12
    });
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
      context.resume().catch(() => { });
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
    if (!c2) {
      return null;
    }
    c2.imageSmoothingEnabled = true;
    c2.drawImage(image, 0, 0);

    if (!chroma) {
      return cvs;
    }

    let imgData;
    try {
      imgData = c2.getImageData(0, 0, srcW, srcH);
    } catch {
      return cvs;
    }
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
    if (!outCtx) {
      return null;
    }
    outCtx.imageSmoothingEnabled = true;
    outCtx.drawImage(image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return prepareSprite(out, { chroma, tolerance });
  }

  function getDrawableSize(image) {
    if (!image) {
      return { width: 0, height: 0 };
    }
    return {
      width: image.naturalWidth || image.videoWidth || image.width || 0,
      height: image.naturalHeight || image.videoHeight || image.height || 0
    };
  }

  function isDrawableAsset(image) {
    const { width, height } = getDrawableSize(image);
    return width > 0 && height > 0;
  }

  function hasVisiblePixels(image, minPixels = 18) {
    if (!isDrawableAsset(image)) {
      return false;
    }

    const { width, height } = getDrawableSize(image);
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) {
      return false;
    }

    sampleCtx.drawImage(image, 0, 0, width, height);
    try {
      const pixels = sampleCtx.getImageData(0, 0, width, height).data;
      let visibleCount = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] <= 24) {
          continue;
        }
        visibleCount += 1;
        if (visibleCount >= minPixels) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }

  function normalizeCropRect(rect) {
    if (!rect) {
      return null;
    }
    const x = Math.round(Number(rect.x));
    const y = Math.round(Number(rect.y));
    const w = Math.round(Number(rect.w));
    const h = Math.round(Number(rect.h));
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
      return null;
    }
    return { x, y, w, h };
  }

  function validateCropRect(image, rect) {
    const safeRect = normalizeCropRect(rect);
    if (!safeRect || !isDrawableAsset(image)) {
      return null;
    }

    const { width, height } = getDrawableSize(image);
    if (safeRect.x < 0 || safeRect.y < 0 || safeRect.x + safeRect.w > width || safeRect.y + safeRect.h > height) {
      return null;
    }
    return safeRect;
  }

  function cropSpriteIfValid(image, rect, options = {}) {
    const safeRect = validateCropRect(image, rect);
    if (!safeRect) {
      return null;
    }

    const sprite = cropSprite(image, safeRect, options);
    return hasVisiblePixels(sprite, options.minVisiblePixels || 24) ? sprite : null;
  }

  function getPlayerSheetMetadata() {
    return manifests.player_sheet || DEFAULT_PLAYER_SHEET_METADATA;
  }

  function resolvePlayerSprite(...keys) {
    const manifest = getPlayerSheetMetadata();
    for (const requestedKey of keys) {
      let currentKey = requestedKey;
      const visited = new Set();

      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        if (isDrawableAsset(assets[currentKey])) {
          return {
            key: currentKey,
            image: assets[currentKey],
            frame: (manifest.frames && manifest.frames[currentKey]) || null
          };
        }

        const frameFallback = manifest.frames && manifest.frames[currentKey] && manifest.frames[currentKey].fallback;
        if (frameFallback && !visited.has(frameFallback)) {
          currentKey = frameFallback;
          continue;
        }

        const aliasKey = manifest.aliases && manifest.aliases[currentKey];
        if (aliasKey && !visited.has(aliasKey)) {
          currentKey = aliasKey;
          continue;
        }

        currentKey = null;
      }
    }

    return null;
  }

  function getPlayerSprite(...keys) {
    const resolved = resolvePlayerSprite(...keys);
    return resolved ? resolved.image : null;
  }

  function hasPlayerCapability(key) {
    const manifest = getPlayerSheetMetadata();
    if (!manifest.capabilities || !Object.prototype.hasOwnProperty.call(manifest.capabilities, key)) {
      return false;
    }
    return Boolean(manifest.capabilities[key]);
  }

  function applyValidatedSheetOverrides(sheet, rects, options = {}) {
    if (!isDrawableAsset(sheet)) {
      return;
    }

    for (const [key, rect] of Object.entries(rects)) {
      const candidate = cropSpriteIfValid(sheet, rect, options);
      if (candidate) {
        assets[key] = candidate;
      }
    }
  }

  function validateAtlasRect(image, rect) {
    if (!image || !rect) {
      return false;
    }
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    return rect.x >= 0
      && rect.y >= 0
      && rect.w > 0
      && rect.h > 0
      && rect.x + rect.w <= width
      && rect.y + rect.h <= height;
  }

  function loadJson(path) {
    return fetch(path).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load ${path}`);
      }
      return res.json();
    });
  }

  function applyHighQualitySheetOverrides() {
    if (assets.sky_hq) {
      assets.sky = assets.sky_hq;
    }

    if (assets.player_sheet) {
      const manifest = getPlayerSheetMetadata();
      const playerFrames = manifest.frames || {};
      for (const [key, frame] of Object.entries(playerFrames)) {
        const next = cropSpriteIfValid(assets.player_sheet, frame, {
          chroma: frame.chroma ?? manifest.defaults?.chroma ?? true,
          tolerance: frame.tolerance ?? manifest.defaults?.tolerance ?? 18
        });
        if (next) {
          assets[key] = next;
        } else {
          console.warn(`Player atlas crop for ${key} was invalid or empty; keeping fallback asset.`);
        }
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
        if (!validateAtlasRect(assets.tiles_sheet, rect)) {
          console.warn(`Invalid tile atlas rect for ${key}`);
          continue;
        }
        const next = cropSprite(assets.tiles_sheet, rect, { chroma: false });
        if (hasVisiblePixels(next, 36)) {
          assets[key] = next;
        }
      }
    }

    if (assets.enemies_items_sheet) {
      const entityRects = {
        // Updated sheet-aligned crops for the new enemies/items art.
        goomba: { x: 31, y: 25, w: 231, h: 260 },
        mushroom: { x: 340, y: 28, w: 263, h: 259 },
        coin: { x: 314, y: 299, w: 145, h: 156 },
        star: { x: 403, y: 406, w: 208, h: 200 }
      };

      for (const [key, rect] of Object.entries(entityRects)) {
        if (!validateAtlasRect(assets.enemies_items_sheet, rect)) {
          console.warn(`Invalid entity atlas rect for ${key}`);
          continue;
        }
        const next = cropSprite(assets.enemies_items_sheet, rect, { chroma: true, tolerance: 24 });
        if (hasVisiblePixels(next)) {
          assets[key] = next;
        }
      }
      if (!isDrawableAsset(assets.goomba_squish) && isDrawableAsset(assets.goomba)) {
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
        if (!validateAtlasRect(assets.scenery_sheet, rect)) {
          console.warn(`Invalid scenery atlas rect for ${key}`);
          continue;
        }
        const next = cropSprite(assets.scenery_sheet, rect, { chroma: true, tolerance: 20 });
        if (hasVisiblePixels(next)) {
          assets[key] = next;
        }
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
    const manifestEntries = Object.entries(manifestPath);
    const loadPromises = entries.map(async ([key, path]) => {
      try {
        const image = await loadImage(path);
        assets[key] = prepareSprite(image, {
          chroma: false,
          tolerance: 12,
          forceColor: null
        });
      } catch (err) {
        assets[key] = null;
        console.warn(err.message);
      }
    });

    const manifestPromises = manifestEntries.map(async ([key, path]) => {
      try {
        manifests[key] = await loadJson(path);
      } catch (err) {
        manifests[key] = null;
        console.warn(err.message);
      }
    });

    await Promise.all([...loadPromises, ...manifestPromises]);
    applyHighQualitySheetOverrides();
    runtimeCapabilities.playerWin = hasPlayerCapability("player_win") && hasVisiblePixels(getPlayerSprite("player_win"), 48);
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
      level.sceneryClouds.push({
        x: x * TILE + (x % 2) * 80,
        y: 60 + (x % 3) * 34,
        w: TILE * (2.35 + (x % 3) * 0.22),
        h: TILE * (1.16 + (x % 2) * 0.14),
        variant: x % 3 === 0 ? 1 : 0
      });
    }

    for (let x = 6; x < LEVEL_COLS; x += 18) {
      level.sceneryBushes.push({
        x: x * TILE,
        y: GROUND_ROW * TILE - TILE * 0.9,
        w: TILE * (2.1 + (x % 4) * 0.12),
        h: TILE * (1.08 + (x % 3) * 0.08),
        variant: x % 4 === 0 ? 1 : 0
      });
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
    emitPickupBurst(x, y, ["#fff0a6", "#61e4ff", "#ffd25b"]);
    if (state.coins % 50 === 0) {
      state.lives += 1;
      pushFloatingText("חיים +1", x, y - 18, "#d4ff8f", 0.9, { size: 18 });
    }
    pushFloatingText("+100", x, y, "#ffe26f", 0.7);
  }

  function spawnMushroom(x, y) {
    state.items.push({
      kind: "mushroom",
      x,
      y,
      w: MUSHROOM_SIZE,
      h: MUSHROOM_SIZE,
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
      w: GOOMBA_SIZE,
      h: GOOMBA_SIZE,
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
      spawnEnemy(tx * TILE + (TILE - GOOMBA_SIZE) * 0.5, ty * TILE, speed);
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
      runFxTimer: 0,
      skidFxTimer: 0,
      crouching: false,
      actionFlash: 0,
      dead: false
    };
  }

  function setHelpOpen(open) {
    const next = Boolean(open);
    state.helpOpen = next;
    ui.help.classList.toggle("hidden", !next);
    if (next) {
      resetInputState();
    }
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
          spawnMushroom(solid.x + (TILE - MUSHROOM_SIZE) * 0.5, solid.y - MUSHROOM_SIZE - 4);
          state.score += 1000;
          emitPickupBurst(worldX, worldY - 6, ["#ffe26f", "#fff5c1", "#61e4ff"]);
          pushFloatingText("+1000", worldX, worldY - 6, "#ffe26f", 0.9, { size: 18 });
        } else {
          collectCoin(worldX, worldY - 6);
        }
      }
    } else if (tile.type === "brick") {
      if (state.player.big) {
        state.level.tiles[solid.ty][solid.tx] = null;
        state.score += 50;
        pushFloatingText("+50", worldX, worldY - 6, "#ffc8a2", 0.7);
        for (let i = 0; i < 6; i += 1) {
          emitParticle({
            kind: "chunk",
            x: worldX,
            y: worldY + 10,
            vx: (Math.random() * 180) - 90,
            vy: -220 - Math.random() * 120,
            life: 0.5,
            color: "#c14f35",
            size: 7,
            gravity: GRAVITY * 0.42,
            shrink: 8,
            rotation: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 8
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
      emitPickupBurst(p.x + p.w * 0.5, p.y + 8, ["#d4ff8f", "#fff5c1", "#61e4ff"]);
      pushFloatingText("+500", p.x + 20, p.y - 10, "#c5ff85", 0.8);
      return;
    }
    p.big = true;
    p.y -= PLAYER_BIG.h - PLAYER_SMALL.h;
    p.h = PLAYER_BIG.h;
    p.invulnerable = 1.6;
    state.score += 1000;
    p.actionFlash = 0.4;
    emitPickupBurst(p.x + p.w * 0.5, p.y + 16, ["#d4ff8f", "#fff5c1", "#61e4ff"]);
    pushFloatingText("כוח על!", p.x + 20, p.y - 10, "#c5ff85", 1.0, { size: 18 });
  }

  function showStageBanner(title, subtitle = "", duration = 2.3) {
    state.stageBannerTitle = title;
    state.stageBannerSubtitle = subtitle;
    state.stageBannerDuration = duration;
    state.stageBannerTimer = duration;
  }

  function loadStage(stageIndex, bannerTitle = "") {
    const safeIndex = clamp(stageIndex, 0, STAGE_CONFIGS.length - 1);
    const stage = STAGE_CONFIGS[safeIndex];

    state.stageIndex = safeIndex;
    state.stageConfig = stage;
    state.world = stage.world;
    state.timeLeft = stage.time;
    state.secondTick = 0;
    state.cameraX = 0;
    state.renderCameraX = 0;
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

    const stageTitle = bannerTitle || `שלב ${stage.world}`;
    showStageBanner(stageTitle, `זמן לשלב: ${stage.time}`, 2.4);
  }

  function advanceToNextStage() {
    if (state.stageIndex >= STAGE_CONFIGS.length - 1) {
      state.mode = "win";
      ui.win.classList.remove("hidden");
      return;
    }

    const timeBonus = Math.max(0, state.timeLeft) * 5;
    state.score += 2500 + timeBonus;
    const nextStage = STAGE_CONFIGS[state.stageIndex + 1];
    loadStage(state.stageIndex + 1, `מעבר לשלב ${nextStage.world}!`);
    state.mode = "playing";
    state.player.invulnerable = 1.2;
    state.player.actionFlash = 0.45;
    pushFloatingText("שלב הושלם!", state.player.x + 70, state.player.y - 18, "#fff5a8", 1.2, { size: 20, rise: 28 });
  }

  function startGame() {
    state.mode = "playing";
    resetInputState();
    setHelpOpen(false);
    state.score = 0;
    state.coins = 0;
    state.lives = START_LIVES;
    loadStage(0, `מתחילים: ${STAGE_CONFIGS[0].world}`);
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
    state.renderCameraX = state.cameraX;
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
      if (event.code === "Escape" && state.helpOpen) {
        setHelpOpen(false);
        event.preventDefault();
        return;
      }
      if (event.code === "KeyH" && state.mode === "playing") {
        setHelpOpen(!state.helpOpen);
        event.preventDefault();
        return;
      }
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
        } else if (action === "down") {
          input.down = on;
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
        if (btn.setPointerCapture) {
          btn.setPointerCapture(e.pointerId);
        }
        press(true);
      });
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        if (btn.releasePointerCapture && btn.hasPointerCapture && btn.hasPointerCapture(e.pointerId)) {
          btn.releasePointerCapture(e.pointerId);
        }
        press(false);
      });
      btn.addEventListener("pointercancel", (e) => {
        if (btn.releasePointerCapture && btn.hasPointerCapture && btn.hasPointerCapture(e.pointerId)) {
          btn.releasePointerCapture(e.pointerId);
        }
        press(false);
      });
      btn.addEventListener("pointerleave", (e) => {
        if (!btn.hasPointerCapture || !btn.hasPointerCapture(e.pointerId)) {
          press(false);
        }
      });
    });
  }

  function updatePlayer(dt) {
    const p = state.player;
    const wasOnGround = p.onGround;
    const prevVx = p.vx;

    p.runFxTimer = Math.max(0, p.runFxTimer - dt);
    p.skidFxTimer = Math.max(0, p.skidFxTimer - dt);
    p.actionFlash = Math.max(0, p.actionFlash - dt);

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
      const wantsCrouch = p.onGround && input.down;
      const dir = wantsCrouch ? 0 : ((input.left ? -1 : 0) + (input.right ? 1 : 0));
      const topSpeed = input.run ? RUN_SPEED : WALK_SPEED;
      const target = dir * (wantsCrouch ? 0 : topSpeed);
      const accel = p.onGround ? ACCEL_GROUND : ACCEL_AIR;
      p.crouching = wantsCrouch;

      if (dir !== 0) {
        p.facing = dir;
        const turning = p.onGround && Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== dir;
        const steerAccel = turning ? accel * 1.45 : accel;
        if (turning && Math.abs(prevVx) > RUN_SPEED * 0.38 && p.skidFxTimer <= 0) {
          emitSkidBurst(p);
          p.skidFxTimer = 0.14;
          p.actionFlash = Math.max(p.actionFlash, 0.14);
        }
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
      if (p.jumpBuffer > 0 && (canGroundJump || canDoubleJump) && !wantsCrouch) {
        p.vy = canDoubleJump ? -JUMP_VELOCITY * 0.96 : -JUMP_VELOCITY;
        p.onGround = false;
        p.jumpBuffer = 0;
        p.coyote = 0;
        p.jumpCount = Math.min(2, p.jumpCount + 1);
        p.actionFlash = Math.max(p.actionFlash, 0.18);
        emitJumpBurst(p);
      }

      if (input.jumpReleased && p.vy < -280) {
        p.vy *= 0.62;
      }
    } else {
      p.crouching = false;
    }

    p.vy = clamp(p.vy + GRAVITY * dt, -1200, MAX_FALL);
    const preMoveVy = p.vy;

    moveWithCollisions(p, dt, settleTileHitFromBelow);

    const landed = !wasOnGround && p.onGround;
    if (landed) {
      emitLandingBurst(p, clamp(Math.abs(preMoveVy) / MAX_FALL, 0.25, 1));
      p.actionFlash = Math.max(p.actionFlash, 0.16);
    }

    const groundedSpeed = Math.abs(p.vx);
    if (!p.controlLocked && p.onGround && groundedSpeed > RUN_SPEED * 0.58 && p.runFxTimer <= 0) {
      emitBurst(p.x + p.w * 0.5, p.y + p.h - 3, {
        kind: "dust",
        count: 4,
        colors: ["#fff6d6", "#c4efff"],
        spreadX: 90,
        lift: 18,
        liftVariance: 18,
        gravity: GRAVITY * 0.08,
        sizeMin: 8,
        sizeMax: 13,
        lifeMin: 0.18,
        lifeMax: 0.28,
        shrink: 16
      });
      p.runFxTimer = groundedSpeed > RUN_SPEED * 0.85 ? 0.07 : 0.11;
    }

    if (p.y > state.level.height + TILE * 2) {
      hurtPlayer();
    }

    if (!state.flagCaptured) {
      const flagRect = { x: state.flagPoleX, y: (GROUND_ROW - 5) * TILE, w: 16, h: 6 * TILE };
      if (overlap(p, flagRect)) {
        state.flagCaptured = true;
        state.score += 5000;
        p.actionFlash = 0.42;
        emitPickupBurst(p.x + p.w * 0.5, p.y + 8, ["#fff5a8", "#61e4ff", "#ffd25b"]);
        pushFloatingText("דגל +5000", p.x, p.y - 20, "#fff5a8", 1.2, { size: 20, rise: 28 });
      }
    } else if (p.x > state.castleX + TILE * 1.5 && state.mode === "playing") {
      advanceToNextStage();
    }

    if (p.x < state.cameraX) {
      p.x = state.cameraX;
      if (p.vx < 0) p.vx = 0;
    }

    if (p.x + p.w > state.level.width) {
      p.x = state.level.width - p.w;
      p.vx = 0;
    }

    if (!state.flagCaptured && state.nextCheckpointIdx < CHECKPOINTS.length && p.x >= CHECKPOINTS[state.nextCheckpointIdx]) {
      state.checkpointX = CHECKPOINTS[state.nextCheckpointIdx];
      state.nextCheckpointIdx += 1;
      p.actionFlash = Math.max(p.actionFlash, 0.28);
      emitPickupBurst(p.x + p.w * 0.5, p.y + 14, ["#b7ebff", "#61e4ff", "#fff7c2"]);
      pushFloatingText("נקודת שמירה", p.x + 12, p.y - 14, "#b7ebff", 1, { size: 18 });
    }

    p.crouching = !p.controlLocked && p.onGround && input.down;
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
        const stompWindow = Math.max(24, enemy.h * 0.78);
        const stomp = p.vy > 120 && playerBottom - enemy.y < stompWindow;
        if (stomp) {
          enemy.dead = true;
          enemy.deadTimer = 0.45;
          p.vy = -BOUNCE_VELOCITY;
          state.score += 100;
          p.actionFlash = Math.max(p.actionFlash, 0.14);
          emitBurst(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5, {
            kind: "spark",
            count: 6,
            colors: ["#ffe26f", "#fff6cb", "#ffbd7b"],
            spreadX: 150,
            lift: 80,
            liftVariance: 50,
            gravity: GRAVITY * 0.1,
            sizeMin: 5,
            sizeMax: 9,
            lifeMin: 0.18,
            lifeMax: 0.34,
            shrink: 14
          });
          pushFloatingText("+100", enemy.x, enemy.y, "#ffe26f", 0.7);
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
      if (!msg.life) {
        msg.life = msg.t;
      }
      msg.t -= dt;
      msg.y -= (msg.rise || 34) * dt;
    }
    state.floating = state.floating.filter((msg) => msg.t > 0);
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.vy += (p.gravity ?? GRAVITY * 0.55) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += (p.vr || 0) * dt;
      p.size = Math.max(0.5, p.size - (p.shrink || 0) * dt);
    }
    state.particles = state.particles.filter((p) => p.life > 0);
  }

  function updateCamera(dt) {
    const viewW = canvas.clientWidth;
    const p = state.player;
    const lookAhead = clamp(p.vx * CAMERA_LOOKAHEAD, -84, 132);
    const forwardTarget = p.x + lookAhead - viewW * 0.36;
    const keepPlayerVisibleTarget = p.x - viewW * 0.24;
    const maxCam = Math.max(0, state.level.width - viewW);
    const target = keepPlayerVisibleTarget < state.cameraX
      ? keepPlayerVisibleTarget
      : Math.max(state.cameraX, forwardTarget);
    const follow = p.onGround ? CAMERA_FOLLOW : CAMERA_FOLLOW * 0.88;
    state.cameraX = clamp(lerp(state.cameraX, target, Math.min(1, dt * follow)), 0, maxCam);
    state.renderCameraX = state.cameraX;
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

  function updateStageBanner(dt) {
    if (state.stageBannerTimer > 0) {
      state.stageBannerTimer = Math.max(0, state.stageBannerTimer - dt);
    }
  }

  function update(dt) {
    if (!state.level || !state.player) {
      return;
    }

    updateStageBanner(dt);

    if (state.mode === "title" || state.mode === "gameover" || state.mode === "win") {
      input.jumpPressed = false;
      input.jumpReleased = false;
      return;
    }

    if (state.helpOpen) {
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
    const drawX = x;
    const drawY = y;
    const drawW = Math.max(0, w);
    const drawH = Math.max(0, h);
    if (image) {
      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(drawX, drawY, drawW, drawH);
    }
  }

  function getWorldRenderOffsetY(viewH) {
    if (!state.level) {
      return 0;
    }
    return Math.min(0, viewH - state.level.height - VERTICAL_VIEW_PADDING);
  }

  function getSupportDistance(entity, maxDistance = TILE * 2.5) {
    const probe = {
      x: entity.x + 4,
      y: entity.y + entity.h,
      w: Math.max(8, entity.w - 8),
      h: maxDistance
    };
    const solids = getVisibleSolidRects(state.level, probe.x, probe.y, probe.w, probe.h);
    let best = maxDistance;
    for (const solid of solids) {
      if (solid.y < entity.y + entity.h - 1) {
        continue;
      }
      if (solid.x >= entity.x + entity.w - 2 || solid.x + solid.w <= entity.x + 2) {
        continue;
      }
      best = Math.min(best, solid.y - (entity.y + entity.h));
    }
    return clamp(best, 0, maxDistance);
  }

  function drawPlayerShadow(offsetY) {
    const p = state.player;
    const groundDistance = getSupportDistance(p);
    const shadowWidth = lerp(p.w * 0.92, p.w * 0.46, clamp(groundDistance / (TILE * 2), 0, 1));
    const shadowHeight = lerp(12, 5, clamp(groundDistance / (TILE * 2), 0, 1));
    const alpha = lerp(0.28, 0.1, clamp(groundDistance / (TILE * 2), 0, 1));
    const shadowX = screenX(p.x + p.w * 0.5);
    const shadowY = screenY(p.y + p.h + groundDistance - 3, offsetY);

    ctx.save();
    ctx.fillStyle = `rgba(8, 16, 30, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, shadowWidth * 0.5, shadowHeight * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBackground(viewW, viewH, offsetY) {
    const theme = currentTheme();
    const sky = assets.sky_hq || assets.sky;
    const gradient = ctx.createLinearGradient(0, 0, 0, viewH);
    gradient.addColorStop(0, theme.skyTop);
    gradient.addColorStop(0.56, theme.skyMid);
    gradient.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewW, viewH);

    const sunGlow = ctx.createRadialGradient(viewW * 0.18, viewH * 0.16, 10, viewW * 0.18, viewH * 0.16, viewW * 0.36);
    sunGlow.addColorStop(0, alphaColor(theme.haze, 0.68));
    sunGlow.addColorStop(0.42, alphaColor(theme.haze, 0.18));
    sunGlow.addColorStop(1, alphaColor(theme.haze, 0));
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, viewW, viewH);

    if (sky) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      if (sky.width >= 256 && sky.height >= 256) {
        const drift = (state.renderCameraX * 0.12) % viewW;
        ctx.drawImage(sky, -drift, 0, viewW, viewH);
        ctx.drawImage(sky, viewW - drift, 0, viewW, viewH);
      } else {
        const sw = 64;
        const sh = 64;
        for (let x = -((state.renderCameraX * 0.15) % sw) - sw; x < viewW + sw; x += sw) {
          for (let y = 0; y < viewH + sh; y += sh) {
            ctx.drawImage(sky, x, y, sw, sh);
          }
        }
      }
      ctx.restore();
    }

    const cloudImg = assets.cloud;
    const cloudAlt = assets.cloud_alt || cloudImg;
    const bushImg = assets.bush;
    const bushAlt = assets.bush_alt || bushImg;
    const hillImg = assets.hill || assets.hill_alt || null;
    const hillAlt = assets.hill_alt || hillImg;

    const horizon = GROUND_ROW * TILE + offsetY - 120;
    ctx.fillStyle = theme.hillTint;
    ctx.fillRect(0, horizon, viewW, 160);

    for (const cloud of state.level.sceneryClouds) {
      const x = cloud.x - state.renderCameraX * 0.45;
      const image = cloud.variant ? cloudAlt : cloudImg;
      ctx.save();
      ctx.globalAlpha = cloud.variant ? 0.74 : 0.88;
      drawImageOrFallback(image, x, screenY(cloud.y, offsetY), cloud.w, cloud.h, "rgba(255,255,255,0.8)");
      ctx.restore();
    }

    if (hillImg) {
      for (let x = -220; x < viewW + 220; x += 290) {
        const hillX = x - (state.renderCameraX * 0.22 % 290);
        const image = (Math.floor((x + state.stageIndex * 47) / 290) % 2 === 0 ? hillImg : hillAlt) || hillImg;
        ctx.save();
        ctx.globalAlpha = 0.94;
        drawImageOrFallback(image, hillX, screenY(GROUND_ROW * TILE - 112, offsetY), 290, 96, "#66a64b");
        ctx.restore();
      }
    }

    for (const bush of state.level.sceneryBushes) {
      const x = bush.x - state.renderCameraX * 0.78;
      const image = bush.variant ? bushAlt : bushImg;
      ctx.save();
      ctx.globalAlpha = 0.92;
      drawImageOrFallback(image, x, screenY(bush.y, offsetY), bush.w, bush.h, "#2f9e4f");
      ctx.restore();
    }

    const vignette = ctx.createLinearGradient(0, viewH * 0.3, 0, viewH);
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(1, alphaColor(theme.bushTint, 0.72));
    ctx.fillStyle = vignette;
    ctx.fillRect(0, viewH * 0.3, viewW, viewH * 0.7);
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
        drawImageOrFallback(image, screenX(x * TILE), screenY(drawY, offsetY), TILE, TILE, "#7d5a34");
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
        const drawX = screenX(pipe.x);
        const drawY = screenY(py, offsetY);
        drawImageOrFallback(img, drawX, drawY, pipe.w, TILE, "#169b3d");
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.fillRect(drawX + pipe.w - 8, drawY + 2, 5, TILE - 4);
        ctx.fillStyle = "rgba(10, 30, 20, 0.08)";
        ctx.fillRect(drawX + 4, drawY + TILE - 6, pipe.w - 8, 4);
        ctx.restore();
      }
    }
  }

  function drawFlagAndCastle(offsetY) {
    const theme = currentTheme();
    const poleX = screenX(state.flagPoleX);
    const poleY = screenY((GROUND_ROW - 5) * TILE, offsetY);
    const castleBaseX = screenX(state.castleX);
    const castleBaseY = screenY((GROUND_ROW - 2) * TILE, offsetY);
    const flutter = Math.sin(performance.now() * 0.006) * 8;

    ctx.save();
    ctx.fillStyle = "rgba(8, 16, 30, 0.12)";
    ctx.fillRect(poleX + 6, poleY + 14, 6, 6 * TILE);
    ctx.fillStyle = "#f7f8fc";
    ctx.fillRect(poleX, poleY, 10, 6 * TILE);
    ctx.fillStyle = theme.bannerAccent;
    ctx.beginPath();
    ctx.moveTo(poleX + 10, poleY + 18);
    ctx.lineTo(poleX + 62 + flutter * 0.24, poleY + 12);
    ctx.lineTo(poleX + 48 + flutter * 0.18, poleY + 46);
    ctx.lineTo(poleX + 10, poleY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#766b86";
    ctx.fillRect(castleBaseX, castleBaseY, TILE * 3.5, TILE * 2);
    ctx.fillStyle = "#a9a4bd";
    ctx.fillRect(castleBaseX + 8, castleBaseY + 8, TILE * 3.5 - 16, TILE * 2 - 14);
    ctx.fillStyle = "#5b516e";
    ctx.fillRect(castleBaseX + TILE * 1.2, castleBaseY + TILE * 1.15, TILE * 0.8, TILE * 0.85);
    ctx.fillStyle = "#766b86";
    ctx.fillRect(castleBaseX + TILE * 1.05, castleBaseY - TILE * 1.15, TILE * 1.15, TILE * 1.15);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillRect(castleBaseX + i * TILE * 0.82, castleBaseY - 14, TILE * 0.45, 14);
    }
    ctx.fillStyle = alphaColor(theme.bannerGlow, 0.26);
    ctx.fillRect(castleBaseX + TILE * 1.26, castleBaseY + TILE * 1.3, TILE * 0.32, TILE * 0.2);
    ctx.restore();
  }

  function drawItems(offsetY) {
    for (const item of state.items) {
      const x = screenX(item.x);
      if (item.kind === "coin") {
        drawImageOrFallback(assets.coin, x, screenY(item.y, offsetY), item.w, item.h, "#f6da55");
      } else if (item.kind === "mushroom") {
        drawImageOrFallback(assets.mushroom, x, screenY(item.y, offsetY), item.w, item.h, "#ff4747");
      }
    }
  }

  function drawEnemies(offsetY) {
    for (const enemy of state.enemies) {
      const x = screenX(enemy.x);
      if (enemy.dead) {
        drawImageOrFallback(assets.goomba_squish || assets.goomba, x, screenY(enemy.y + enemy.h * 0.45, offsetY), enemy.w, enemy.h * 0.55, "#7f4f2f");
      } else {
        drawImageOrFallback(assets.goomba, x, screenY(enemy.y, offsetY), enemy.w, enemy.h, "#7f4f2f");
      }
    }
  }

  function getAirbornePlayerState(player) {
    if (player.vy < -140) {
      return "player_jump_rise";
    }
    if (player.vy < 120) {
      return "player_jump_apex";
    }
    return "player_jump_fall";
  }

  function getPlayerDrawRect(sprite, player, drawX, drawY) {
    if (!sprite || !isDrawableAsset(sprite.image)) {
      return { x: drawX, y: drawY, w: player.w, h: player.h };
    }

    const frame = sprite.frame;
    if (!frame) {
      return { x: drawX, y: drawY, w: player.w, h: player.h };
    }

    const { width, height } = getDrawableSize(sprite.image);
    const pivotX = Number(frame.pivotX);
    const feetLockY = Number(frame.feetLockY ?? frame.pivotY);
    if (!Number.isFinite(pivotX) || !Number.isFinite(feetLockY) || feetLockY <= 0) {
      return { x: drawX, y: drawY, w: player.w, h: player.h };
    }

    const scale = player.h / feetLockY;
    const footY = drawY + player.h;
    const centerX = drawX + player.w * 0.5;
    return {
      x: centerX - pivotX * scale,
      y: footY - feetLockY * scale,
      w: width * scale,
      h: height * scale
    };
  }

  function drawResolvedPlayerSprite(sprite, player, drawX, drawY) {
    const image = sprite && sprite.image;
    const rect = getPlayerDrawRect(sprite, player, drawX, drawY);

    if (player.facing < 0) {
      const axisX = drawX + player.w * 0.5;
      ctx.translate(axisX * 2, 0);
      ctx.scale(-1, 1);
      drawImageOrFallback(image, rect.x, rect.y, rect.w, rect.h, "#3153e1");
      return;
    }

    drawImageOrFallback(image, rect.x, rect.y, rect.w, rect.h, "#3153e1");
  }

  function drawPlayer(offsetY) {
    const p = state.player;
    const drawX = screenX(p.x);
    const drawY = screenY(p.y, offsetY);

    let sprite = resolvePlayerSprite("player_idle");
    const speed = Math.abs(p.vx);
    const skidding = !p.controlLocked && p.onGround && ((input.left && p.vx > 40) || (input.right && p.vx < -40));

    if (p.dead) {
      sprite = resolvePlayerSprite("player_die", "player_jump", "player_idle");
    } else if (state.flagCaptured && p.onGround && runtimeCapabilities.playerWin) {
      sprite = resolvePlayerSprite("player_win", "player_idle");
    } else if (!p.onGround) {
      sprite = resolvePlayerSprite(getAirbornePlayerState(p), "player_jump", "player_idle");
    } else if (p.crouching) {
      sprite = resolvePlayerSprite("player_duck", "player_idle");
    } else if (skidding) {
      sprite = resolvePlayerSprite("player_run_stop", "player_skid", "player_idle");
    } else if (speed > 45) {
      const cadence = 7 + (speed / RUN_SPEED) * 11;
      const frame = Math.floor(p.animT * cadence) % 3;
      sprite = resolvePlayerSprite(
        frame === 0 ? "player_run_1" : (frame === 1 ? "player_run_2" : "player_run_3"),
        "player_idle"
      );
    }

    ctx.save();
    ctx.globalAlpha = p.invulnerable > 0 ? 0.76 + Math.sin(state.flash * 2.6) * 0.16 : 1;
    if (p.actionFlash > 0) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = alphaColor("#fff7c2", 0.72);
    }
    drawResolvedPlayerSprite(sprite, p, drawX, drawY);
    ctx.restore();
  }

  function drawFloatingText(offsetY) {
    ctx.font = '800 16px "Rubik", "Heebo", sans-serif';
    ctx.textAlign = "center";
    for (const msg of state.floating) {
      const alpha = clamp(msg.t / Math.max(0.001, msg.life || 0.7), 0, 1);
      const fontSize = Math.round((msg.size || 16) + (1 - alpha) * 4);
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${fontSize}px "Rubik", "Heebo", sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(10, 18, 34, 0.4)";
      ctx.strokeText(msg.text, screenX(msg.x), screenY(msg.y, offsetY));
      ctx.fillStyle = msg.color;
      ctx.fillText(msg.text, screenX(msg.x), screenY(msg.y, offsetY));
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  function drawParticles(offsetY) {
    for (const p of state.particles) {
      const lifeRatio = clamp(p.life / Math.max(0.001, p.maxLife || p.life), 0, 1);
      const x = screenX(p.x);
      const y = screenY(p.y, offsetY);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.rotation || 0);
      ctx.globalAlpha = lifeRatio;
      if (p.kind === "dust") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "ring") {
        ctx.strokeStyle = p.outline || p.color;
        ctx.lineWidth = Math.max(2, p.size * 0.16);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === "streak") {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.65, -1.5, p.size * 1.3, 3);
      } else if (p.kind === "chunk") {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.44, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.44, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawStageBanner(viewW) {
    if (state.stageBannerTimer <= 0 || !state.stageBannerTitle || state.mode === "title") {
      return;
    }

    const t = state.stageBannerTimer / Math.max(0.001, state.stageBannerDuration);
    let alpha = 1;
    if (t > 0.86) {
      alpha = (1 - t) / 0.14;
    } else if (t < 0.24) {
      alpha = t / 0.24;
    }
    alpha = clamp(alpha, 0, 1);

    const theme = currentTheme();
    const slide = (1 - alpha) * 18;
    const panelW = Math.min(viewW * 0.82, 540);
    const panelH = 96;
    const panelX = (viewW - panelW) * 0.5;
    const panelY = 26 + slide;

    ctx.save();
    ctx.globalAlpha = alpha;
    const panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
    panelGradient.addColorStop(0, "rgba(13, 24, 48, 0.94)");
    panelGradient.addColorStop(1, "rgba(10, 20, 40, 0.84)");
    ctx.fillStyle = panelGradient;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.fillStyle = alphaColor(theme.bannerGlow, 0.12);
    ctx.fillRect(panelX + 14, panelY + 12, panelW - 28, panelH - 24);
    ctx.strokeStyle = theme.bannerAccent;
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff5a8";
    ctx.font = '800 34px "Rubik", "Heebo", sans-serif';
    ctx.fillText(state.stageBannerTitle, panelX + panelW * 0.5, panelY + 42);

    if (state.stageBannerSubtitle) {
      ctx.fillStyle = "#d9ecff";
      ctx.font = '700 19px "Rubik", "Heebo", sans-serif';
      ctx.fillText(state.stageBannerSubtitle, panelX + panelW * 0.5, panelY + 74);
    }

    ctx.restore();
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
    drawPlayerShadow(offsetY);
    drawParticles(offsetY);
    drawPlayer(offsetY);
    drawFloatingText(offsetY);
    drawStageBanner(viewW);
  }

  function updateHud() {
    hud.score.textContent = pad(state.score, 6);
    hud.coins.textContent = `x${pad(state.coins, 2)}`;
    hud.world.textContent = `${state.world} (${state.stageIndex + 1}/${STAGE_CONFIGS.length})`;
    hud.time.textContent = pad(Math.max(0, state.timeLeft), 3);
    hud.lives.textContent = `x${state.lives}`;
  }

  function getViewportBounds() {
    const viewport = window.visualViewport;
    return {
      width: Math.max(320, Math.floor(viewport ? viewport.width : window.innerWidth)),
      height: Math.max(320, Math.floor(viewport ? viewport.height : window.innerHeight))
    };
  }

  function getChromeReserve() {
    const hudHeight = hud.root && !hud.root.classList.contains("hidden")
      ? Math.ceil(hud.root.getBoundingClientRect().height) + 18
      : 0;
    const touchVisible = ui.touch && window.getComputedStyle(ui.touch).display !== "none";
    const touchHeight = touchVisible
      ? Math.ceil(ui.touch.getBoundingClientRect().height) + 18
      : 0;
    return { top: hudHeight, bottom: touchHeight };
  }

  function resizeCanvas() {
    const ratio = Math.min(MAX_RENDER_RATIO, Math.max(1, window.devicePixelRatio || 1));
    const viewport = getViewportBounds();
    const reserve = getChromeReserve();
    const chromeBand = Math.max(reserve.top, reserve.bottom);
    let cssW = viewport.width;
    let cssH = Math.max(260, viewport.height - chromeBand * 2);
    const targetAspect = cssH > cssW ? clamp(cssW / cssH, 9 / 20, 9 / 16) : VIEW_ASPECT;
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
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
    ui.helpBtn.addEventListener("click", () => {
      unlockAudio();
      setHelpOpen(true);
    });
    ui.closeHelpBtn.addEventListener("click", () => {
      setHelpOpen(false);
    });
    ui.retryBtn.addEventListener("click", () => {
      unlockAudio();
      setHelpOpen(false);
      ui.gameOver.classList.add("hidden");
      startGame();
    });
    ui.againBtn.addEventListener("click", () => {
      unlockAudio();
      setHelpOpen(false);
      ui.win.classList.add("hidden");
      startGame();
    });
  }

  async function init() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeCanvas);
      window.visualViewport.addEventListener("scroll", resizeCanvas);
    }

    wireUi();
    setupInput();

    await loadAssets();
    loadStage(0);
    state.mode = "title";

    setHelpOpen(false);
    hud.root.classList.add("hidden");
    requestAnimationFrame(loop);
  }

  init().catch((err) => {
    console.error(err);
    ui.title.innerHTML = "<h1>שגיאת טעינה</h1><p>לא ניתן לטעון את קבצי המשחק.</p>";
  });
})();
