import os
from PIL import Image, ImageDraw, ImageFont

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def write_svg(path, content):
    ensure_dir(path)
    with open(path, 'w') as f:
        f.write(content.strip())
    print(f"Generated SVG: {path}")

def generate_png(path, size, bg_color, text, text_color="white", add_gradient=False):
    ensure_dir(path)
    img = Image.new('RGBA', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    if add_gradient:
        # Simple vertical gradient
        for y in range(size[1]):
            r = max(0, bg_color[0] - int((y / size[1]) * 50))
            g = max(0, bg_color[1] - int((y / size[1]) * 50))
            b = max(0, bg_color[2] - int((y / size[1]) * 50))
            draw.line([(0, y), (size[0], y)], fill=(r, g, b, bg_color[3] if len(bg_color) == 4 else 255))

    # Add text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size[1] // 5)
    except:
        font = ImageFont.load_default()
        
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    text_w = right - left
    text_h = bottom - top
    x = (size[0] - text_w) / 2
    y = (size[1] - text_h) / 2
    draw.text((x, y), text, font=font, fill=text_color)
    
    img.save(path)
    print(f"Generated PNG: {path}")

# --- 1. Shared / Core Art ---
generate_png("assets/ui/logo_holiday.png", (400, 150), (20, 20, 100), "S. ETHAN HOLIDAY", add_gradient=True)
generate_png("assets/ui/title_bg_year_cycle.png", (800, 600), (40, 20, 80), "YEAR CYCLE MAP")
generate_png("assets/ui/world_map_ring.png", (400, 400), (60, 60, 90, 128), "RING")
generate_png("assets/ui/stage_card_frame.png", (300, 200), (255, 215, 0, 128), "STAGE")
generate_png("assets/ui/goal_marker.png", (64, 64), (255, 0, 0), "GOAL!")
generate_png("assets/effects/glow_orb.png", (64, 64), (255, 255, 100, 128), "ORB")
generate_png("assets/effects/leaf_particle.png", (16, 16), (34, 139, 34), "")
generate_png("assets/effects/confetti_particle.png", (16, 16), (255, 20, 147), "")
generate_png("assets/effects/lightning_flash.png", (128, 128), (255, 255, 200, 180), "ZAP")

C_SKIN = "#FFCC99"
C_SHIRT = "#0000AA"
C_HAIR = "#4A3000"
C_KIPPAH = "#FFFFFF" # White festive kippah
C_TZITZIT = "#FFFFFF"

def hero_svg(pose="idle"):
    # Base shapes for Ethan, enhanced with holiday vibe (white shirt/kippah or tzitzit)
    return f'''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
       <rect x="22" y="50" width="8" height="14" fill="#0000FF" />
       <rect x="34" y="50" width="8" height="14" fill="#0000FF" />
       <rect x="10" y="34" width="44" height="20" fill="{C_SHIRT}" />
       <rect x="6" y="34" width="6" height="10" fill="{C_TZITZIT}" /> <!-- tzitzit fringe -->
       <rect x="52" y="34" width="6" height="10" fill="{C_TZITZIT}" />
       <rect x="25" y="40" width="14" height="8" fill="#FFF" rx="2" /> <!-- logo -->
       <rect x="20" y="10" width="24" height="24" fill="{C_SKIN}" />
       <rect x="20" y="5" width="24" height="10" fill="{C_KIPPAH}" />
       <circle cx="28" cy="20" r="2" fill="green" />
       <circle cx="36" cy="20" r="2" fill="green" />
       <text x="32" y="60" font-family="Arial" font-size="10" fill="#FFF" text-anchor="middle">{pose}</text>
    </svg>'''

for state in ["idle", "run_1", "run_2", "run_3", "jump", "duck", "die", "win"]:
    write_svg(f"assets/player/hero_{state}_holiday.svg", hero_svg(state))


# --- 2. Pesach / MVP ---
generate_png("assets/holidays/pesach/bg_sky_desert.png", (800, 300), (135, 206, 235), "", add_gradient=True)
generate_png("assets/holidays/pesach/bg_pyramids_far.png", (800, 300), (210, 180, 140, 180), "PYRAMIDS", add_gradient=True)
generate_png("assets/holidays/pesach/bg_nile_mid.png", (800, 200), (70, 130, 180, 200), "NILE")
generate_png("assets/holidays/pesach/boss_pharaoh.png", (128, 128), (218, 165, 32), "PHARAOH BOSS")
generate_png("assets/holidays/pesach/goal_gate_of_freedom.png", (128, 256), (139, 69, 19), "FREEDOM GATE")

write_svg("assets/holidays/pesach/tiles_matzah_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#f8e4a1" stroke="#b88645" stroke-width="4"/><circle cx="16" cy="16" r="3" fill="#b88645" /><circle cx="48" cy="48" r="3" fill="#b88645" /></svg>''')
write_svg("assets/holidays/pesach/tiles_sand_ground.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#eaddaf"/><path d="M0,0 Q32,10 64,0" fill="#d4c18c"/></svg>''')
write_svg("assets/holidays/pesach/tiles_pharaoh_stone.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#eaddaf" stroke="#000" stroke-width="2"/><text x="32" y="40" font-family="Arial" font-size="20" fill="blue" text-anchor="middle">𓂀</text></svg>''')
write_svg("assets/holidays/pesach/enemy_palace_guard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="20" width="32" height="40" fill="#A52A2A"/><rect x="20" y="10" width="24" height="15" fill="#FFD700"/></svg>''')
write_svg("assets/holidays/pesach/enemy_chariot_scout.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="48" r="12" fill="#000"/><circle cx="48" cy="48" r="12" fill="#000"/><rect x="10" y="20" width="44" height="20" fill="#B8860B"/></svg>''')


# --- 3. Rosh Hashanah ---
generate_png("assets/holidays/rosh_hashanah/bg_dawn_city.png", (800, 300), (255, 230, 204), "DAWN CITY", add_gradient=True)
generate_png("assets/holidays/rosh_hashanah/bg_honey_market.png", (800, 200), (255, 200, 100, 200), "HONEY MARKET")
generate_png("assets/holidays/rosh_hashanah/boss_year_gatekeeper.png", (128, 128), (255, 255, 255), "GATEKEEPER BOSS", text_color="gold")
generate_png("assets/holidays/rosh_hashanah/goal_shofar_gate.png", (128, 256), (45, 165, 32), "SHOFAR GATE")
write_svg("assets/holidays/rosh_hashanah/tiles_honey_block.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#FFA500" stroke="#FFD700" stroke-width="4"/></svg>''')
write_svg("assets/holidays/rosh_hashanah/tiles_gate_stone.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#FDF5E6" stroke="#D3D3D3" stroke-width="2"/></svg>''')
write_svg("assets/holidays/rosh_hashanah/enemy_gatekeeper.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="20" fill="#FFF"/><path d="M10,32 Q32,0 54,32" stroke="gold" stroke-width="4" fill="none"/></svg>''')
write_svg("assets/holidays/rosh_hashanah/enemy_mist_wisp.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24" fill="#EEE" opacity="0.6"/></svg>''')

# --- 4. Chanukah / MVP ---
generate_png("assets/holidays/chanukah/bg_night_city.png", (800, 300), (20, 20, 60), "NIGHT CITY", add_gradient=True)
generate_png("assets/holidays/chanukah/bg_temple_glow.png", (800, 200), (40, 30, 20, 200), "TEMPLE GLOW")
generate_png("assets/holidays/chanukah/boss_dark_commander.png", (128, 128), (10, 10, 10), "DARK BOSS")
generate_png("assets/holidays/chanukah/goal_grand_menorah.png", (128, 256), (255, 215, 0), "GRAND MENORAH", text_color="black")
write_svg("assets/holidays/chanukah/tiles_ember_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#333"/><circle cx="32" cy="32" r="16" fill="#FF4500"/></svg>''')
write_svg("assets/holidays/chanukah/tiles_oil_stone.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#555" stroke="#222" stroke-width="2"/><circle cx="32" cy="32" r="10" fill="#FFD700" opacity="0.8"/></svg>''')
write_svg("assets/holidays/chanukah/enemy_shadow_guard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="16" width="32" height="48" fill="#111"/><circle cx="26" cy="30" r="4" fill="red"/></svg>''')
write_svg("assets/holidays/chanukah/enemy_dark_spinner.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,10 50,32 32,60 14,32" fill="#222"/><text x="32" y="38" fill="white" font-size="20" text-anchor="middle">ג</text></svg>''')

# --- 5. Tu Bishvat ---
generate_png("assets/holidays/tu_bishvat/bg_orchard_far.png", (800, 300), (135, 206, 235), "ORCHARD SKY", add_gradient=True)
generate_png("assets/holidays/tu_bishvat/bg_terraces_mid.png", (800, 200), (34, 139, 34, 200), "TERRACES")
generate_png("assets/holidays/tu_bishvat/boss_forest_keeper.png", (128, 128), (0, 100, 0), "FOREST KEEPER")
generate_png("assets/holidays/tu_bishvat/goal_blossom_arch.png", (128, 256), (255, 182, 193), "BLOSSOM ARCH", text_color="green")
write_svg("assets/holidays/tu_bishvat/tiles_blossom_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#654321"/><circle cx="32" cy="16" r="12" fill="#FFB6C1"/></svg>''')
write_svg("assets/holidays/tu_bishvat/tiles_root_ground.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#8B4513"/><path d="M0,32 Q32,0 64,32" stroke="#5C4033" stroke-width="6" fill="none"/></svg>''')
write_svg("assets/holidays/tu_bishvat/enemy_thorn_bug.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="40" r="16" fill="#006400"/><polygon points="32,0 26,24 38,24" fill="#8B0000"/></svg>''')
write_svg("assets/holidays/tu_bishvat/enemy_frost_spirit.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M32,10 L50,60 L14,60 Z" fill="#E0FFFF"/></svg>''')

# --- 6. Sukkot ---
generate_png("assets/holidays/sukkot/bg_forest_canopy.png", (800, 300), (46, 139, 87), "CANOPY", add_gradient=True)
generate_png("assets/holidays/sukkot/bg_sukkah_lights.png", (800, 200), (245, 222, 179, 200), "SUKKAH LIGHTS")
generate_png("assets/holidays/sukkot/boss_storm_gust.png", (128, 128), (176, 196, 222), "STORM BOSS")
generate_png("assets/holidays/sukkot/goal_great_sukkah.png", (128, 256), (189, 183, 107), "GREAT SUKKAH")
write_svg("assets/holidays/sukkot/tiles_reed_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#9ACD32"/><line x1="16" y1="0" x2="16" y2="64" stroke="#556B2F" stroke-width="4"/></svg>''')
write_svg("assets/holidays/sukkot/tiles_wood_platform.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" fill="#CD853F"/><line x1="0" y1="12" x2="64" y2="12" stroke="#8B4513" stroke-width="2"/></svg>''')
write_svg("assets/holidays/sukkot/enemy_wind_spirit.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M10,40 Q32,10 54,40 M20,50 Q32,20 44,50" stroke="#FFF" stroke-width="4" fill="none"/></svg>''')
write_svg("assets/holidays/sukkot/enemy_branch_crawler.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="40" width="44" height="10" fill="#8B4513"/><line x1="10" y1="40" x2="16" y2="20" stroke="green" stroke-width="4"/></svg>''')

# --- 7. Purim / MVP ---
generate_png("assets/holidays/purim/bg_persian_palace.png", (800, 300), (147, 112, 219), "PALACE", add_gradient=True)
generate_png("assets/holidays/purim/bg_mask_market.png", (800, 200), (72, 61, 139, 200), "MASK MARKET")
generate_png("assets/holidays/purim/boss_haman.png", (128, 128), (0, 0, 0), "HAMAN BOSS", text_color="red")
generate_png("assets/holidays/purim/goal_palace_gate.png", (128, 256), (218, 165, 32), "PALACE GATE")
write_svg("assets/holidays/purim/tiles_confetti_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#8A2BE2"/><circle cx="16" cy="16" r="4" fill="pink"/><circle cx="48" cy="48" r="4" fill="gold"/></svg>''')
write_svg("assets/holidays/purim/tiles_palace_floor.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#00CED1"/><path d="M0,0 L64,64 M64,0 L0,64" stroke="#48D1CC" stroke-width="4"/></svg>''')
write_svg("assets/holidays/purim/enemy_masked_guard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="24" height="44" fill="#555"/><path d="M16,20 Q32,-10 48,20 Z" fill="#FF1493"/></svg>''')
write_svg("assets/holidays/purim/enemy_decree_messenger.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="16" fill="black"/><path d="M32,32 L50,10" stroke="white" stroke-width="4"/></svg>''')

# --- 8. Shavuot ---
generate_png("assets/holidays/shavuot/bg_sinai_far.png", (800, 300), (119, 136, 153), "SINAI FAR", add_gradient=True)
generate_png("assets/holidays/shavuot/bg_wheat_fields.png", (800, 200), (245, 222, 179, 200), "WHEAT")
generate_png("assets/holidays/shavuot/boss_lightning_storm.png", (128, 128), (255, 255, 0), "LIGHTNING BOSS", text_color="black")
generate_png("assets/holidays/shavuot/goal_tablets_peak.png", (128, 256), (192, 192, 192), "TABLETS")
write_svg("assets/holidays/shavuot/tiles_floral_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#F0FFF0"/><circle cx="32" cy="32" r="8" fill="pink"/><circle cx="32" cy="32" r="3" fill="yellow"/></svg>''')
write_svg("assets/holidays/shavuot/tiles_mountain_stone.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#A9A9A9"/><path d="M10,10 L30,50" stroke="#808080" stroke-width="4"/></svg>''')
write_svg("assets/holidays/shavuot/enemy_storm_cloud.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="28" ry="16" fill="#696969"/><path d="M32,48 L28,60" stroke="yellow" stroke-width="4"/></svg>''')
write_svg("assets/holidays/shavuot/enemy_peak_guard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,20 50,60 14,60" fill="#778899"/></svg>''')

# --- 9. Simchat Torah ---
generate_png("assets/holidays/simchat_torah/bg_scroll_city.png", (800, 300), (25, 25, 112), "SCROLL CITY", add_gradient=True)
generate_png("assets/holidays/simchat_torah/bg_dance_lights.png", (800, 200), (255, 140, 0, 150), "DANCE LIGHTS")
generate_png("assets/holidays/simchat_torah/boss_cycle_keeper.png", (128, 128), (255, 215, 0), "CYCLE KEEPER", text_color="black")
generate_png("assets/holidays/simchat_torah/goal_torah_circle.png", (128, 256), (255, 69, 0), "TORAH CIRCLE")
write_svg("assets/holidays/simchat_torah/tiles_scroll_brick.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#F5DEB3"/><rect x="4" y="10" width="56" height="4" fill="#8B4513"/><rect x="4" y="50" width="56" height="4" fill="#8B4513"/></svg>''')
write_svg("assets/holidays/simchat_torah/tiles_mosaic_floor.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#4682B4"/><rect x="32" y="32" width="32" height="32" fill="#4682B4"/><rect x="32" y="0" width="32" height="32" fill="#87CEEB"/><rect x="0" y="32" width="32" height="32" fill="#87CEEB"/></svg>''')
write_svg("assets/holidays/simchat_torah/enemy_scroll_guard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="24" y="10" width="16" height="54" fill="#F5DEB3" rx="4"/><line x1="24" y1="20" x2="40" y2="20" stroke="#000" stroke-width="2"/></svg>''')
write_svg("assets/holidays/simchat_torah/enemy_banner_wisp.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M10,20 Q32,-10 54,20 T40,60" fill="none" stroke="#FF8C00" stroke-width="6"/></svg>''')

print("ALL ASSETS GENERATED!")
