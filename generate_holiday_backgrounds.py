"""
Regenerate all holiday background PNGs — clean, no text labels, with actual visual content.
Each background is 800x600 so it scales well to any viewport.
"""
import os
from PIL import Image, ImageDraw
import math

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def save(img, path):
    ensure_dir(path)
    img.save(path)
    print(f"Generated: {path}")

W, H = 800, 600

# =========================================================
# 1. Pesach — Desert sky with Nile + Pyramids
# =========================================================
def make_pesach_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    # Sky gradient: warm amber at top → sand at bottom
    for y in range(H):
        t = y / H
        r = int(lerp(247, 220, t))
        g = int(lerp(198, 165, t))
        b = int(lerp(120, 80, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Ground strip (sand dunes)
    ground_y = int(H * 0.72)
    for y in range(ground_y, H):
        t = (y - ground_y) / (H - ground_y)
        r = int(lerp(210, 160, t))
        g = int(lerp(180, 130, t))
        b = int(lerp(100, 60, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Pyramids (triangle silhouettes)
    horizon = ground_y
    pyrs = [(80, horizon, 300, 180), (260, horizon, 380, 240), (530, horizon, 240, 152)]
    for (bx, by, base, height) in pyrs:
        tip = (bx + base // 2, by - height)
        light = (int(200*0.85), int(160*0.85), 80)
        dark  = (int(190*0.7),  int(145*0.7), 55)
        draw.polygon([tip, (bx, by), (bx+base, by)], fill=light)
        draw.polygon([tip, (bx+base//2, by), (bx+base, by)], fill=dark)
    # Nile shimmer
    nile_y = ground_y + 12
    draw.rectangle([(0, nile_y), (W, nile_y+14)], fill=(70, 130, 180))
    draw.rectangle([(0, nile_y+4), (W, nile_y+8)], fill=(100, 170, 210))
    return img

# =========================================================
# 2. Rosh Hashanah — Golden dawn city gate
# =========================================================
def make_rosh_hashanah_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(lerp(255, 220, t))
        g = int(lerp(240, 170, t))
        b = int(lerp(180, 80, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # White city walls
    wall_y = int(H * 0.65)
    draw.rectangle([(0, wall_y), (W, H)], fill=(245, 220, 160))
    # Grand arch gate
    gx, gy = 280, wall_y
    gate_w, gate_h = 240, 180
    draw.rectangle([(gx, gy - gate_h), (gx + gate_w, gy)], fill=(250, 240, 200))
    draw.rectangle([(gx + 10, gy - gate_h + 10), (gx + gate_w - 10, gy)], fill=(235, 210, 150))
    # Arch
    arc_x = gx + gate_w // 2
    arc_r = gate_w // 2 - 20
    draw.ellipse([(arc_x - arc_r, gy - gate_h // 2 - arc_r),
                  (arc_x + arc_r, gy - gate_h // 2 + arc_r)], fill=(220, 185, 100))
    # Pillars
    draw.rectangle([(gx, gy - gate_h), (gx + 32, gy)], fill=(200, 160, 80))
    draw.rectangle([(gx + gate_w - 32, gy - gate_h), (gx + gate_w, gy)], fill=(200, 160, 80))
    # Honey drips
    for hx in [100, 200, 600, 700]:
        for i in range(4):
            dy = i * 14
            draw.ellipse([(hx + i*3, 80 + dy), (hx + 12 + i*3, 92 + dy)], fill=(255, 200, 50))
    return img

# =========================================================
# 3. Chanukah — Night city with glowing menorah lights
# =========================================================
def make_chanukah_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    # Dark night sky
    for y in range(H):
        t = y / H
        r = int(lerp(10, 30, t))
        g = int(lerp(15, 40, t))
        b = int(lerp(50, 80, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Stars
    import random
    random.seed(42)
    for _ in range(60):
        sx = random.randint(0, W)
        sy = random.randint(0, int(H * 0.6))
        draw.ellipse([(sx-1, sy-1), (sx+1, sy+1)], fill=(255, 255, 200))
    # City skyline silhouette
    horizon = int(H * 0.68)
    buildings = [(0, 80), (80, 120), (160, 90), (240, 140), (320, 100), (400, 160), (480, 110), (560, 90), (640, 130), (720, 100), (780, 120)]
    for i, (bx, bh) in enumerate(buildings):
        bw = 80
        draw.rectangle([(bx, horizon - bh), (bx + bw, horizon)], fill=(15, 20, 55))
        # Windows (glowing)
        for wy in range(horizon - bh + 10, horizon, 20):
            for wx in range(bx + 8, bx + bw - 8, 18):
                draw.rectangle([(wx, wy), (wx+8, wy+10)], fill=(255, 220, 80))
    draw.rectangle([(0, horizon), (W, H)], fill=(8, 12, 35))
    # Menorah glow halos
    for cx in [200, 400, 600]:
        for i in range(9):
            ex = cx + (i - 4) * 22
            ey = horizon - 60
            draw.ellipse([(ex-14, ey-30), (ex+14, ey+10)], fill=(60, 40, 10))
            draw.ellipse([(ex-7, ey-40), (ex+7, ey-20)], fill=(255, 200, 50))
    return img

# =========================================================
# 4. Tu Bishvat — Blooming almond orchard
# =========================================================
def make_tu_bishvat_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(lerp(200, 150, t))
        g = int(lerp(235, 200, t))
        b = int(lerp(255, 180, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Ground
    ground_y = int(H * 0.70)
    draw.rectangle([(0, ground_y), (W, H)], fill=(100, 70, 40))
    # Green terraced layers
    for i in range(3):
        ty = ground_y - i * 40
        draw.rectangle([(0, ty), (W, ty + 20)], fill=(60 + i*20, 120 + i*20, 40 + i*10))
    # Almond trees
    for tx in range(60, W, 130):
        trunk_h = 80 + (tx % 3) * 20
        # Trunk
        draw.rectangle([(tx - 8, ground_y - trunk_h), (tx + 8, ground_y)], fill=(100, 65, 30))
        # Canopy (pink blossoms)
        canopy_r = 40 + (tx % 3) * 8
        draw.ellipse([(tx - canopy_r, ground_y - trunk_h - canopy_r * 1.2),
                      (tx + canopy_r, ground_y - trunk_h + canopy_r * 0.4)],
                     fill=(255, 160, 190))
        # Blossom detail (lighter overlay)
        draw.ellipse([(tx - canopy_r + 8, ground_y - trunk_h - canopy_r),
                      (tx + canopy_r - 8, ground_y - trunk_h + canopy_r * 0.2)],
                     fill=(255, 210, 230))
    return img

# =========================================================
# 5. Sukkot — Forest canopy with star-lit sechach
# =========================================================
def make_sukkot_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    # Warm evening sky
    for y in range(H):
        t = y / H
        r = int(lerp(80, 50, t))
        g = int(lerp(120, 80, t))
        b = int(lerp(60, 30, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Dense leaf canopy at top
    for lx in range(0, W, 60):
        ly = 0 + (lx % 3) * 20
        lw = 80
        draw.ellipse([(lx, ly), (lx + lw, ly + 50)], fill=(50, 100, 30))
        draw.ellipse([(lx + 10, ly - 10), (lx + lw - 10, ly + 40)], fill=(70, 130, 40))
    # Stars through sechach gaps
    import random
    random.seed(7)
    for _ in range(30):
        sx = random.randint(0, W)
        sy = random.randint(30, 100)
        draw.ellipse([(sx, sy), (sx+2, sy+2)], fill=(255, 255, 200))
    # Hanging decorations
    for dx in range(80, W, 120):
        dy = 40
        draw.ellipse([(dx - 6, dy), (dx + 6, dy + 12)], fill=(255, 80, 80))  # tomato
        draw.line([(dx, 50), (dx, dy)], fill=(80, 60, 20), width=2)
        draw.ellipse([(dx + 40 - 6, dy + 10), (dx + 40 + 6, dy + 22)], fill=(255, 220, 50))  # lemon
        draw.line([(dx + 40, 50), (dx + 40, dy + 10)], fill=(80, 60, 20), width=2)
    # Sukkah walls
    ground_y = int(H * 0.75)
    draw.rectangle([(0, ground_y), (W, H)], fill=(45, 32, 15))
    for wx in [100, 340, 580]:
        draw.rectangle([(wx, ground_y - 160), (wx + 180, ground_y)], fill=(80, 55, 25))
        # Reed roof lines
        for ry in range(4):
            draw.line([(wx, ground_y - 160 + ry * 8), (wx + 180, ground_y - 160 + ry * 8)],
                      fill=(100, 140, 50), width=3)
    return img

# =========================================================
# 6. Purim — Persian palace at night
# =========================================================
def make_purim_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(lerp(60, 30, t))
        g = int(lerp(20, 10, t))
        b = int(lerp(80, 50, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Palace silhouette
    palace_y = int(H * 0.60)
    draw.rectangle([(0, palace_y), (W, H)], fill=(90, 50, 100))
    # Domes
    for dx in [100, 300, 500, 700]:
        dome_r = 60
        draw.ellipse([(dx - dome_r, palace_y - dome_r), (dx + dome_r, palace_y + dome_r)],
                     fill=(100, 60, 120))
        draw.rectangle([(dx - 30, palace_y - 10), (dx + 30, palace_y + 60)], fill=(90, 50, 100))
        # Gold finial
        draw.polygon([(dx, palace_y - dome_r - 20), (dx - 6, palace_y - dome_r + 10),
                      (dx + 6, palace_y - dome_r + 10)], fill=(255, 200, 50))
        # Lit windows
        draw.ellipse([(dx - 14, palace_y - 6), (dx + 14, palace_y + 14)], fill=(255, 200, 80))
    # Confetti particles in sky
    import random
    random.seed(99)
    confetti_colors = [(255, 80, 150), (255, 220, 50), (80, 200, 255), (180, 80, 255)]
    for _ in range(50):
        cx = random.randint(0, W)
        cy = random.randint(0, palace_y)
        cc = confetti_colors[random.randint(0, 3)]
        draw.rectangle([(cx, cy), (cx + 6, cy + 3)], fill=cc)
    return img

# =========================================================
# 7. Shavuot — Mount Sinai with storm clouds + wheat
# =========================================================
def make_shavuot_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(lerp(80, 140, t))
        g = int(lerp(100, 160, t))
        b = int(lerp(130, 180, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Mountain
    horizon = int(H * 0.72)
    # Far mountains
    draw.polygon([(0, horizon), (200, horizon - 100), (400, horizon)], fill=(120, 140, 160))
    draw.polygon([(300, horizon), (580, horizon - 220), (800, horizon)], fill=(140, 160, 180))
    # Snow cap on peak
    draw.polygon([(530, horizon - 220), (510, horizon - 180), (550, horizon - 180)], fill=(240, 240, 255))
    # Wheat field base
    draw.rectangle([(0, horizon), (W, H)], fill=(210, 180, 80))
    for wx in range(0, W, 20):
        stem_h = 40 + (wx % 3) * 10
        draw.line([(wx + 10, H), (wx + 8, H - stem_h)], fill=(160, 120, 40), width=3)
        # Grain head
        draw.ellipse([(wx + 4, H - stem_h - 12), (wx + 16, H - stem_h)], fill=(200, 155, 50))
    # Storm clouds
    for cx in [150, 450, 650]:
        draw.ellipse([(cx - 50, 40), (cx + 50, 110)], fill=(80, 80, 90))
        draw.ellipse([(cx - 70, 60), (cx + 30, 120)], fill=(70, 70, 80))
        draw.ellipse([(cx + 10, 50), (cx + 80, 110)], fill=(75, 75, 85))
    # Lightning
    draw.line([(580, 110), (560, 160), (575, 160), (550, 210)], fill=(255, 255, 180), width=4)
    return img

# =========================================================
# 8. Simchat Torah — Scroll city, dancing lights
# =========================================================
def make_simchat_torah_bg():
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(lerp(20, 60, t))
        g = int(lerp(10, 30, t))
        b = int(lerp(60, 120, t))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    # Floating parchment scrolls
    import random
    random.seed(77)
    for _ in range(12):
        sx = random.randint(20, W - 80)
        sy = random.randint(20, int(H * 0.7))
        sw = random.randint(40, 100)
        sh = random.randint(30, 60)
        draw.rectangle([(sx, sy), (sx + sw, sy + sh)], fill=(245, 230, 180))
        # Scroll handles
        draw.ellipse([(sx - 6, sy), (sx + 6, sy + sh)], fill=(140, 80, 30))
        draw.ellipse([(sx + sw - 6, sy), (sx + sw + 6, sy + sh)], fill=(140, 80, 30))
        # Text lines
        for tl in range(3):
            draw.line([(sx + 8, sy + 8 + tl * 10), (sx + sw - 8, sy + 8 + tl * 10)],
                      fill=(100, 60, 0), width=2)
    # Flags
    flag_colors = [(0, 100, 255), (255, 255, 255), (0, 150, 0)]
    for fx in range(0, W, 150):
        draw.line([(fx + 60, H), (fx + 60, int(H * 0.4))], fill=(80, 50, 20), width=4)
        fc = flag_colors[(fx // 150) % 3]
        draw.polygon([(fx + 60, int(H * 0.4)), (fx + 110, int(H * 0.4) + 30),
                      (fx + 60, int(H * 0.4) + 60)], fill=fc)
    # Stars of David in sky
    for sx2, sy2 in [(120, 80), (350, 60), (620, 90)]:
        draw_star_of_david(draw, sx2, sy2, 20, (255, 215, 50, 200))
    # Ground
    ground_y = int(H * 0.80)
    draw.rectangle([(0, ground_y), (W, H)], fill=(30, 20, 70))
    return img

def draw_star_of_david(draw, cx, cy, r, color):
    """Draw a Star of David as two overlapping triangles."""
    import math
    pts1 = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
            for a in [270, 30, 150]]
    pts2 = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
            for a in [90, 210, 330]]
    draw.polygon(pts1, outline=color[:3], fill=None)
    draw.polygon(pts2, outline=color[:3], fill=None)

def lerp(a, b, t):
    return a + (b - a) * t

# Generate all backgrounds
save(make_pesach_bg(),        "assets/holidays/pesach/bg_pyramids_far.png")
save(make_rosh_hashanah_bg(), "assets/holidays/rosh_hashanah/bg_dawn_city.png")
save(make_chanukah_bg(),      "assets/holidays/chanukah/bg_night_city.png")
save(make_tu_bishvat_bg(),    "assets/holidays/tu_bishvat/bg_orchard_far.png")
save(make_sukkot_bg(),        "assets/holidays/sukkot/bg_forest_canopy.png")
save(make_purim_bg(),         "assets/holidays/purim/bg_persian_palace.png")
save(make_shavuot_bg(),       "assets/holidays/shavuot/bg_sinai_far.png")
save(make_simchat_torah_bg(), "assets/holidays/simchat_torah/bg_scroll_city.png")

print("\nAll holiday backgrounds generated successfully!")
