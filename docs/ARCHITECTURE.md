# Wardwake — Technical Architecture & Engineering Standards

> **Architecture Style**: Clean Architecture / Domain-Driven Design (DDD)  
> **Engine**: Phaser 3 (HTML5 / WebGL)  
> **Build Tool**: Vite (Rolldown bundler)  
> **Language**: TypeScript 5.x (Strict Mode)  
> **Testing**: Jest (Unit / Application) & Playwright (End-to-End Browser)  

---

## 🏛️ 1. Clean Architecture Layers

The codebase is strictly structured into four concentric layers. Dependencies point **inwards only**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                PRESENTATION LAYER (Phaser 3)                │
 │    Scenes, Containers, Presenters, Viewport, Audio Player    │
 └──────────────────────────────┬──────────────────────────────┘
                                │ depends on
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  APPLICATION LAYER (Use Cases)              │
 │   AttackUnitUseCase, ExecuteEnemyTurnUseCase, PhaseManager  │
 └──────────────────────────────┬──────────────────────────────┘
                                │ depends on
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     DOMAIN LAYER (Core)                     │
 │      Unit, WeaponType, TileCoordinate, CombatResolver       │
 └─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities:

#### 1. Domain Layer (`src/features/*/domain/`)
- Contains enterprise business rules, entities, and calculation algorithms.
- **Rule**: Pure TypeScript. No imports from `phaser`, DOM (`window`, `document`), or outer layers.
- Key modules:
  - `Unit.ts`: Core unit entity (HP, Atk, Def, WeaponType).
  - `WeaponType.ts`: Enum for Sword, Axe, Lance.
  - `CombatResolver.ts`: Pure mathematical weapon triangle calculator.
  - `TileCoordinate.ts`: Immutable 2D grid coordinates with equality check.
  - `GridMap.ts`: Pure spatial grid model.
  - `Pathfinder.ts`: BFS grid pathfinder.

#### 2. Application Layer (`src/features/*/application/`)
- Encapsulates specific game use cases and orchestrates domain interactions.
- Key modules:
  - `AttackUnitUseCase.ts`: Handles attack resolution, audio triggering, and fatal status.
  - `ExecuteEnemyTurnUseCase.ts`: Computes enemy AI target selection, pathfinding, and attack intent.
  - `PhaseManagerUseCase.ts`: Manages state machine transitions between `PLAYER_PHASE` and `ENEMY_PHASE`.
  - `GetValidMovesUseCase.ts`: Calculates reachable movement tiles using flood fill / path limits.

#### 3. Presentation Layer (`src/features/*/presentation/` & `src/scenes/`)
- Renders visuals using Phaser 3 GameObjects and translates user input into game events.
- Key modules:
  - `MainGameScene.ts`: Main gameplay scene orchestrating sub-presenters.
  - `UnitPresenter.ts`: Encapsulates unit visual avatar (Sprite + Health Bar) in a `Phaser.GameObjects.Container`.
  - `GridPresenter.ts`: Renders tile floor, walls, highlights, and selection indicators.
  - `HudPresenter.ts`: Top status bar (Floor, Phase, Enemy Count).
  - `CombatForecastPresenter.ts`: Hover tooltip showing combat outcomes.
  - `InputPresenter.ts`: Transforms raw browser mouse events into world-space `ON_TILE_CLICKED` and `ON_TILE_HOVER` events.

#### 4. Infrastructure Layer (`src/features/*/infrastructure/`)
- Handles audio playback, persistence (LocalStorage / Cloud Save), and external device APIs.

---

## 🔄 2. Communication & Event Pipeline

Presentation components communicate via decoupled Phaser Scene Events:

```
User Click / Hover
       │
       ▼
InputPresenter (Converts screen coords to TileCoordinate via cameras.main.getWorldPoint)
       │
       ▼ emits
'ON_TILE_CLICKED' / 'ON_TILE_HOVER'
       │
       ▼ receives
MainGameScene
       │
       ├──► GetValidMovesUseCase.execute()
       ├──► CombatForecastPresenter.show()
       ├──► AttackUnitUseCase.execute()
       └──► UnitPresenter.moveTo() / animateAttack()
```

---

## 🧪 3. Quality Assurance & Testing Pipeline

```
Code Change
    │
    ├──► 1. Type Check (`npx tsc --noEmit`)
    │
    ├──► 2. Domain Unit Tests (`npm test` via Jest)
    │        - Unit stat modifications
    │        - CombatResolver damage & advantage formulas
    │        - Pathfinder BFS route calculations
    │        - Dungeon generation validity
    │
    ├──► 3. End-to-End Tests (`npm run test:e2e` via Playwright)
    │        - Headless Chromium canvas rendering
    │        - Pointer click & unit selection
    │        - Movement tween validation
    │        - Combat preview & melee attacks
    │
    └──► 4. Production Build (`npm run build` via Vite)
```
