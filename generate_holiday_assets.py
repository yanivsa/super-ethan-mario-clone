import os

# Create directories if they don't exist
os.makedirs("assets/tiles", exist_ok=True)
os.makedirs("assets/enemies", exist_ok=True)
os.makedirs("assets/scenery", exist_ok=True)
os.makedirs("assets/goals", exist_ok=True)

def write_svg(path, content):
    with open(path, 'w') as f:
        f.write(content.strip())
    print(f"Generated {path}")

# ==========================================
# Pesach (Passover)
# ==========================================
# Backdrop: Pyramids
write_svg("assets/scenery/bg_pyramids.svg", '''<svg width="256" height="128" xmlns="http://www.w3.org/2000/svg">
<rect width="256" height="128" fill="#dca760"/>
<polygon points="50,128 100,50 150,128" fill="#b88645" />
<polygon points="100,50 150,128 130,128" fill="#8f642e" />
<polygon points="140,128 180,70 220,128" fill="#b88645" />
<polygon points="180,70 220,128 200,128" fill="#8f642e" />
</svg>''')

# Tile: Matzah
write_svg("assets/tiles/matzah.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="64" height="64" fill="#f8e4a1" stroke="#b88645" stroke-width="4"/>
<circle cx="16" cy="16" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="32" cy="16" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="48" cy="16" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="16" cy="32" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="32" cy="32" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="48" cy="32" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="16" cy="48" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="32" cy="48" r="3" fill="#b88645" opacity="0.6"/>
<circle cx="48" cy="48" r="3" fill="#b88645" opacity="0.6"/>
</svg>''')

# Enemy: Pharaoh
write_svg("assets/enemies/pharaoh.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="16" y="20" width="32" height="34" fill="#FFE0B2"/> <!-- face -->
<path d="M12,20 Q32,-10 52,20" fill="#FFD700" stroke="#0000CD" stroke-width="6"/> <!-- crown -->
<rect x="24" y="54" width="16" height="10" fill="#FFFFFF"/> <!-- dress -->
<circle cx="26" cy="30" r="3" fill="#000"/>
<circle cx="38" cy="30" r="3" fill="#000"/>
<rect x="30" y="44" width="4" height="6" fill="#8B4513"/> <!-- beard -->
</svg>''')

# Goal: Exodus Gate
write_svg("assets/goals/exodus.svg", '''<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="20" height="108" fill="#dca760" stroke="#8f642e" stroke-width="4"/>
<rect x="88" y="20" width="20" height="108" fill="#dca760" stroke="#8f642e" stroke-width="4"/>
<rect x="10" y="10" width="108" height="20" fill="#dca760" stroke="#8f642e" stroke-width="4"/>
<text x="64" y="25" font-family="Arial" font-size="12" fill="#8f642e" text-anchor="middle">EXIT</text>
</svg>''')


# ==========================================
# Rosh Hashanah
# ==========================================
# Backdrop: Gate
write_svg("assets/scenery/bg_gate.svg", '''<svg width="256" height="128" xmlns="http://www.w3.org/2000/svg">
<rect width="256" height="128" fill="#ffd56a"/>
<path d="M50,128 L50,60 Q80,20 110,60 L110,128" fill="#FFF9E6" stroke="#E6C280" stroke-width="4"/>
<path d="M150,128 L150,60 Q180,20 210,60 L210,128" fill="#FFF9E6" stroke="#E6C280" stroke-width="4"/>
</svg>''')

# Tile: Honey
write_svg("assets/tiles/honey.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="64" height="64" fill="#B22222" /> <!-- apple red base -->
<path d="M0,0 L64,0 L64,20 Q56,36 48,20 Q40,40 32,20 Q24,50 16,20 Q8,30 0,20 Z" fill="#FFA500"/> <!-- dripping honey -->
<path d="M30,30 Q32,50 34,50" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/> <!-- drip line -->
</svg>''')

# Enemy: Gatekeeper/Bee
write_svg("assets/enemies/gatekeeper.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="20" fill="#FFD700"/>
<path d="M12,12 Q32,32 52,12" stroke="#FFFFFF" stroke-width="6" fill="none" opacity="0.8"/> <!-- wings -->
<rect x="22" y="26" width="20" height="4" fill="#000"/> <!-- stripe -->
<rect x="22" y="34" width="20" height="4" fill="#000"/> <!-- stripe -->
<circle cx="28" cy="22" r="2" fill="#000"/>
<circle cx="36" cy="22" r="2" fill="#000"/>
</svg>''')


# ==========================================
# Hanukkah
# ==========================================
write_svg("assets/tiles/ember.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="64" height="64" fill="#2E2B2A" />
<circle cx="32" cy="32" r="16" fill="#FF4500" opacity="0.8"/>
<circle cx="32" cy="32" r="8" fill="#FFD700"/>
<path d="M0,0 L64,0 L64,64 L0,64 Z" fill="none" stroke="#5C4033" stroke-width="8"/>
</svg>''')

write_svg("assets/enemies/flameguard.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="30" width="24" height="24" fill="#1C1C1C"/>
<path d="M32,10 Q20,30 32,40 Q44,30 32,10" fill="#FF4500"/>
<circle cx="28" cy="26" r="2" fill="#FFF"/>
<circle cx="36" cy="26" r="2" fill="#FFF"/>
<rect x="26" y="54" width="12" height="10" fill="#000"/>
</svg>''')


# ==========================================
# Purim
# ==========================================
write_svg("assets/tiles/confetti.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="64" height="64" fill="#4B0082" />
<circle cx="16" cy="16" r="4" fill="#FF1493"/>
<circle cx="48" cy="24" r="5" fill="#00FFFF"/>
<circle cx="24" cy="48" r="6" fill="#FFD700"/>
<circle cx="50" cy="50" r="3" fill="#32CD32"/>
<path d="M0,0 L64,0 L64,64 L0,64 Z" fill="none" stroke="#8A2BE2" stroke-width="4"/>
</svg>''')

write_svg("assets/enemies/masked.svg", '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect x="18" y="24" width="28" height="30" fill="#2F4F4F"/>
<path d="M14,24 Q32,-10 50,24 L32,44 Z" fill="#FF1493"/> <!-- Mask -->
<circle cx="26" cy="22" r="3" fill="#FFF"/>
<circle cx="38" cy="22" r="3" fill="#FFF"/>
</svg>''')


print("Generated comprehensive set of SVGs for holidays!")
