import os

def write_svg(path, content):
    with open(path, 'w') as f:
        f.write(content.strip())
    print(f"Generated {path}")

# Colors
C_SKIN = "#FFCC99"
C_SHIRT = "#0000AA"
C_HAIR = "#4A3000" # Dark Brown
C_KIPPAH = "#000000"
C_JEANS = "#0000FF"
C_LOGO = "#FFFFFF"

def player_svg(pose="idle", frame=1):
    # Basic Ethan Shape
    body_h = 30
    head_y = 10
    head_size = 24
    
    legs = ""
    arms = ""
    
    if pose == "idle":
        legs = f'<rect x="22" y="50" width="8" height="14" fill="{C_JEANS}" /><rect x="34" y="50" width="8" height="14" fill="{C_JEANS}" />'
        arms = f'<rect x="10" y="34" width="10" height="20" fill="{C_SHIRT}" /><rect x="44" y="34" width="10" height="20" fill="{C_SHIRT}" />'
    elif pose == "run":
        offset = (frame % 3) * 5
        legs = f'<rect x="{22-offset}" y="50" width="8" height="14" fill="{C_JEANS}" transform="rotate({offset * 2}, 26, 50)" /><rect x="{34+offset}" y="50" width="8" height="14" fill="{C_JEANS}" transform="rotate({-offset * 2}, 38, 50)" />'
        arms = f'<rect x="10" y="30" width="10" height="20" fill="{C_SHIRT}" transform="rotate({-20}, 15, 40)"/><rect x="44" y="30" width="10" height="20" fill="{C_SHIRT}" transform="rotate({20}, 49, 40)"/>'
    elif pose == "jump":
         legs = f'<rect x="20" y="45" width="8" height="10" fill="{C_JEANS}" transform="rotate(-20, 24, 50)" /><rect x="36" y="50" width="8" height="14" fill="{C_JEANS}" transform="rotate(10, 40, 50)" />'
         arms = f'<rect x="10" y="24" width="10" height="20" fill="{C_SHIRT}" transform="rotate(-140, 15, 34)"/><rect x="44" y="30" width="10" height="20" fill="{C_SHIRT}" transform="rotate(20, 49, 40)"/>' # Fist up
    elif pose == "duck":
        return f'''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="24" height="24" fill="{C_SKIN}" />
            <rect x="20" y="15" width="24" height="10" fill="{C_KIPPAH}" />
            <rect x="10" y="40" width="44" height="20" fill="{C_SHIRT}" />
            <rect x="22" y="55" width="8" height="9" fill="{C_JEANS}" /><rect x="34" y="55" width="8" height="9" fill="{C_JEANS}" />
        </svg>'''
    elif pose == "die":
        return f'''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
             <text x="32" y="40" font-family="Arial" font-size="20" fill="gray" text-anchor="middle">X_X</text>
             <rect x="20" y="40" width="24" height="24" fill="{C_SKIN}" />
             <rect x="10" y="50" width="44" height="14" fill="{C_SHIRT}" />
        </svg>'''
    elif pose == "win":
         legs = f'<rect x="22" y="50" width="8" height="14" fill="{C_JEANS}" /><rect x="34" y="50" width="8" height="14" fill="{C_JEANS}" />'
         arms = f'<rect x="6" y="24" width="10" height="20" fill="{C_SHIRT}" transform="rotate(-150, 11, 34)"/><rect x="48" y="24" width="10" height="20" fill="{C_SHIRT}" transform="rotate(150, 53, 34)"/>' # Both arms up
         return f'''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
          {legs}
          <rect x="10" y="34" width="44" height="20" fill="{C_SHIRT}" />
          {arms}
          <rect x="20" y="{head_y}" width="24" height="24" fill="{C_SKIN}" />
          <rect x="20" y="{head_y-5}" width="24" height="10" fill="{C_KIPPAH}" />
          <path d="M22,25 Q32,35 42,25" fill="none" stroke="black" stroke-width="2" /> <!-- Smile -->
          <circle cx="28" cy="{head_y+8}" r="2" fill="green" />
          <circle cx="36" cy="{head_y+8}" r="2" fill="green" />
        </svg>'''

    return f'''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      {legs}
      <rect x="10" y="34" width="44" height="20" fill="{C_SHIRT}" />
      {arms}
      <rect x="25" y="40" width="14" height="8" fill="{C_LOGO}" rx="2" /> <!-- Logo -->
      <rect x="20" y="{head_y}" width="24" height="24" fill="{C_SKIN}" />
      <rect x="20" y="{head_y-5}" width="24" height="10" fill="{C_KIPPAH}" />
      <circle cx="28" cy="{head_y+10}" r="2" fill="green" />
      <circle cx="36" cy="{head_y+10}" r="2" fill="green" />
    </svg>'''

