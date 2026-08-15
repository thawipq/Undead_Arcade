# Undead Arcade

A 2D top-down zombie survival shooter built with Phaser 3 and Vite.

This project was created as a **class project at Sasin School of Management**.

**Copyright © 2026 Thawip Qian.** All rights reserved.

---

## Play

```bash
npm install
npm run dev
```

Open **http://localhost:5180/**

Optional: copy `.env.example` to `.env` and add keys for face baking (Gemini) and online high scores (Supabase).

```bash
cp .env.example .env
```

Then restart the dev server.

## Controls

| Action | Input |
|--------|--------|
| Move | WASD |
| Shoot | Click |
| Reload | R |
| Shop | P |
| Pause | Esc |

## Features

- Two arena levels with unique maps, enemy mixes, and bosses
- Custom player: male/female body plus webcam or uploaded face (Gemini head bake)
- Coins, shop upgrades, overdrive and shield abilities
- 4 hearts; death overlay to save survival time and progress
- Beating **Boss 2** ends the run with a **YOU WIN** save screen
- High scores stored in Supabase (`run_scores`)

## Tech

- Phaser 3
- Vite
- Supabase (leaderboard)
- Gemini API (optional face cutout)

## License / copyright

Copyright © 2026 Thawip Qian. Created for a class project at Sasin School of Management.
