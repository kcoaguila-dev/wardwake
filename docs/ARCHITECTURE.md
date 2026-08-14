# Wardwake — Technical Architecture & Engineering Standards

> **Architecture Style**: Clean Architecture + Data-Driven Design (DDD)  
> **Engine**: Phaser 3 (HTML5 / WebGL)  
> **Build Tool**: Vite (Rolldown bundler)  
> **Language**: TypeScript 5.x (Strict Mode)  
> **Testing**: Jest (Unit / Application) & Playwright (End-to-End Browser)  

---

## 🏛️ 1. Clean Architecture & Data-Driven Layers

The codebase is structured into four concentric layers, augmented by a centralized generic **Data Registry & Game Database**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                PRESENTATION LAYER (Phaser 3)                │
 │  Scenes, Containers, Presenters, Viewport, WebAudio Synth   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ depends on
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  APPLICATION LAYER (Use Cases)              │
 │   AttackUnitUseCase, GainExpUseCase, GenerateFloorUseCase   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ depends on
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     DOMAIN LAYER (Core)                     │
 │   Unit, CombatResolver, Pathfinder, VisibilityMap, GameDB   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ reads from
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │               DATA BLUEPRINTS (Pure JSON)                   │
 │   monsters.json, items.json, heroes.json, combat_rules.json │
 └─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities:

#### 1. Data Blueprints (`src/data/*.json`)
- Externalized content schemas containing all gameplay definitions:
  - `monsters.json`: Enemy templates across Tiers 1-3 with stats, AI profiles, and weapon types.
  - `items.json`: Consumables with heal values, buff magnitudes, and weighted drop rates.
  - `heroes.json`: Player class archetypes, base stats, and starting inventories.
  - `floors.json`: Difficulty scaling parameters and spawn ranges.
  - `combat_rules.json`: Mathematical constants for weapon triangle and EXP progression.

#### 2. Core & Domain Layer (`src/core/domain/` & `src/features/*/domain/`)
- Contains enterprise business rules, mathematical algorithms, and generic registries:
  - `DataRegistry<T>`: Generic type-safe registry supporting `get()`, `getOrThrow()`, and predicate `query()`.
  - `GameDatabase`: Centralized registry instance providing strongly typed access to all data blueprints.
  - `Unit.ts`: Core unit entity.
  - `CombatResolver.ts`: Mathematical weapon triangle calculator reading from `GameDatabase.combatRules`.
  - `VisibilityMap.ts` & `FogOfWar.ts`: Line-of-sight and room discovery logic.
  - `Pathfinder.ts`: BFS grid pathfinder.

#### 3. Application Layer (`src/features/*/application/`)
- Orchestrates domain interactions into cohesive game use cases:
  - `AttackUnitUseCase.ts`: Handles attack resolution, audio triggering, and fatal status.
  - `GainExpUseCase.ts` & `LevelUpUseCase.ts`: Experience accumulation and RPG stat growth rolls.
  - `GenerateFloorUseCase.ts`: Procedural macro-cell generation with item and enemy distribution.
  - `ExecuteEnemyTurnUseCase.ts`: AI target selection, tactical movement, and attack intent.
  - `PhaseManagerUseCase.ts`: State machine transitions between `PLAYER_PHASE` and `ENEMY_PHASE`.

#### 4. Presentation Layer (`src/features/*/presentation/` & `src/scenes/`)
- Visual and audio representations built with Phaser 3:
  - `MainGameScene.ts`: Unified scene managing camera panning, fog, action menus, and turn loops.
  - `UnitPresenter.ts`: Encapsulates unit visual avatar, base rings, health bars, and animations.
  - `FogPresenter.ts`: Pitch-black undiscovered tiles and 50% opacity discovered fog overlay.
  - `ActionMenuPresenter.ts` & `InventoryMenuPresenter.ts`: Tactical HUD modal popups.
  - `MinimapPresenter.ts`: Real-time tactical radar overlay.

#### 5. Infrastructure Layer (`src/features/*/infrastructure/`)
- `WebAudioSynthService.ts`: Pure Web Audio API oscillator synthesis generating 8-bit sound effects.

---

## 🔄 2. Communication & Event Pipeline

```
User Click / Touch
       │
       ▼
InputPresenter (Converts screen coordinates via cameras.main.getWorldPoint)
       │
       ▼ emits
'ON_TILE_CLICKED' / 'ON_TILE_HOVER'
       │
       ▼ receives
MainGameScene
       │
       ├──► GetValidMovesUseCase.execute()
       ├──► ActionMenuPresenter.show()
       ├──► AttackUnitUseCase.execute()
       ├──► GainExpUseCase.execute()
       └──► UnitPresenter.moveTo() / animateAttack()
```

---

## 🧪 3. Quality Assurance & Testing Pipeline

```
Code Change
    │
    ├──► 1. Strict Type Check (`npx tsc --noEmit` -> 0 errors)
    │
    ├──► 2. Domain Unit Tests (`npm test` via Jest -> 84 tests)
    │        - GameDatabase & DataRegistry querying
    │        - Unit stat modifications & EXP leveling
    │        - CombatResolver weapon triangle formulas
    │        - FogOfWar line-of-sight & room illumination
    │        - Pathfinder BFS route calculations
    │        - Procedural dungeon generator validity
    │
    ├──► 3. End-to-End Tests (`npm run test:e2e` via Playwright -> 7 tests)
    │        - Canvas rendering with Phaser Scale.FIT
    │        - Unit selection, movement, & companion follow
    │        - Action menu execution & item healing
    │        - Fog discovery & minimap integrity
    │
    └──► 4. Production Build (`npm run build` via Vite)
```