# Generate Player
write_svg("assets/player/idle.svg", player_svg("idle"))
write_svg("assets/player/run_1.svg", player_svg("run", 1))
write_svg("assets/player/run_2.svg", player_svg("run", 2))
write_svg("assets/player/run_3.svg", player_svg("run", 3))
write_svg("assets/player/jump.svg", player_svg("jump"))
write_svg("assets/player/duck.svg", player_svg("duck"))
write_svg("assets/player/die.svg", player_svg("die"))
write_svg("assets/player/win.svg", player_svg("win"))
write_svg("assets/player/skid.svg", player_svg("run", 0).replace(C_SHIRT, "#4444FF"))

# Tiles
ground_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#8B4513" /><rect x="0" y="0" width="64" height="16" fill="#32CD32" /><rect x="5" y="20" width="10" height="10" fill="#654321" opacity="0.5" /></svg>'''
write_svg("assets/tiles/ground.svg", ground_svg)

dirt_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#8B4513" /><circle cx="20" cy="20" r="5" fill="#654321" opacity="0.5"/><circle cx="50" cy="50" r="8" fill="#654321" opacity="0.5"/></svg>'''
write_svg("assets/tiles/dirt.svg", dirt_svg)

brick_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#B22222" /><rect x="0" y="0" width="64" height="64" fill="none" stroke="black" stroke-width="2"/><line x1="0" y1="32" x2="64" y2="32" stroke="black" stroke-width="2"/><line x1="32" y1="0" x2="32" y2="32" stroke="black" stroke-width="2"/><line x1="16" y1="32" x2="16" y2="64" stroke="black" stroke-width="2"/><line x1="48" y1="32" x2="48" y2="64" stroke="black" stroke-width="2"/></svg>'''
write_svg("assets/tiles/brick.svg", brick_svg)

qblock_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#FFD700" stroke="black" stroke-width="2"/><text x="32" y="50" font-family="Arial" font-size="40" font-weight="bold" fill="brown" text-anchor="middle">?</text><circle cx="6" cy="6" r="2" fill="brown"/><circle cx="58" cy="6" r="2" fill="brown"/><circle cx="6" cy="58" r="2" fill="brown"/><circle cx="58" cy="58" r="2" fill="brown"/></svg>'''
write_svg("assets/tiles/qblock.svg", qblock_svg)

empty_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#8B4513" stroke="black" stroke-width="2" opacity="0.8"/></svg>'''
write_svg("assets/tiles/empty.svg", empty_svg)

hard_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#708090" stroke="black" stroke-width="2"/><rect x="10" y="10" width="44" height="44" fill="#8090A0"/></svg>'''
write_svg("assets/tiles/hard.svg", hard_svg)

# Scenery
pipe_top = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="0" width="60" height="30" fill="#00AA00" stroke="black" stroke-width="2"/><rect x="6" y="30" width="52" height="34" fill="#00AA00" stroke="black" stroke-width="2"/></svg>'''
write_svg("assets/scenery/pipe_top.svg", pipe_top)
pipe_body = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="0" width="52" height="64" fill="#00AA00" stroke="black" stroke-width="2"/></svg>'''
write_svg("assets/scenery/pipe_body.svg", pipe_body)

bush_svg = '''<svg width="128" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M10,64 Q20,20 40,50 T70,40 T100,50 T118,64 Z" fill="#228B22" /><path d="M10,64 H118 Z" stroke="black"/></svg>'''
write_svg("assets/scenery/bush_1.svg", bush_svg)
write_svg("assets/scenery/bush_2.svg", bush_svg.replace('width="128"', 'width="96"').replace('118', '86'))

