# ⚔️ Wardwake

> A web-based **Tactical Turn-Based Roguelike** combining the strategic unit positioning of *Fire Emblem* with the procedural dungeon exploration and organic party crawling of *Mystery Dungeon*.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3-orange.svg?style=flat-square&logo=phaser)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Jest](https://img.shields.io/badge/Unit%20Tests-84%20Passed-brightgreen.svg?style=flat-square&logo=jest)](https://jestjs.io/)
[![Playwright](https://img.shields.io/badge/E2E%20Tests-7%20Passed-brightgreen.svg?style=flat-square&logo=playwright)](https://playwright.dev/)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success.svg?style=flat-square&logo=github)](https://kcoaguila-dev.github.io/wardwake/)

---

## 🎮 Play the Game

### 🌐 [Click here to play the live game on GitHub Pages!](https://kcoaguila-dev.github.io/wardwake/)

---

## 📖 About the Game

**Wardwake** is a tactical turn-based roguelike built on Phaser 3 and TypeScript. Players command a squad of heroes exploring procedural 18x18 Chunsoft macro-grid dungeons, managing fog-of-war line-of-sight, picking up consumable loot, and engaging tiered enemy forces with strategic weapon triangle advantages.

### 🌟 Key Features

- **🏛️ 100% Data-Driven Architecture (`GameDatabase` & JSON)**:
  - All heroes, monsters, items, floor tiers, and combat rules live in pure data files under `src/data/`.
  - Zero hardcoded entity constants; balance changes and new content are added instantly via JSON!
- **⚔️ Tactical Weapon Triangle**:
  $$\text{Sword} \xrightarrow{\quad\text{beats}\quad} \text{Axe} \xrightarrow{\quad\text{beats}\quad} \text{Lance} \xrightarrow{\quad\text{beats}\quad} \text{Sword}$$
  - **Advantage**: $+3$ bonus damage & golden battle effects.
  - **Disadvantage**: $-3$ damage penalty.
- **🌫️ Fog of War & Room Discovery**:
  - 1-tile corridor vision with full-room illumination upon stepping through doorways.
  - Minimap radar dynamically updates with discovered rooms and currently visible enemies.
- **🎒 Floor Loot & Tactical Action Menu**:
  - Collect restorative Vulneraries and Strength Elixirs from the floor.
  - Modal action menu popup upon moving: `[⚔️ ATTACK]`, `[🎒 ITEM]`, `[⏳ WAIT]`.
- **📈 RPG EXP & Level-Up System**:
  - Gain $+20$ EXP on hit and $+50$ EXP on kill. Level up at 100 EXP with stat growth rolls (`HP`, `ATK`, `DEF`) and golden floating banners.
- **🔊 Web Audio API Procedural Synthesizer**:
  - Zero-asset 8-bit sound effects (sword slashes, axe crunches, step clicks, potion chimes, level-up fanfares) with in-game mute toggle (`🔊 / 🔇`).
- **📱 Responsive FIT & Mobile Touch Scaling**:
  - Pixel-perfect Phaser `Scale.FIT` auto-centering with touch gesture optimization for mobile browsers and Itch.io.

---

## 🕹️ Controls

| Control | Action |
| :--- | :--- |
| **Mouse / Touch Click** | Select unit, move, or target enemy |
| **Tab** | Cycle between available hero squad members |
| **M** | Toggle tactical minimap overlay |
| **[⏳ END] Button** | End current player phase immediately |
| **[🔊 / 🔇] Button** | Toggle procedural sound effects on/off |

---

## 🏛️ Architecture & Code Organization

Wardwake strictly adheres to **Clean Architecture** paired with **Data-Driven Design**:

```
src/
├── core/
│   └── domain/         # Generic DataRegistry<T> & Centralized GameDatabase
├── data/               # Pure JSON Content Blueprints (Zero hardcoded constants)
│   ├── monsters.json   # Enemy stats, weapon types, exp yields, and AI profiles
│   ├── items.json      # Consumables, stat herbs, healing values, and drop weights
│   ├── heroes.json     # Player character classes, starting stats, and loadouts
│   ├── floors.json     # Dungeon floor tiers, spawn counts, and scaling curves
│   └── combat_rules.json # Weapon triangle bonuses, EXP formulas, and damage constants
├── features/
│   ├── ai/             # Follow formation calculator & enemy turn execution
│   ├── combat/         # Units, weapon types, combat resolver, & enemy factory
│   ├── fog/            # Line-of-sight visibility map & fog of war presenter
│   ├── grid/           # 18x18 Macro-Cell dungeon generator & pathfinding
│   ├── inventory/      # Consumables, pickup use cases, & bag presenter
│   ├── turn/           # Phase management state machine
│   └── ui/             # Action menu, minimap, top HUD, & combat forecast
├── scenes/             # Phaser Scenes (PreloaderScene, MainGameScene)
└── main.ts             # Game bootstrap & scale configuration
```

---

## 🛠️ Development & Tooling

### Installation
```bash
git clone https://github.com/kcoaguila-dev/wardwake.git
cd wardwake
npm install
```

### Commands
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:5173/` |
| `npm test` | Runs all 84 Jest unit tests across 16 test suites |
| `npm run test:e2e` | Runs all 7 Playwright browser end-to-end tests |
| `npx tsc --noEmit` | Strict TypeScript type check (0 errors) |
| `npm run build` | Compiles production bundle into `dist/` |

---

## 📄 License & Intellectual Property

Copyright © 2026 **Kazuo Coaguila**. All rights reserved.
Proprietary source code and design.