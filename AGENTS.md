# AGENTS.md — AI Agent Operating Manual & Architecture Standards

> **Welcome, AI Coding Agent (Jules, Antigravity, Cursor, etc.)!**  
> This file contains the engineering constraints, architectural standards, and workflow rules for contributing to **Wardwake**. Read and adhere strictly to these rules before generating code.

---

## 🏛️ 1. Architecture: Clean Architecture & Data-Driven Design

Wardwake is strictly built using **Clean Architecture** paired with **Data-Driven Design**.

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
└── features/<feature_name>/
    ├── domain/         # Pure TypeScript business rules, entities, and value objects. ZERO external dependencies.
    ├── application/    # Use cases, interactors, and orchestrators. Implements gameplay logic.
    ├── presentation/   # Phaser 3 GameObjects, Presenters, Containers, UI Views, and Tweens.
    └── infrastructure/ # Concrete adapters (Audio, LocalStorage, Network, Hardware input).
```

### ⚠️ Golden Architectural Rules for Agents:

1. **Zero Hardcoded Content (Data-Driven Architecture)**:
   - **NEVER** hardcode monsters, items, heroes, or combat numbers directly in TypeScript code.
   - All content MUST be defined in `src/data/*.json` and queried through `GameDatabase` or `DataRegistry<T>`.
   - To add new monsters, items, or classes, add JSON entries into `src/data/` without modifying engine logic.

2. **Zero Framework Pollution in Domain & Application**:
   - Files in `domain/` and `application/` must **NEVER** import `phaser`, DOM elements (`window`, `document`), or presentation presenters.
   - All domain entities (`Unit`, `GridMap`, `TileCoordinate`, `CombatResolver`, `GameDatabase`) must be 100% pure TypeScript and testable in NodeJS without Phaser.

3. **Encapsulate Visuals in Containers (`Phaser.GameObjects.Container`)**:
   - Any presentation entity with multiple visual parts (e.g. Sprite + Base Ring + Health Bar + Status Icons) **MUST** be grouped inside a single `Phaser.GameObjects.Container`.
   - Never run independent tweens or position updates on disconnected child GameObjects; move and scale the parent container to prevent visual desync.

4. **Camera Coordinates vs Screen Coordinates**:
   - In Phaser 3, always convert pointer screen coordinates to world coordinates via:
     ```ts
     const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
     const tileX = Math.floor(worldPoint.x / GridPresenter.TILE_SIZE);
     const tileY = Math.floor(worldPoint.y / GridPresenter.TILE_SIZE);
     ```
   - Top HUD overlays, Action Menus, and Minimap must use `.setScrollFactor(0)` to stay anchored to the viewport.

---

## ⚔️ 2. Core Game Rules & Formulas

### Weapon Triangle
| Attacker | Defender | Advantage State | Damage Modifier |
| :--- | :--- | :--- | :--- |
| **Sword** | Axe | Advantage | `+3 DMG` (from `combat_rules.json`) |
| **Axe** | Lance | Advantage | `+3 DMG` (from `combat_rules.json`) |
| **Lance** | Sword | Advantage | `+3 DMG` (from `combat_rules.json`) |
| **Axe** | Sword | Disadvantage | `-3 DMG` (from `combat_rules.json`) |
| **Lance** | Axe | Disadvantage | `-3 DMG` (from `combat_rules.json`) |
| **Sword** | Lance | Disadvantage | `-3 DMG` (from `combat_rules.json`) |

- **Base Damage Formula**: `Math.max(minDamage, (attacker.attack + advantageBonus - disadvantagePenalty) - defender.defense)`
- **Melee Range**: Manhattan distance `Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1`.
- **EXP Curve**: +20 EXP on hit, +50 EXP on kill, 100 EXP = Level Up with stat growth rolls (`HP`, `ATK`, `DEF`).

### Grid & Map System
- Map size: `18 x 18` Chunsoft macro-cell grid partition with 1-tile wide corridors.
- Tile size: `32 x 32` pixels (`GridPresenter.TILE_SIZE = 32`).
- Canvas size: `320 x 360` pixels with Phaser `Scale.FIT` and auto-centering for desktop and mobile browsers.

---

## 🧪 3. Testing Requirements

### Unit Testing (Domain & Application)
- **Framework**: Jest with `ts-jest`.
- **Location**: `tests/` and `src/**/*.test.ts` (excluding `e2e/`).
- **Standard**: Any new use case, repository, formula, or domain logic **MUST** have corresponding unit tests. Run `npm test`.

### End-to-End Testing (Presentation & Browser)
- **Framework**: Playwright (`@playwright/test`).
- **Location**: `e2e/game.spec.ts`.
- **Standard**: Any feature touching pointer input, scene transitions, combat animations, action menus, or HUD rendering must have E2E tests validating real canvas interaction. Run `npm run test:e2e`.

---

## 🌿 4. Git & Branching Strategy

- **Main Branch**: `main` (Protected, always deployable, auto-deploys to GitHub Pages).
- **Integration Branch**: `develop` (Shared integration branch for parallel AI agents).
- **Feature Branches**: `feature/<feature-name>-<random-id>` or `fix/<bug-name>`.
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(scope): add feature description`
  - `fix(scope): fix bug description`
  - `test(scope): add automated tests`
  - `refactor(scope): refactor code without changing behavior`
  - `docs(scope): update documentation`

---

## 🚀 5. Verification Checklist Before Submitting PRs
1. [ ] `npx tsc --noEmit` exits with `0` errors.
2. [ ] `npm test` passes all unit test suites.
3. [ ] `npm run test:e2e` passes all browser interaction tests.
4. [ ] `npm run build` generates production bundle in `dist/`.
5. [ ] No orphaned remote branches or temporary debug files left behind.