cloud_svg = '''<svg width="128" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M10,64 Q30,20 64,40 T118,64 Z" fill="white" opacity="0.8"/></svg>'''
write_svg("assets/scenery/cloud_1.svg", cloud_svg)
write_svg("assets/scenery/cloud_2.svg", cloud_svg.replace('width="128"', 'width="192"').replace('118', '180'))

hill_svg = '''<svg width="256" height="128" xmlns="http://www.w3.org/2000/svg"><path d="M0,128 Q128,0 256,128" fill="#006400" opacity="0.6"/><path d="M0,128 H256 Z" stroke="none"/></svg>'''
write_svg("assets/scenery/hill_1.svg", hill_svg)

bg_sky = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="64" fill="#87CEEB" /></svg>'''
write_svg("assets/scenery/bg_sky.svg", bg_sky)

# Enemies
goomba_svg = '''<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<path d="M15,50 L49,50 L55,20 Q32,0 9,20 Z" fill="#8B4513" /> <!-- Body -->
<circle cx="25" cy="25" r="5" fill="white"/><circle cx="27" cy="25" r="2" fill="black"/> <!-- Eye -->
<circle cx="39" cy="25" r="5" fill="white"/><circle cx="37" cy="25" r="2" fill="black"/> <!-- Eye -->
<polygon points="22,42 28,42 25,37" fill="white" /> <!-- Tooth 1 -->
<polygon points="32,42 38,42 35,37" fill="white" /> <!-- Tooth 2 -->
<rect x="20" y="50" width="10" height="10" fill="black" /> <!-- Foot -->
<rect x="34" y="50" width="10" height="10" fill="black" /> <!-- Foot -->
</svg>'''
write_svg("assets/enemies/goomba.svg", goomba_svg)
write_svg("assets/enemies/goomba_squish.svg", goomba_svg.replace('height="64"','height="32"'))

koopa_svg = '''<svg width="64" height="80" xmlns="http://www.w3.org/2000/svg">
<rect x="15" y="40" width="34" height="40" fill="green" rx="10" /> <!-- Shell -->
<circle cx="32" cy="20" r="15" fill="yellow" /> <!-- Head -->
<rect x="15" y="70" width="10" height="10" fill="orange" /> <!-- Foot -->
<rect x="39" y="70" width="10" height="10" fill="orange" /> <!-- Foot -->
</svg>'''
write_svg("assets/enemies/koopa.svg", koopa_svg)
write_svg("assets/enemies/koopa_shell.svg", '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="34" height="40" fill="green" rx="10" stroke="white" stroke-width="2"/></svg>')

# Items
coin_svg = '''<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#DAA520" stroke-width="2" /><text x="16" y="24" font-family="Arial" font-size="16" fill="#DAA520" text-anchor="middle">$</text></svg>'''
write_svg("assets/items/coin.svg", coin_svg)

mushroom_svg = '''<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
<path d="M6,16 Q16,0 26,16" fill="red" stroke="black" />
<circle cx="10" cy="8" r="4" fill="white"/> <!-- Left Dot -->
<circle cx="22" cy="8" r="4" fill="white"/> <!-- Right Dot -->
<circle cx="16" cy="12" r="3" fill="white"/> <!-- Center Dot -->
<rect x="10" y="16" width="12" height="12" fill="#FFE4C4" stroke="black"/>
<circle cx="14" cy="20" r="1" fill="black"/>
<circle cx="18" cy="20" r="1" fill="black"/>
</svg>'''
write_svg("assets/items/mushroom.svg", mushroom_svg)

star_svg = '''<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" fill="yellow" stroke="orange" stroke-width="1"/></svg>'''
write_svg("assets/items/star.svg", star_svg)

# UI
ui_heart = '''<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path d="M16,28 C-10,10 -10,-5 16,5 C42,-5 42,10 16,28" fill="red" stroke="darkred"/></svg>'''
write_svg("assets/ui/heart.svg", ui_heart)
write_svg("assets/ui/coin_icon.svg", coin_svg)

logo_svg = '''<svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
<text x="200" y="100" font-family="Arial" font-size="60" font-weight="bold" fill="#0000AA" stroke="white" stroke-width="3" text-anchor="middle">SUPER ETHAN</text>
</svg>'''
write_svg("assets/ui/logo.svg", logo_svg)
