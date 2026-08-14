# AGENTS.md — AI Agent Operating Manual & Architecture Standards

> **Welcome, AI Coding Agent (Jules, Antigravity, Cursor, etc.)!**  
> This file contains the engineering constraints, architectural standards, and workflow rules for contributing to **Wardwake**. Read and adhere strictly to these rules before generating code.

---

## 🏛️ 1. Architecture: Clean Architecture & Separation of Concerns

Wardwake is strictly built using **Clean Architecture** principles. Every feature lives under `src/features/<feature_name>/` and is divided into four distinct layers:

```
src/features/<feature_name>/
├── domain/         # Pure TypeScript business rules, entities, and value objects. ZERO external dependencies.
├── application/    # Use cases, interactors, and orchestrators. Implements gameplay logic.
├── presentation/   # Phaser 3 GameObjects, Presenters, Containers, UI Views, and Tweens.
└── infrastructure/ # Concrete adapters (Audio, LocalStorage, Network, Hardware input).
```

### ⚠️ Golden Architectural Rules for Agents:
1. **Zero Framework Pollution in Domain & Application**:
   - Files in `domain/` and `application/` must **NEVER** import `phaser`, DOM elements (`window`, `document`), or presentation presenters.
   - All domain entities (`Unit`, `GridMap`, `TileCoordinate`, `CombatResolver`) must be 100% pure TypeScript and testable in NodeJS without Phaser.
2. **Encapsulate Visuals in Containers (`Phaser.GameObjects.Container`)**:
   - Any presentation entity with multiple visual parts (e.g. Sprite + Health Bar + Status Icons) **MUST** be grouped inside a single `Phaser.GameObjects.Container`.
   - Never run independent tweens or position updates on disconnected child GameObjects; move and scale the parent container to prevent visual desync.
3. **Camera Coordinates vs Screen Coordinates**:
   - In Phaser 3, always convert pointer screen coordinates to world coordinates via:
     ```ts
     const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
     const tileX = Math.floor(worldPoint.x / GridPresenter.TILE_SIZE);
     const tileY = Math.floor(worldPoint.y / GridPresenter.TILE_SIZE);
     ```
   - Top HUD overlays and UI boxes must use `.setScrollFactor(0)` to stay anchored to the viewport.

---

## ⚔️ 2. Core Game Rules & Formulas

### Weapon Triangle
| Attacker | Defender | Advantage State | Damage Modifier |
| :--- | :--- | :--- | :--- |
| **Sword** | Axe | Advantage | `+3 DMG` |
| **Axe** | Lance | Advantage | `+3 DMG` |
| **Lance** | Sword | Advantage | `+3 DMG` |
| **Axe** | Sword | Disadvantage | `-3 DMG` |
| **Lance** | Axe | Disadvantage | `-3 DMG` |
| **Sword** | Lance | Disadvantage | `-3 DMG` |

- Base Damage Formula: `Math.max(1, (attacker.attack + advantageBonus - disadvantagePenalty) - defender.defense)`
- Melee Range: Manhattan distance `Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1`.

### Grid System
- Default map: `10 x 10` tiles.
- Tile size: `32 x 32` pixels (`GridPresenter.TILE_SIZE = 32`).
- Canvas size: `320 x 360` pixels (`320 x 320` grid + `40px` top HUD offset with `cameras.main.scrollY = -40`).

---

## 🧪 3. Testing Requirements

### Unit Testing (Domain & Application)
- **Framework**: Jest with `ts-jest`.
- **Location**: `tests/` and `src/**/*.test.ts` (excluding `e2e/`).
- **Standard**: Any new use case, formula, or domain logic **MUST** have corresponding unit tests. Run `npm test`.

### End-to-End Testing (Presentation & Browser)
- **Framework**: Playwright (`@playwright/test`).
- **Location**: `e2e/game.spec.ts`.
- **Standard**: Any feature touching pointer input, scene transitions, combat animations, or HUD rendering must have E2E tests validating real canvas interaction. Run `npm run test:e2e`.

---

## 🌿 4. Git & Branching Strategy

- **Main Branch**: `main` (Protected, always deployable).
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
