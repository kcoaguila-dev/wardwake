# ⚔️ Wardwake

> A web-based **Tactical Roguelike** combining the strategic unit positioning of *Fire Emblem* with the procedural dungeon exploration of *Mystery Dungeon*.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3-orange.svg?style=flat-square&logo=phaser)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest-brightgreen.svg?style=flat-square&logo=jest)](https://jestjs.io/)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success.svg?style=flat-square&logo=github)](https://kcoaguila-dev.github.io/wardwake/)

---

## 🎮 Play the Game

### 🌐 [Click here to play the live demo on GitHub Pages!](https://kcoaguila-dev.github.io/wardwake/)

---

## 📖 About the Game

**Wardwake** is an MVP tactical turn-based roguelike built on Phaser 3 and TypeScript. Players command a squad of heroes crawling through dangerous, procedurally generated dungeon floors, engaging enemy forces with strategic positioning and weapon advantages.

### 🌟 Key Features

- **⚔️ Weapon Triangle System**: Classic tactical weapon interactions where weapon matchups dictate bonus damage:
  $$\text{Sword} \xrightarrow{\quad\text{beats}\quad} \text{Axe} \xrightarrow{\quad\text{beats}\quad} \text{Lance} \xrightarrow{\quad\text{beats}\quad} \text{Sword}$$
  - **Advantage**: $+3$ bonus damage
  - **Disadvantage**: $-3$ damage penalty
- **🗺️ Procedural Dungeon Generation (BSP)**: Rooms and corridors generated using Binary Space Partitioning to guarantee connected, navigable floors with no overlapping chambers.
- **🤖 Enemy AI Decision Engine**: Intelligent enemy units that evaluate Manhattan distance, execute BFS pathfinding, and execute coordinated melee attacks.
- **🎒 Consumable Inventory & Unit Stats**: Core unit stats (`HP`, `MaxHP`, `Attack`, `Defense`, `WeaponType`) and inventory system supporting health consumables and temporary stat buffs.
- **✨ Fluid Micro-Interactions**: Smooth 150ms interpolation tweens, floating dynamic combat damage numbers, and visual state tints.

---

## 🕹️ How to Play

### 🎮 Controls
- **Select Unit**: Click any of your **Blue** player units to highlight valid movement tiles (up to 3 tiles range).
- **Move**: Click on any highlighted blue tile to move the selected unit. Moving completes the unit's turn for that round.
- **Attack**: With a unit selected, click an **adjacent Red enemy unit** to strike. Floating damage numbers will indicate the combat outcome.
- **End Round**: Once all active player units have taken action, the **Enemy Phase** begins automatically.

### 🏆 Floor Progression
Advance to the next floor by either:
1. **Defeating all enemies on the current floor**, OR
2. **Stepping onto the Golden Staircase tile** located at the exit `(9, 9)`.

Clearing a floor restores squad HP and resets unit positioning for the next challenge.

---

## 🏛️ Architecture & Code Organization

Wardwake strictly adheres to **Feature-First Clean Architecture**, ensuring deterministic business logic completely decoupled from rendering engines:

```
src/
├── features/
│   ├── ai/               # AI decision making & turn execution
│   │   └── application/  # ExecuteEnemyTurnUseCase
│   ├── combat/           # Combat formulas & unit entities
│   │   ├── application/  # AttackUnitUseCase
│   │   ├── domain/       # Unit, WeaponType, CombatResolver
│   │   └── presentation/ # UnitPresenter (Phaser sprites & tweens)
│   ├── grid/             # Map, pathfinding & dungeon generator
│   │   ├── application/  # GenerateFloorUseCase, GetValidMovesUseCase
│   │   ├── domain/       # GridMap, TileCoordinate, Pathfinder, DungeonGenerator, BspNode
│   │   └── presentation/ # GridPresenter (Tile rendering & highlights)
│   ├── inventory/        # Items & consumable effects
│   │   ├── application/  # ConsumeItemUseCase
│   │   └── domain/       # Item, ItemType
│   ├── turn/             # Phase management state machine
│   │   ├── application/  # PhaseManagerUseCase
│   │   └── domain/       # TurnState
│   └── ui/               # HUD & input presenter
│       └── presentation/ # CombatTextPresenter, InputPresenter
├── scenes/               # Phaser Scenes (PreloaderScene, MainGameScene)
└── main.ts               # Game bootstrap & configuration
```

### Architectural Layer Rules:
- **`domain/`**: Pure TypeScript state, rules, and mathematical calculations. Zero dependencies on Phaser, DOM, or Canvas.
- **`application/`**: Use cases orchestrating domain rules and workflows.
- **`presentation/`**: Visual and audio representations (Phaser 3 scenes, tweens, particles, and input listeners).

---

## 🛠️ Development & Tooling

### Prerequisites
- Node.js (v20+)
- npm

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
| `npm test` | Runs all 35 Jest unit tests across all domain/application features |
| `npx tsc --noEmit` | Performs strict TypeScript type checks |
| `npm run build` | Compiles production assets into `dist/` |

---

## 🗺️ Roadmap & Planned Features

- [x] Weapon Triangle combat engine (Sword, Lance, Axe)
- [x] BSP procedural dungeon generator & BFS pathfinding
- [x] Enemy AI targeting & movement
- [x] Pixel-art sprite rendering & movement tweens
- [ ] Fog of War & line-of-sight dynamic visibility
- [ ] Equipment loot drops & chests
- [ ] Multiple character classes, ranged magic, and skill trees
- [ ] Sound effects & chiptune background music

---

## 📄 License & Intellectual Property

Copyright © 2026 **Kazuo Coaguila**. All rights reserved.

The source code, game design, character sprites, art assets, and documentation in this repository are proprietary. This repository is made publicly accessible strictly for portfolio, educational, and evaluation purposes. 

No permission is granted to copy, modify, distribute, sublicense, re-host, or commercially exploit any part of this game or its assets without prior express written permission from the author.