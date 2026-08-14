# Wardwake — Game Design Document (GDD)

> **Version**: 1.0.0  
> **Author & Creator**: Kazuo Coaguila  
> **Target Platforms**: Web (HTML5 / Desktop & Mobile Browsers), Steam / Itch.io (via Electron/Tauri)  
> **Genre**: Turn-Based Tactical Roguelike RPG  
> **Inspirations**: *Fire Emblem*, *Into the Breach*, *Mystery Dungeon*, *Slay the Spire*  

---

## 🎯 1. Executive Summary & High Concept

**Wardwake** is a retro-styled turn-based tactical roguelike RPG that distills tactical strategy into bite-sized, high-stakes dungeon encounters. Players control a squad of heroes navigating procedurally generated floors, utilizing weapon triangle mechanics, positional tactics, and resource management to descend deeper into an ancient subterranean labyrinth.

### Key Pillars:
1. **Crisp Tactical Clarity**: No hidden RNG hit chances or frustrating misses. Damage and advantage calculations are deterministic, transparent, and previewable before committing actions.
2. **Deterministic Weapon Triangle**: Rock-Paper-Scissors weapon affinities reward clever positional strategy and punishing mismatches.
3. **Paced Floor Progression**: High-tempo runs with quick turns, escalating enemy compositions, and satisfying staircase extraction objectives.

---

## 🕹️ 2. Core Game Loop

```
┌───────────────────────────────────────────────────────────────┐
│                      1. Floor Generation                      │
│            Rooms, Corridors, Enemy Spawns, Exit              │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                       2. Player Phase                         │
│       Select Unit ➔ View Valid Moves ➔ Move / Attack / Item   │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                       3. Enemy Phase                          │
│        Pathfinding AI ➔ Tactical Positioning ➔ Melee Attacks  │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                   4. Objective Resolution                     │
│    Wipe Out All Enemies OR Reach Golden Staircase Extraction   │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                   5. Descent to Next Floor                    │
│      Heal / Restock / Encounter Stronger Foes & Mini-Bosses   │
└───────────────────────────────────────────────────────────────┘
```

---

## ⚔️ 3. Combat & Tactical Mechanics

### 3.1 Weapon Triangle System
Every unit wields a primary weapon type:
- 🗡️ **Sword** beats 🪓 **Axe**
- 🪓 **Axe** beats 🛡️ **Lance**
- 🛡️ **Lance** beats 🗡️ **Sword**

```
           🗡️ SWORD
          ▲        \
         /          ▼
    🛡️ LANCE ◄─── 🪓 AXE
```

### 3.2 Combat Resolution Formula
- **Advantage Bonus**: `+3 Damage`
- **Disadvantage Penalty**: `-3 Damage`
- **Net Damage Dealt**:
  $$\text{Damage} = \max\left(1, (\text{Atk} + \text{AdvantageBonus} - \text{DisadvantagePenalty}) - \text{Def}\right)$$

### 3.3 Combat Forecast
When hovering over an enemy within melee range (Manhattan distance $= 1$), a dynamic forecast box renders:
- Attacker Name & Weapon Type
- Defender Name & Weapon Type
- Advantage / Disadvantage status
- Calculated Damage output
- Defender's current HP and projected HP after the strike

---

## 🏰 4. Dungeon & Floor Generation

1. **Grid Layout**: $10 \times 10$ tile map (320px $\times$ 320px).
2. **Rooms & Corridors**: Two large interconnected chambers split by stone walls and traversable choke points (corridors).
3. **Spawn Logic**:
   - Player Squad spawns in the Left Chamber (`(1, 1)` and `(1, 2)`).
   - Enemy Squad spawns in the Right Chamber (`(8, 7)` and `(8, 8)`).
   - Golden Staircase (`Floor Exit`) spawns at `(9, 9)`.
4. **Floor Victory Conditions**:
   - **Elimination**: Defeat all enemy units on the current floor.
   - **Extraction**: Move an active player unit onto the Golden Staircase tile.

---

## 🎨 5. Art, Visuals, and Audio Direction

### Visuals:
- **Style**: 16-bit anime pixel art avatar sprites on high-contrast slate dungeon tiles.
- **Color Palette**:
  - Blue (`#00e5ff` / `#3b82f6`): Player units and walkable grid overlays.
  - Red (`#ef4444`): Enemy units and attack warnings.
  - Gold (`#ffd700`): Staircase exit and active unit selection borders.
  - Dark Navy / Slate (`#0f131c` / `#1e293b`): Dungeon floor, walls, and UI backdrops.

### UI & HUD:
- **Top Status Bar**: Floor number, current phase indicator (`🔵 PLAYER` / `🔴 ENEMY`), and remaining enemy counter (`⚔️ Left: N`).
- **Unit Health Bars**: Dynamic, multi-colored health bars directly anchored above character heads (Green $\ge 50\%$, Yellow $\le 50\%$, Red $\le 25\%$).

---

## 🗺️ 6. Feature Roadmap & Expansion Backlog

| Phase | Milestone | Features |
| :--- | :--- | :--- |
| **Phase 1** | **Core MVP (Current)** | Clean Architecture, Weapon Triangle, Movement/Attack, Combat Forecast, Health Bars, Animations, Automated CI/CD & E2E Tests. |
| **Phase 2** | **Atmosphere & Polish** | Fog of War (line-of-sight lighting), 8-bit sound FX (sword clashes, footsteps, fanfare), background music tracks. |
| **Phase 3** | **RPG Progression** | Consumable item chest drops (Vulneraries, Potions), unit level-ups, stat growth, class promotion branches. |
| **Phase 4** | **Content Depth** | Ranged Bows & Magic Tomes, Floor Modifiers (traps, lava tiles), Mini-bosses and Boss encounters on Floor 5 and 10. |
| **Phase 5** | **Commercial Release** | Steam / Itch.io packaging (Electron/Tauri), Gamepad support, achievements, persistent run unlocks. |
