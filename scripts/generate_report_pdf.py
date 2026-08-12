#!/usr/bin/env python3
"""Generate Undead Arcade game report PDF."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "Undead_Arcade_Game_Report.pdf"


def clean(s: str) -> str:
    repl = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "-",
        "\u00d7": "x",
        "\u2192": "->",
        "\u2212": "-",
        "\u2026": "...",
        "\xa0": " ",
    }
    for a, b in repl.items():
        s = s.replace(a, b)
    return s.encode("latin-1", "replace").decode("latin-1")


class Report(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, "Undead Arcade - Game Report", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(140, 140, 140)
        self.cell(
            0,
            10,
            f"Undead Arcade | Phaser 3 | Aug 2026 | Page {self.page_no()}",
            align="C",
        )

    def _text(self, w, h, text, **kwargs):
        self.set_x(self.l_margin)
        self.multi_cell(w, h, clean(text), new_x="LMARGIN", new_y="NEXT", **kwargs)

    def h1(self, text):
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(20, 20, 20)
        self._text(0, 10, text)
        self.ln(2)

    def h2(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 30, 30)
        self._text(0, 8, text)
        self.ln(1)

    def h3(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(45, 45, 45)
        self._text(0, 7, text)
        self.ln(1)

    def body(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self._text(0, 5.5, text)
        self.ln(1)

    def italic_quote(self, text, note=""):
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(50, 50, 50)
        self._text(0, 5, text)
        if note:
            self.set_font("Helvetica", "", 8)
            self.set_text_color(120, 120, 120)
            self._text(0, 4.5, note)
        self.ln(2)

    def bullet(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self._text(0, 5.5, f"- {text}")

    def table(self, headers, rows, col_widths=None):
        self.set_x(self.l_margin)
        if col_widths is None:
            col_widths = [self.epw / len(headers)] * len(headers)
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(35, 35, 35)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, clean(h), border=1, fill=True, align="C")
        self.ln()
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(30, 30, 30)
        fill = False
        for row in rows:
            line_hs = []
            for i, cell in enumerate(row):
                lines = self.multi_cell(
                    col_widths[i],
                    5,
                    clean(str(cell)),
                    dry_run=True,
                    output="LINES",
                )
                line_hs.append(max(1, len(lines)))
            row_h = max(line_hs) * 5
            if self.get_y() + row_h > self.page_break_trigger:
                self.add_page()
                self.set_font("Helvetica", "B", 9)
                self.set_fill_color(35, 35, 35)
                self.set_text_color(255, 255, 255)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 7, clean(h), border=1, fill=True, align="C")
                self.ln()
                self.set_font("Helvetica", "", 8.5)
                self.set_text_color(30, 30, 30)
            x0, y0 = self.l_margin, self.get_y()
            self.set_fill_color(248, 248, 248) if fill else self.set_fill_color(255, 255, 255)
            for i, cell in enumerate(row):
                self.set_xy(x0 + sum(col_widths[:i]), y0)
                self.rect(x0 + sum(col_widths[:i]), y0, col_widths[i], row_h)
                self.multi_cell(
                    col_widths[i],
                    5,
                    clean(str(cell)),
                    new_x="RIGHT",
                    new_y="TOP",
                )
            self.set_xy(x0, y0 + row_h)
            fill = not fill
        self.set_x(self.l_margin)
        self.ln(3)


def main():
    pdf = Report()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_margins(18, 18, 18)

    pdf.h1("Undead Arcade")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 6, "Game Design Report", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        5,
        "Phaser 3.90 | Vite | 1280x720 | Supabase scores | Package: undead-arcade",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(3)
    pdf.set_draw_color(180, 180, 180)
    pdf.line(18, pdf.get_y(), 192, pdf.get_y())
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(45, 8, "3 player hearts", border=1, align="C")
    pdf.cell(45, 8, "7 enemy types", border=1, align="C")
    pdf.cell(45, 8, "2 abilities", border=1, align="C")
    pdf.cell(
        45,
        8,
        "2+ arena levels",
        border=1,
        align="C",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(4)

    pdf.h2("1. What the game is about")
    pdf.body(
        "Undead Arcade is a classic arcade-style 2D top-down zombie survival shooter. "
        "You play as a customizable soldier in a scrolling apocalyptic arena. Zombies enter "
        "from the borders; you shoot them, collect coins, buy shop upgrades, pick up rare "
        "abilities, defeat a boss, and walk through an exit door into the next level. There "
        "is no permanent win screen - the run ends when HP reaches zero. On death, you can "
        "save survival time and progress to a Supabase leaderboard."
    )
    pdf.h3("Goal")
    pdf.body(
        "Survive as long as possible. Clear arenas, beat bosses, advance levels, and stack "
        "coins/upgrades between arenas."
    )
    pdf.h3("Lose condition")
    pdf.body(
        "Reach 0 hearts -> death overlay -> Save score / Restart / Main Menu "
        "(Supabase run_scores table)."
    )

    pdf.h3("Level timeline")
    pdf.table(
        ["", "Level 1", "Level 2+"],
        [
            ["Map", "Map.png", "map2.png"],
            ["Spawn stop (clear window)", "60 seconds", "120 seconds"],
            ["Boss unlock", "90 seconds", "150 seconds"],
            [
                "Enemy cast",
                "Walkers + bone throwers",
                "Walkers, crawlers, exploders, acid spitters",
            ],
            ["Boss", "Charger (Boss1)", "Acid Broodmother (Boss2)"],
            ["Music", "Level 1 loop -> bossbattle", "Level 2 loop -> bossbattle2"],
        ],
        [42, 65, 73],
    )

    pdf.h2("2. Characters")
    pdf.h3("Player - Soldier")
    pdf.body(
        "Built from a headless body spritesheet (Mainbody.png) with an optional webcam or "
        "uploaded face baked into a retro pixel head and attached at the neck socket. Aim "
        "follows the pointer; movement uses WASD."
    )
    pdf.table(
        ["Stat", "Value"],
        [
            ["Max HP", "3 hearts"],
            ["Move speed", "155"],
            ["Bullet damage / speed", "1 / 520"],
            ["Base fire rate", "420 ms"],
            ["Magazine / reload", "8 rounds / 1100 ms (press R)"],
            ["I-frames after hit", "5000 ms"],
            ["Knockback", "220"],
        ],
        [70, 110],
    )

    pdf.h3("Enemies")
    pdf.table(
        ["Type", "HP", "Speed", "Behavior"],
        [
            ["Walker (Zombie1)", "3", "45-75", "Predictive chase + pack separation"],
            ["Bone thrower (Zombie2)", "2", "28-42", "Keeps range ~320; fires every 1.7s"],
            ["Exploder", "7", "120-150", "Rushes; detonates near player or on death"],
            ["Acid spitter", "3", "32-48", "Long-range spit + acid puddles"],
            ["Crawler", "2", "155-190", "Fast ground rush; holds close range"],
            ["Boss 1 - Charger", "70", "115-130", "Chase, 5-bone fan, telegraph charge"],
            [
                "Boss 2 - Broodmother",
                "95",
                "95-115",
                "Acid, birth crawlers, burrow, throw exploder",
            ],
        ],
        [48, 18, 28, 86],
    )
    pdf.body(
        "Spawn pacing: continuous timed spawns (not numbered waves). Pool cap 28. "
        "Level 2 unlocks spitters (~18s), crawlers (~8s), and rarer exploders (max 1 at a time)."
    )

    pdf.h2("3. Abilities")
    pdf.body(
        "Non-boss kills have a 5% chance to drop an ability pickup (50% in tester mode). "
        "Shockwave art exists in assets but was removed from gameplay."
    )
    pdf.h3("Overdrive (7 seconds)")
    pdf.body(
        "Fire rate x0.55 (floor 120 ms), infinite ammo, cancels reload. Orange tint + voice SFX."
    )
    pdf.h3("Shield (1 charge)")
    pdf.body(
        'Blue ring. Next hit shows "BLOCKED", no HP loss, still grants 5 seconds of i-frames.'
    )

    pdf.h2("4. Mechanics")
    pdf.h3("Controls")
    pdf.bullet("WASD - move (arrow keys disabled to avoid confusion)")
    pdf.bullet("Click / hold / Space - shoot")
    pdf.bullet("R - reload")
    pdf.bullet("P - shop | Esc - pause")
    pdf.ln(1)

    pdf.h3("Economy")
    pdf.bullet("1 coin per normal kill")
    pdf.bullet("Boss kill -> 20-coin splash + exit door")
    pdf.bullet("Coin magnet radius 78")
    pdf.bullet("Arena clear -> +1 heart (max 3)")
    pdf.ln(1)

    pdf.h3("Shop (press P)")
    pdf.table(
        ["Item", "Cost", "Effect"],
        [
            ["Heart", "10", "+1 HP (max 3)"],
            ["Fire rate", "12 / 25 / 42", "x0.88 per level (floor 180 ms)"],
            ["Mag size", "10 / 20 / 36", "Mag = 8 + 2x level (up to 14)"],
            ["Reload", "14 / 28", "x0.82 per level (floor 450 ms)"],
        ],
        [40, 45, 95],
    )

    pdf.h3("Face customization pipeline")
    pdf.body(
        "Menu webcam snapshot or upload -> 512x512 crop -> POST /api/bake-face "
        "(Gemini / OpenAI) green-screen head -> chroma key -> localStorage -> composited "
        "onto soldier sheet as a retro 16-bit style head."
    )

    pdf.h3("Level loop")
    pdf.body(
        "Timed spawns -> spawn stop -> clear remaining enemies -> optional heart reward -> "
        "boss warning (4s alarm) -> boss fight -> door -> LEVEL CLEAR -> next level. "
        "Coins/upgrades persist; HP/ammo refill."
    )

    pdf.h2("5. Systems and key functions")
    pdf.table(
        ["Module", "Role"],
        [
            ["src/main.js", "Phaser boot | 1280x720 | MenuScene -> GameScene"],
            ["src/scenes/MenuScene.js", "Face capture, bake, START, hidden tester unlock"],
            [
                "src/scenes/GameScene.js",
                "Core loop: spawn, combat, shop, levels, audio, death",
            ],
            ["src/zombies.js", "Enemy types, AI, bosses, sheet baking"],
            ["src/soldierAnim.js", "Soldier sheet + head attach"],
            ["src/deathOverlay.js + scores.js", "Death UI + Supabase run persistence"],
            ["server/bakeFace.js", "Vite middleware /api/bake-face"],
            ["supabase/.../run_scores.sql", "Leaderboard table + anon RLS"],
        ],
        [55, 125],
    )

    pdf.h3("Important functions")
    pdf.table(
        ["Area", "Functions"],
        [
            ["Spawning", "handleZombieSpawns, spawnIntervalForElapsed, spawnZombie"],
            ["AI", "updateZombies, updateBoss, updateBroodmotherBoss"],
            [
                "Combat",
                "handleMovement, handleShooting, fireBullet, hurtPlayer, killPlayer",
            ],
            ["Abilities", "activateOverdrive, activateShield, collectAbility"],
            ["Economy", "spawnCoin, spawnCoinSplash, openShop, recalcWeaponStats"],
            ["Face", "generatePixelHead, buildSoldierAnim, createBakeFaceMiddleware"],
            ["Scores", "saveRunScore, fetchTopScores"],
        ],
        [35, 145],
    )
    pdf.body(
        "Hidden tester mode: click the title 5 times on the menu to unlock TEST: BOSS / "
        "BOSS 2 / GOD / LEVEL 2 (extra coins; ability drops more often)."
    )

    pdf.h2("6. Prompts used to build the game")
    pdf.body(
        "The game was built iteratively in Cursor from natural-language requests, plus "
        "image and music generation prompts for Sorceress / Gemini. API keys are omitted."
    )

    pdf.h3("Original concept (proposal)")
    pdf.italic_quote(
        '"classic arcade 2D zombie shooting game with customizable character to be the '
        "player. every now and then the zombie will drop abilities or item which can be "
        'used."',
        "From project proposal notes | Aug 7, 2026",
    )

    pdf.h3("Kickoff build prompt")
    pdf.italic_quote(
        '"i want to build a top down shooting game. you\'re a soldier that starts in the '
        "middle and can shoot bullets at zombie that come in from the sides. I want to use "
        "phaser for this as the tech. Let's start off with the basics and just implement "
        'the soldier, movement, and shooting"',
        "First implementation message | Aug 9, 2026",
    )

    pdf.h3("Feature prompts that shaped the game")
    pdf.table(
        ["Theme", "Your request (summary)"],
        [
            ["Face custom", "Pixelated face on soldier; camera snapshot + upload in menu"],
            ["Sprites", "Upload headless soldier body; left/right walk animation"],
            ["World", "Scrolling custom map; zombies from borders; scale difficulty"],
            ["Combat", "3 hearts; R to reload; 5s i-frames; muzzle spark"],
            ["Boss L1", "Stop spawns -> boss; charge attack; bone fan; warning + alarm"],
            [
                "Economy",
                "Coin drops; shop (P); arena clear -> +1 heart; boss 20-coin jackpot",
            ],
            [
                "Abilities",
                "~1/10 drop idea -> Overdrive + Shield (Shockwave removed)",
            ],
            [
                "Level 2",
                "New map/music; exploder, acid spitter, crawler; longer clear window",
            ],
            [
                "Boss L2",
                "Female broodmother: acid, spawn crawlers, burrow, throw exploder",
            ],
            [
                "Polish",
                "Title Undead Arcade; menu video; WASD-only; death save to Supabase",
            ],
        ],
        [35, 145],
    )

    pdf.h3("Asset generation prompts (examples)")
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 6, "Soldier body (Sorceress)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        4.2,
        clean(
            "Create a pixel-art character spritesheet for a top-down zombie shooter.\n"
            "Subject: Headless soldier body only; empty circular head socket.\n"
            "Layout: 2 rows x 4 columns - Row1 RIGHT walk, Row2 LEFT walk.\n"
            "Style: olive drab military, gun in shooting position, transparent PNG."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(2)

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 6, "Exploder enemy", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        4.2,
        clean(
            "Create a character spritesheet for a top-down zombie shooter exploding enemy.\n"
            "Subject: FAT bloated exploding zombie. Huge round belly; glowing orange-red cracks.\n"
            "Layout: 2x4 - walk RIGHT / walk LEFT. Transparent. Match existing zombie art."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(2)

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 6, "Acid spitter", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        4.2,
        clean(
            "Create a character spritesheet for a top-down zombie shooter acid spitter enemy.\n"
            "Subject: Thin hunched zombie; swollen throat sacs, acid-stained clothes.\n"
            "Layout: 2x4 left/right walk. Acid green accents. Transparent PNG."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(3)

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(
        0,
        5,
        clean(
            "Also generated with prompts: Boss1 / Boss2 sprites, crawler sheet, acid goo VFX, "
            "Level 1-2 maps, Level/Boss/Menu BGM, coin pickup SFX, Overdrive voice line, "
            "exploder timer beep, bosswarning alarm."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.h2("7. Quick reference")
    pdf.table(
        ["Metric", "Value"],
        [
            ["Level 1 clear / boss", "1:00 / 1:30"],
            ["Level 2 clear / boss", "2:00 / 2:30"],
            ["Ability drop rate", "5% (50% in tester mode)"],
            ["Boss coin jackpot", "20 coins"],
            ["Player HP / speed / fire / mag / reload", "3 / 155 / 420 ms / 8 / 1100 ms"],
            ["Boss1 / Boss2 HP", "70 / 95"],
        ],
        [70, 110],
    )

    pdf.ln(2)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.multi_cell(
        0,
        4.5,
        clean(
            "Stats sourced from GameScene.js and zombies.js. Report generated Aug 12, 2026. "
            "Project path: Desktop/Zombie Shooter."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.output(OUT)
    print(f"Wrote {OUT}")
    print(f"Size: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
