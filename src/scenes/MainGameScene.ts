import * as Phaser from 'phaser';

import { GridMap } from '../features/grid/domain/GridMap';
import { Pathfinder } from '../features/grid/domain/Pathfinder';
import { TileCoordinate } from '../features/grid/domain/TileCoordinate';
import { GridPresenter } from '../features/grid/presentation/GridPresenter';
import { InputPresenter } from '../features/ui/presentation/InputPresenter';
import { CombatTextPresenter } from '../features/ui/presentation/CombatTextPresenter';
import { CombatForecastPresenter } from '../features/ui/presentation/CombatForecastPresenter';
import { MinimapPresenter } from '../features/ui/presentation/MinimapPresenter';
import { ActionMenuPresenter } from '../features/ui/presentation/ActionMenuPresenter';
import { InventoryMenuPresenter } from '../features/ui/presentation/InventoryMenuPresenter';
import { PartyHudPresenter } from '../features/ui/presentation/PartyHudPresenter';
import { StairsModalPresenter } from '../features/ui/presentation/StairsModalPresenter';
import { PhaseManagerUseCase } from '../features/turn/application/PhaseManagerUseCase';
import { GetValidMovesUseCase } from '../features/grid/application/GetValidMovesUseCase';
import { AttackUnitUseCase } from '../features/combat/application/AttackUnitUseCase';
import { GainExpUseCase } from '../features/combat/application/GainExpUseCase';
import { LevelUpUseCase } from '../features/combat/application/LevelUpUseCase';
import { ConsumeItemUseCase } from '../features/inventory/application/ConsumeItemUseCase';
import { PickupItemUseCase } from '../features/inventory/application/PickupItemUseCase';
import { ExecuteEnemyTurnUseCase } from '../features/ai/application/ExecuteEnemyTurnUseCase';
import { FollowFormationCalculator } from '../features/ai/domain/FollowFormationCalculator';
import { GenerateFloorUseCase } from '../features/grid/application/GenerateFloorUseCase';
import { FogOfWar } from '../features/fog/domain/FogOfWar';
import { VisibilityMap } from '../features/fog/domain/VisibilityMap';
import { FogPresenter } from '../features/fog/presentation/FogPresenter';
import { Unit } from '../features/combat/domain/Unit';
import { EnemyFactory } from '../features/combat/domain/EnemyFactory';
import { Item, ItemType } from '../features/inventory/domain/Item';
import { TurnState } from '../features/turn/domain/TurnState';
import { UnitPresenter } from '../features/combat/presentation/UnitPresenter';
import { HudPresenter } from '../features/ui/presentation/HudPresenter';
import { WebAudioSynthService } from '../features/combat/infrastructure/WebAudioSynthService';
import { GameDatabase } from '../core/domain/GameDatabase';

export class MainGameScene extends Phaser.Scene {
  // Map Dimensions (18x18 for 3x3 Chunsoft Macro-Grid)
  public static readonly MAP_WIDTH = 18;
  public static readonly MAP_HEIGHT = 18;

  // Use Cases & Helpers
  private phaseManager!: PhaseManagerUseCase;
  private getValidMovesUseCase!: GetValidMovesUseCase;
  private attackUnitUseCase!: AttackUnitUseCase;
  private gainExpUseCase!: GainExpUseCase;
  private consumeItemUseCase!: ConsumeItemUseCase;
  private pickupItemUseCase!: PickupItemUseCase;
  private executeEnemyTurnUseCase!: ExecuteEnemyTurnUseCase;
  private generateFloorUseCase!: GenerateFloorUseCase;
  private followFormationCalculator!: FollowFormationCalculator;

  // Presenters
  private gridPresenter!: GridPresenter;
  private inputPresenter!: InputPresenter;
  private combatTextPresenter!: CombatTextPresenter;
  private hudPresenter!: HudPresenter;
  private partyHudPresenter!: PartyHudPresenter;
  private combatForecastPresenter!: CombatForecastPresenter;
  private minimapPresenter!: MinimapPresenter;
  private actionMenuPresenter!: ActionMenuPresenter;
  private inventoryMenuPresenter!: InventoryMenuPresenter;
  private stairsModalPresenter!: StairsModalPresenter;
  private fogPresenter!: FogPresenter;

  // Audio
  private audioService!: WebAudioSynthService;

  // Domain
  private gridMap!: GridMap;
  private pathfinder!: Pathfinder;
  private visibilityMap!: VisibilityMap;
  private fogOfWar!: FogOfWar;

  // State
  private playerSquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private enemySquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private floorItems: { coord: TileCoordinate; item: Item; sprite: Phaser.GameObjects.Sprite }[] = [];
  private turnStartCoords: Map<string, TileCoordinate> = new Map();
  private floorCount: number = 1;
  private staircaseCoord!: TileCoordinate;
  private selectedPlayerIndex: number | null = null;
  private isProcessingAction: boolean = false;
  private isMenuOpen: boolean = false;
  private isTargeting: boolean = false;
  private isEncounterActive: boolean = false;
  private stepCount: number = 0;

  constructor() {
    super('MainGameScene');
  }

  create() {
    this.audioService = new WebAudioSynthService();

    this.pathfinder = new Pathfinder();
    this.phaseManager = new PhaseManagerUseCase();
    this.attackUnitUseCase = new AttackUnitUseCase(this.audioService);
    this.gainExpUseCase = new GainExpUseCase(new LevelUpUseCase());
    this.consumeItemUseCase = new ConsumeItemUseCase();
    this.pickupItemUseCase = new PickupItemUseCase();
    this.generateFloorUseCase = new GenerateFloorUseCase(MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);
    this.followFormationCalculator = new FollowFormationCalculator();

    // Presenters
    this.gridPresenter = new GridPresenter(this);
    this.inputPresenter = new InputPresenter(this, MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);
    this.combatTextPresenter = new CombatTextPresenter(this);
    this.hudPresenter = new HudPresenter(this);
    this.hudPresenter.setOnMuteToggle(() => this.audioService.toggleMute());
    this.partyHudPresenter = new PartyHudPresenter(this);
    this.partyHudPresenter.onSelectHero = (idx) => this.selectHeroByIndex(idx);

    this.combatForecastPresenter = new CombatForecastPresenter(this);
    this.minimapPresenter = new MinimapPresenter(this);
    this.actionMenuPresenter = new ActionMenuPresenter(this);
    this.actionMenuPresenter.onCancel = () => this.cancelActionMenu();

    this.inventoryMenuPresenter = new InventoryMenuPresenter(this);
    this.stairsModalPresenter = new StairsModalPresenter(this);
    this.stairsModalPresenter.onDescend = () => {
      this.stairsModalPresenter.hide();
      this.isMenuOpen = false;
      this.audioService.playSound('staircase_descend');
      this.startFloor(this.floorCount + 1);
    };
    this.stairsModalPresenter.onStay = () => {
      this.stairsModalPresenter.hide();
      this.isMenuOpen = false;
    };

    this.fogPresenter = new FogPresenter(this);

    // Set Camera Bounds for Expanded 18x18 Map
    this.cameras.main.setBounds(
      0,
      -40,
      MainGameScene.MAP_WIDTH * GridPresenter.TILE_SIZE,
      MainGameScene.MAP_HEIGHT * GridPresenter.TILE_SIZE + 40
    );

    // Load Initial Procedural Floor
    this.startFloor(1);

    // Setup Input Listeners
    this.events.on('ON_TILE_CLICKED', this.onTileClicked, this);
    this.events.on('ON_TILE_HOVER', this.onTileHover, this);
    this.events.on('ON_END_TURN_CLICKED', this.onEndTurnClicked, this);

    // Tab key to cycle / switch active heroes
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.cycleNextHero();
    });

    // 'I' key for opening Inventory directly
    this.input.keyboard?.on('keydown-I', () => {
      if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) return;
      const activeHero = this.getActiveHero();
      if (activeHero) {
        this.showInventoryMenu(activeHero);
      }
    });

    // ESC key to dismiss menus immediately
    this.input.keyboard?.on('keydown-ESCAPE', () => {
      if (this.stairsModalPresenter.isVisible()) {
        this.stairsModalPresenter.onStay?.();
      } else {
        this.cancelActionMenu();
      }
    });

    // Unified Keyboard Listener with Native Shift Capture
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) return;

      const isShift = event.shiftKey;
      const key = event.key.toLowerCase();
      const code = event.code;

      // Handle Stairs Modal confirmation with Enter / Y / N
      if (this.stairsModalPresenter.isVisible()) {
        if (key === 'enter' || key === 'y') {
          this.stairsModalPresenter.onDescend?.();
          return;
        } else if (key === 'escape' || key === 'n') {
          this.stairsModalPresenter.onStay?.();
          return;
        }
      }

      if (this.isMenuOpen && (key === 'w' || key === 'a' || key === 's' || key === 'd' || code.startsWith('Arrow'))) {
        this.cancelActionMenu();
      }

      if (key === 'w' || code === 'ArrowUp') {
        this.handleKeyboardStep(0, -1, isShift);
      } else if (key === 's' || code === 'ArrowDown') {
        this.handleKeyboardStep(0, 1, isShift);
      } else if (key === 'a' || code === 'ArrowLeft') {
        this.handleKeyboardStep(-1, 0, isShift);
      } else if (key === 'd' || code === 'ArrowRight') {
        this.handleKeyboardStep(1, 0, isShift);
      } else if (code === 'Space') {
        if (this.isMenuOpen) {
          this.actionMenuPresenter.onWait?.();
        } else {
          const activeHero = this.getActiveHero();
          if (activeHero) {
            this.finalizePlayerTurn(activeHero);
          }
        }
      }
    });
  }

  private async cancelActionMenu(): Promise<void> {
    this.actionMenuPresenter.hide();
    this.inventoryMenuPresenter.hide();
    this.stairsModalPresenter.hide();
    this.combatForecastPresenter.hide();
    this.isMenuOpen = false;
    this.isTargeting = false;

    if (this.isEncounterActive && this.selectedPlayerIndex !== null) {
      const activeHero = this.playerSquad[this.selectedPlayerIndex];
      if (activeHero && this.turnStartCoords.has(activeHero.unit.id)) {
        const startCoord = this.turnStartCoords.get(activeHero.unit.id)!;
        if (!activeHero.coord.equals(startCoord)) {
          activeHero.coord = new TileCoordinate(startCoord.x, startCoord.y);
          await activeHero.graphic.moveTo(activeHero.coord);
          this.updateFogAndVisibility();
          this.selectHeroByIndex(this.selectedPlayerIndex);
        }
      }
    }
  }

  private getActiveHero() {
    if (this.selectedPlayerIndex !== null && this.playerSquad[this.selectedPlayerIndex]) {
      return this.playerSquad[this.selectedPlayerIndex];
    }
    return this.playerSquad.find(p => p.unit.currentHp > 0 && !p.hasActed);
  }

  private async handleKeyboardStep(dx: number, dy: number, isShift: boolean = false): Promise<void> {
    if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    if (this.selectedPlayerIndex === null) {
      const firstAvailableIdx = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && !p.hasActed);
      if (firstAvailableIdx === -1) return;
      this.selectedPlayerIndex = firstAvailableIdx;
    }

    const player = this.playerSquad[this.selectedPlayerIndex];
    if (!player || player.hasActed || player.unit.currentHp <= 0) return;

    const targetCoord = new TileCoordinate(player.coord.x + dx, player.coord.y + dy);

    if (!this.gridMap.isWalkable(targetCoord)) {
      return;
    }

    // 1. Check for Friendly Position Swap (works even with Shift held!)
    const allyAtTarget = this.playerSquad.find(p => p.unit.id !== player.unit.id && p.unit.currentHp > 0 && p.coord.equals(targetCoord));
    if (allyAtTarget) {
      await this.swapPlayerPositions(player, allyAtTarget);
      return;
    }

    // 2. Check for Enemy Melee Bump
    const enemyAtTarget = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(targetCoord) && this.visibilityMap.isVisible(targetCoord));
    if (enemyAtTarget) {
      await this.executePlayerAttack(player, enemyAtTarget);
      return;
    }

    // 3. Check if player is holding Shift for Corridor Sprint
    if (isShift && !this.isEncounterActive) {
      await this.handleCorridorSprint(player, dx, dy);
      return;
    }

    // 4. Move to free tile
    await this.movePlayerUnit(player, targetCoord);
  }

  private async handleCorridorSprint(player: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }, dx: number, dy: number): Promise<void> {
    const maxSprintSteps = 10;
    for (let step = 0; step < maxSprintSteps; step++) {
      const nextCoord = new TileCoordinate(player.coord.x + dx, player.coord.y + dy);

      if (!this.gridMap.isWalkable(nextCoord)) break;

      // Stop if ally or enemy at next tile
      const hasAlly = this.playerSquad.some(p => p.unit.id !== player.unit.id && p.unit.currentHp > 0 && p.coord.equals(nextCoord));
      const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(nextCoord) && this.visibilityMap.isVisible(nextCoord));
      if (hasAlly || hasEnemy) break;

      // Stop if item or staircase at next tile
      const hasItem = this.floorItems.some(fi => fi.coord.equals(nextCoord));
      const hasStairs = this.staircaseCoord.equals(nextCoord);

      await this.movePlayerUnit(player, nextCoord, true);

      if (hasItem || hasStairs || this.isEncounterActive) break;

      // Check if hallway branches into multiple directions
      let walkableNeighbors = 0;
      const neighbors = [
        new TileCoordinate(player.coord.x + 1, player.coord.y),
        new TileCoordinate(player.coord.x - 1, player.coord.y),
        new TileCoordinate(player.coord.x, player.coord.y + 1),
        new TileCoordinate(player.coord.x, player.coord.y - 1)
      ];
      for (const n of neighbors) {
        if (this.gridMap.isWalkable(n)) walkableNeighbors++;
      }

      if (walkableNeighbors > 2) {
        // Reached an intersection or room opening: stop sprint safely
        break;
      }
    }
  }

  private async swapPlayerPositions(
    activePlayer: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter },
    allyPlayer: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }
  ): Promise<void> {
    this.isProcessingAction = true;
    this.combatForecastPresenter.hide();
    this.gridPresenter.clearHighlights();

    const originalActiveCoord = new TileCoordinate(activePlayer.coord.x, activePlayer.coord.y);
    const originalAllyCoord = new TileCoordinate(allyPlayer.coord.x, allyPlayer.coord.y);

    activePlayer.coord = originalAllyCoord;
    allyPlayer.coord = originalActiveCoord;

    this.audioService.playSound('hero_step');

    await Promise.all([
      activePlayer.graphic.moveTo(activePlayer.coord),
      allyPlayer.graphic.moveTo(allyPlayer.coord)
    ]);

    this.centerCameraOn(activePlayer.coord);

    this.isProcessingAction = false;
    this.updateFogAndVisibility();
    this.checkEncounterState();

    if (activePlayer.coord.equals(this.staircaseCoord)) {
      const remainingEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0).length;
      this.stairsModalPresenter.show(this.floorCount + 1, remainingEnemies);
      this.isMenuOpen = true;
      return;
    }

    if (this.isEncounterActive) {
      this.showActionMenuForPlayer(activePlayer);
    }
  }

  private startFloor(floorNumber: number): void {
    this.floorCount = floorNumber;
    this.selectedPlayerIndex = null;
    this.isProcessingAction = false;
    this.isMenuOpen = false;
    this.isTargeting = false;
    this.isEncounterActive = false;
    this.combatForecastPresenter.hide();
    this.actionMenuPresenter.hide();
    this.inventoryMenuPresenter.hide();
    this.stairsModalPresenter.hide();
    this.gridPresenter.clearHighlights();

    // 1. Generate Procedural Layout, Spawns & Floor Items
    const enemyCount = Math.min(5, 3 + Math.floor((floorNumber - 1) / 2));
    const floorData = this.generateFloorUseCase.execute(2, enemyCount);

    this.gridMap = floorData.map;
    this.staircaseCoord = floorData.staircase;
    this.visibilityMap = new VisibilityMap();
    this.fogOfWar = new FogOfWar(this.gridMap, floorData.rooms);
    this.getValidMovesUseCase = new GetValidMovesUseCase(this.gridMap, this.pathfinder);
    this.inputPresenter.setBounds(this.gridMap.width, this.gridMap.height);

    // 2. Draw Floor & Staircase
    this.gridPresenter.drawGrid(this.gridMap);
    this.gridPresenter.drawStaircase(this.staircaseCoord);

    // 3. Spawn / Reset Players from data-driven GameDatabase
    if (this.playerSquad.length === 0) {
      const heroBlueprints = GameDatabase.heroes.getAll();
      const p1Unit = GameDatabase.createHeroUnit(heroBlueprints[0]?.id || 'hero_sword_fighter', 'p1');
      const p2Unit = GameDatabase.createHeroUnit(heroBlueprints[1]?.id || 'hero_lance_knight', 'p2');

      this.playerSquad = [
        { unit: p1Unit, coord: floorData.playerSpawns[0]!, hasActed: false, graphic: new UnitPresenter(this, p1Unit, floorData.playerSpawns[0]!, true, true) }, // Leader (Gold)
        { unit: p2Unit, coord: floorData.playerSpawns[1]!, hasActed: false, graphic: new UnitPresenter(this, p2Unit, floorData.playerSpawns[1]!, true, false) } // Companion (Cyan)
      ];
    } else {
      this.playerSquad.forEach((p, idx) => {
        p.coord = floorData.playerSpawns[idx] || floorData.playerSpawns[0]!;
        p.hasActed = false;
        p.unit.currentHp = p.unit.maxHp;
        p.graphic.moveTo(p.coord);
        p.graphic.updateHp(p.unit.currentHp, p.unit.maxHp);
        p.graphic.setExhausted(false);
        p.graphic.setLeader(idx === 0);
      });
    }

    this.playerSquad.forEach(p => {
      this.turnStartCoords.set(p.unit.id, new TileCoordinate(p.coord.x, p.coord.y));
    });

    // 4. Spawn Floor Items
    this.floorItems.forEach(fi => fi.sprite.destroy());
    this.floorItems = [];

    if (floorData.items) {
      for (const itemSpawn of floorData.items) {
        const itemSprite = this.add.sprite(
          itemSpawn.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          itemSpawn.coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          'item_drop'
        );
        itemSprite.setScale(1.5);
        itemSprite.setDepth(1.5);

        this.floorItems.push({
          coord: itemSpawn.coord,
          item: itemSpawn.item,
          sprite: itemSprite
        });
      }
    }

    // 5. Spawn / Reset Enemies with Tiered Difficulty
    this.enemySquad.forEach(e => e.graphic.clear());
    this.enemySquad = [];

    for (let i = 0; i < floorData.enemySpawns.length; i++) {
      const coord = floorData.enemySpawns[i]!;
      const unit = EnemyFactory.createEnemy(floorNumber, i);
      const graphic = new UnitPresenter(this, unit, coord, false, false);
      graphic.updateHp(unit.currentHp, unit.maxHp);

      this.enemySquad.push({
        unit,
        coord,
        hasActed: false,
        graphic
      });
    }

    // 6. Update HUD & Phase
    this.hudPresenter.updateFloor(this.floorCount);
    this.hudPresenter.updatePhase('🔵 EXPLORE');
    this.hudPresenter.updateEnemies(this.enemySquad.length);
    this.partyHudPresenter.updateParty(this.playerSquad);

    while (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      this.phaseManager.advancePhase();
    }

    this.playerSquad.forEach(p => {
      p.graphic.setExhausted(false);
    });

    if (this.playerSquad[0]) {
      this.centerCameraOn(this.playerSquad[0].coord, false);
    }

    this.updateFogAndVisibility();
    this.checkEncounterState();
  }

  private updateFogAndVisibility(): void {
    const playerCoords = this.playerSquad.filter(p => p.unit.currentHp > 0).map(p => p.coord);
    this.fogOfWar.updateVisibility(playerCoords, this.visibilityMap);
    this.fogPresenter.drawFog(this.gridMap, this.visibilityMap);

    // Hide or show enemies based on visibility
    this.enemySquad.forEach(enemy => {
      if (enemy.unit.currentHp > 0) {
        const isVisible = this.visibilityMap.isVisible(enemy.coord);
        enemy.graphic.setVisible(isVisible);
      }
    });

    // Hide or show floor items based on visibility
    this.floorItems.forEach(item => {
      const isVisible = this.visibilityMap.isVisible(item.coord);
      item.sprite.setVisible(isVisible);
    });

    // Update minimap with discovered tiles and visible enemies
    this.minimapPresenter.drawMap(this.gridMap, this.staircaseCoord, this.visibilityMap);
    this.updateMinimap();
  }

  private checkEncounterState(): void {
    const aliveEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0 && this.visibilityMap.isVisible(e.coord));
    const alivePlayers = this.playerSquad.filter(p => p.unit.currentHp > 0);

    let enemyNearby = false;
    for (const player of alivePlayers) {
      for (const enemy of aliveEnemies) {
        const dist = Math.abs(player.coord.x - enemy.coord.x) + Math.abs(player.coord.y - enemy.coord.y);
        if (dist <= 3) {
          enemyNearby = true;
          break;
        }
      }
      if (enemyNearby) break;
    }

    if (enemyNearby && !this.isEncounterActive) {
      this.isEncounterActive = true;
      this.hudPresenter.updatePhase('⚔️ COMBAT');
      this.playerSquad.forEach(p => {
        this.turnStartCoords.set(p.unit.id, new TileCoordinate(p.coord.x, p.coord.y));
      });
      const activePlayer = this.getActiveHero();
      if (activePlayer) {
        const screenX = activePlayer.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
        const screenY = activePlayer.coord.y * GridPresenter.TILE_SIZE - 10;
        this.combatTextPresenter.showBanner(screenX, screenY, '⚔️ COMBAT ENGAGED!');
      }
    } else if (!enemyNearby && this.isEncounterActive) {
      this.isEncounterActive = false;
      this.hudPresenter.updatePhase('🔵 EXPLORE');
      this.cancelActionMenu();

      // Clear any exhaustion when transitioning back to exploration
      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          p.hasActed = false;
          p.graphic.setExhausted(false);
        }
      });

      const activePlayer = this.getActiveHero();
      if (activePlayer) {
        const screenX = activePlayer.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
        const screenY = activePlayer.coord.y * GridPresenter.TILE_SIZE - 10;
        this.combatTextPresenter.showBanner(screenX, screenY, '✨ AREA SECURED');
      }
    }
  }

  private cycleNextHero(): void {
    if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    const availableIndices = this.playerSquad
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => p.unit.currentHp > 0 && (this.isEncounterActive ? !p.hasActed : true))
      .map(({ idx }) => idx);

    if (availableIndices.length === 0) return;

    let nextIdx = availableIndices[0]!;
    if (this.selectedPlayerIndex !== null) {
      const currentPos = availableIndices.indexOf(this.selectedPlayerIndex);
      if (currentPos !== -1) {
        nextIdx = availableIndices[(currentPos + 1) % availableIndices.length]!;
      }
    }

    this.selectHeroByIndex(nextIdx);
  }

  private selectHeroByIndex(index: number): void {
    this.selectedPlayerIndex = index;
    const selectedPlayer = this.playerSquad[index];
    if (!selectedPlayer) return;

    // Dynamic Leader Crown & Outline update
    this.playerSquad.forEach((p, idx) => {
      p.graphic.setSelected(idx === index);
      if (!this.isEncounterActive) {
        p.graphic.setLeader(idx === index);
      }
    });

    this.combatForecastPresenter.hide();

    if (this.isEncounterActive) {
      const validMoves = this.getValidMovesUseCase.execute(selectedPlayer.coord, 3);
      const filteredMoves = validMoves.filter(move => {
        const isAdjacentAlly = this.playerSquad.some((p, i) => i !== index && p.unit.currentHp > 0 && p.coord.equals(move) && (Math.abs(selectedPlayer.coord.x - move.x) + Math.abs(selectedPlayer.coord.y - move.y) === 1));
        const hasDistantPlayer = this.playerSquad.some((p, i) => i !== index && p.unit.currentHp > 0 && p.coord.equals(move) && !isAdjacentAlly);
        const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
        return !hasDistantPlayer && !hasEnemy;
      });
      this.gridPresenter.highlightWalkableArea(filteredMoves, selectedPlayer.coord);
    } else {
      this.gridPresenter.clearHighlights();
    }

    this.centerCameraOn(selectedPlayer.coord);
  }

  private onEndTurnClicked(): void {
    if (this.isProcessingAction || this.isMenuOpen || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    this.playerSquad.forEach(p => {
      if (p.unit.currentHp > 0) {
        p.hasActed = true;
        p.graphic.setExhausted(true);
        p.graphic.setSelected(false);
      }
    });

    this.selectedPlayerIndex = null;
    this.gridPresenter.clearHighlights();
    this.combatForecastPresenter.hide();
    this.actionMenuPresenter.hide();
    this.inventoryMenuPresenter.hide();

    this.phaseManager.advancePhase();
    this.hudPresenter.updatePhase('🔴 ENEMY');
    this.executeEnemyPhase();
  }

  private centerCameraOn(coord: TileCoordinate, animate: boolean = true): void {
    const worldX = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
    const worldY = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

    if (animate) {
      this.cameras.main.pan(worldX, worldY, 200, 'Sine.easeInOut');
    } else {
      this.cameras.main.centerOn(worldX, worldY);
    }
  }

  private updateMinimap(): void {
    const playerCoords = this.playerSquad.filter(p => p.unit.currentHp > 0).map(p => p.coord);
    const visibleEnemyCoords = this.enemySquad
      .filter(e => e.unit.currentHp > 0 && this.visibilityMap.isVisible(e.coord))
      .map(e => e.coord);
    this.minimapPresenter.updateEntities(playerCoords, visibleEnemyCoords, this.visibilityMap);
  }

  private onTileHover(coord: TileCoordinate) {
    if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      this.combatForecastPresenter.hide();
      return;
    }

    if (this.selectedPlayerIndex === null) {
      this.combatForecastPresenter.hide();
      return;
    }

    const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
    if (!selectedPlayer) {
      this.combatForecastPresenter.hide();
      return;
    }

    const hoveredEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord) && this.visibilityMap.isVisible(coord));
    if (hoveredEnemy) {
      const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
      if (dist === 1) {
        const worldX = hoveredEnemy.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
        const worldY = hoveredEnemy.coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
        this.combatForecastPresenter.show(selectedPlayer.unit, hoveredEnemy.unit, worldX, worldY);
        return;
      }
    }

    this.combatForecastPresenter.hide();
  }

  private async onTileClicked(coord: TileCoordinate) {
    if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    // 1. If targeting mode is active for attack
    if (this.isTargeting && this.selectedPlayerIndex !== null) {
      const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
      const clickedEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord) && this.visibilityMap.isVisible(coord));

      if (clickedEnemy && selectedPlayer) {
        const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
        if (dist === 1) {
          this.isTargeting = false;
          await this.executePlayerAttack(selectedPlayer, clickedEnemy);
          return;
        }
      }
      return;
    }

    // 2. If clicking on the Staircase while standing on it
    if (coord.equals(this.staircaseCoord)) {
      const heroOnStairs = this.playerSquad.some(p => p.unit.currentHp > 0 && p.coord.equals(this.staircaseCoord));
      if (heroOnStairs) {
        const remainingEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0).length;
        this.stairsModalPresenter.show(this.floorCount + 1, remainingEnemies);
        this.isMenuOpen = true;
        return;
      }
    }

    // 3. Select an active unacted player OR swap positions with adjacent ally
    const clickedPlayerIndex = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && (this.isEncounterActive ? !p.hasActed : true) && p.coord.equals(coord));
    if (clickedPlayerIndex !== -1) {
      if (this.selectedPlayerIndex === clickedPlayerIndex) {
        if (this.isEncounterActive) {
          this.showActionMenuForPlayer(this.playerSquad[clickedPlayerIndex]!);
        }
      } else if (this.selectedPlayerIndex !== null && this.playerSquad[this.selectedPlayerIndex]) {
        const currentHero = this.playerSquad[this.selectedPlayerIndex]!;
        const clickedHero = this.playerSquad[clickedPlayerIndex]!;
        const dist = Math.abs(currentHero.coord.x - clickedHero.coord.x) + Math.abs(currentHero.coord.y - clickedHero.coord.y);
        if (dist === 1) {
          // Adjacent ally: Swap places smoothly!
          await this.swapPlayerPositions(currentHero, clickedHero);
          return;
        }
        this.selectHeroByIndex(clickedPlayerIndex);
      } else {
        this.selectHeroByIndex(clickedPlayerIndex);
      }
      return;
    }

    if (this.selectedPlayerIndex === null) {
      // In exploration mode, default to moving the lead hero
      const leadHeroIdx = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && !p.hasActed);
      if (leadHeroIdx !== -1) {
        this.selectHeroByIndex(leadHeroIdx);
      } else {
        return;
      }
    }

    if (this.selectedPlayerIndex === null) {
      return;
    }

    const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
    if (!selectedPlayer) {
      return;
    }

    // 4. Move to valid tile
    const validMoves = this.getValidMovesUseCase.execute(selectedPlayer.coord, 3);
    const filteredMoves = validMoves.filter(move => {
      const isAdjacentAlly = this.playerSquad.some(p => p.unit.id !== selectedPlayer.unit.id && p.unit.currentHp > 0 && p.coord.equals(move) && (Math.abs(selectedPlayer.coord.x - move.x) + Math.abs(selectedPlayer.coord.y - move.y) === 1));
      const hasDistantPlayer = this.playerSquad.some(p => p.unit.id !== selectedPlayer.unit.id && p.unit.currentHp > 0 && p.coord.equals(move) && !isAdjacentAlly);
      const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
      return !hasDistantPlayer && !hasEnemy;
    });

    const isReachable = filteredMoves.some(move => move.equals(coord));

    if (isReachable) {
      await this.movePlayerUnit(selectedPlayer, coord);
    }
  }

  private async movePlayerUnit(selectedPlayer: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }, coord: TileCoordinate, fast: boolean = false): Promise<void> {
    this.isProcessingAction = true;
    this.combatForecastPresenter.hide();
    this.actionMenuPresenter.hide();
    this.isMenuOpen = false;
    this.gridPresenter.clearHighlights();

    const leaderPreviousCoord = new TileCoordinate(selectedPlayer.coord.x, selectedPlayer.coord.y);
    selectedPlayer.coord = coord;
    this.audioService.playSound('hero_step');
    await selectedPlayer.graphic.moveTo(coord, fast);
    this.centerCameraOn(coord, !fast);

    // In Exploration Mode (no active encounter), companion auto-follows behind leader
    if (!this.isEncounterActive) {
      const companion = this.playerSquad.find(p => p.unit.id !== selectedPlayer.unit.id && p.unit.currentHp > 0);
      if (companion && !companion.coord.equals(leaderPreviousCoord)) {
        const followTarget = this.followFormationCalculator.calculate(leaderPreviousCoord);
        companion.coord = followTarget;
        await companion.graphic.moveTo(followTarget, fast);
      }
    }

    // Check Floor Item Pickup
    const itemIndex = this.floorItems.findIndex(fi => fi.coord.equals(coord));
    if (itemIndex !== -1) {
      const floorItem = this.floorItems[itemIndex]!;
      this.pickupItemUseCase.execute(selectedPlayer.unit, floorItem.item);
      floorItem.sprite.destroy();
      this.floorItems.splice(itemIndex, 1);
      this.audioService.playSound('item_pickup');
      const screenX = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const screenY = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      this.combatTextPresenter.showBanner(screenX, screenY, `+ Obtained ${floorItem.item.name}!`);
    }

    // Hunger / Belly Decay every 10 steps
    this.stepCount++;
    if (this.stepCount % 10 === 0) {
      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          const starving = p.unit.decreaseBelly(1);
          if (starving) {
            p.unit.applyDamage(1);
            p.graphic.updateHp(p.unit.currentHp, p.unit.maxHp);
            const screenX = p.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
            const screenY = p.coord.y * GridPresenter.TILE_SIZE - 10;
            this.combatTextPresenter.showDamage(screenX, screenY, 1, false, false);
          }
        }
      });
    }

    this.partyHudPresenter.updateParty(this.playerSquad);
    this.isProcessingAction = false;
    this.updateFogAndVisibility();
    this.checkEncounterState();

    // Check if player stepped on the staircase
    if (coord.equals(this.staircaseCoord)) {
      const remainingEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0).length;
      this.stairsModalPresenter.show(this.floorCount + 1, remainingEnemies);
      this.isMenuOpen = true;
      return;
    }

    // In Combat Mode, moving always prompts tactical actions (Attack, Item, Wait, or Cancel Undo)
    if (this.isEncounterActive) {
      this.showActionMenuForPlayer(selectedPlayer);
    }
  }

  private showActionMenuForPlayer(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    this.isMenuOpen = true;

    const adjacentEnemy = this.enemySquad.find(e => {
      if (e.unit.currentHp <= 0 || !this.visibilityMap.isVisible(e.coord)) return false;
      const dist = Math.abs(player.coord.x - e.coord.x) + Math.abs(player.coord.y - e.coord.y);
      return dist === 1;
    });

    const worldX = player.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE + 4;
    const worldY = player.coord.y * GridPresenter.TILE_SIZE;

    // Show floating forecast above adjacent enemy if available
    if (adjacentEnemy) {
      const enemyWorldX = adjacentEnemy.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const enemyWorldY = adjacentEnemy.coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      this.combatForecastPresenter.show(player.unit, adjacentEnemy.unit, enemyWorldX, enemyWorldY);
    }

    this.actionMenuPresenter.onAttack = () => {
      this.actionMenuPresenter.hide();
      this.isMenuOpen = false;
      this.isTargeting = true;
    };

    this.actionMenuPresenter.onWait = () => {
      this.actionMenuPresenter.hide();
      this.combatForecastPresenter.hide();
      this.isMenuOpen = false;
      this.finalizePlayerTurn(player);
    };

    this.actionMenuPresenter.onItem = () => {
      this.actionMenuPresenter.hide();
      this.combatForecastPresenter.hide();
      this.showInventoryMenu(player);
    };

    this.actionMenuPresenter.show(worldX, worldY, !!adjacentEnemy);
  }

  private showInventoryMenu(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    this.isMenuOpen = true;

    const worldX = player.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE + 4;
    const worldY = player.coord.y * GridPresenter.TILE_SIZE;

    this.inventoryMenuPresenter.onClose = () => {
      this.inventoryMenuPresenter.hide();
      this.isMenuOpen = false;
      if (this.isEncounterActive) {
        this.showActionMenuForPlayer(player);
      }
    };

    this.inventoryMenuPresenter.onSelectItem = (item: Item) => {
      this.inventoryMenuPresenter.hide();
      this.isMenuOpen = false;

      this.consumeItemUseCase.execute(player.unit, item);

      const screenX = player.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
      const screenY = player.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

      if (item.type === ItemType.HEAL) {
        player.graphic.updateHp(player.unit.currentHp, player.unit.maxHp);
        this.combatTextPresenter.showHeal(screenX, screenY, item.value);
      } else if (item.type === ItemType.FOOD) {
        this.combatTextPresenter.showBanner(screenX, screenY, `+ Restored ${item.value}% Belly!`);
      }

      this.partyHudPresenter.updateParty(this.playerSquad);
      if (this.isEncounterActive) {
        this.finalizePlayerTurn(player);
      }
    };

    this.inventoryMenuPresenter.show(player.unit, worldX, worldY);
  }

  private async executePlayerAttack(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }, enemy: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter }) {
    this.isProcessingAction = true;
    this.combatForecastPresenter.hide();

    const summary = this.attackUnitUseCase.execute(player.unit, enemy.unit);

    const screenX = enemy.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
    const screenY = enemy.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

    await player.graphic.animateAttack(enemy.coord);

    if (summary.isHit) {
      await enemy.graphic.animateHit();
      if (summary.isCrit) {
        this.combatTextPresenter.showCritical(screenX, screenY, summary.damageDealt);
      } else {
        this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt, summary.hasAdvantage, summary.hasDisadvantage);
      }
      enemy.graphic.updateHp(enemy.unit.currentHp, enemy.unit.maxHp);
    } else {
      this.combatTextPresenter.showMiss(screenX, screenY);
      await enemy.graphic.animateHit(); // Quick dodge hop
    }

    // EXP and Level-Up
    const expGain = summary.isFatal ? 50 : 20;
    const expResult = this.gainExpUseCase.execute(player.unit, expGain);

    if (expResult.levelUps.length > 0) {
      const accumulatedStats = { hpIncrease: 0, attackIncrease: 0, defenseIncrease: 0 };
      for (const lu of expResult.levelUps) {
        accumulatedStats.hpIncrease += lu.hpIncrease;
        accumulatedStats.attackIncrease += lu.attackIncrease;
        accumulatedStats.defenseIncrease += lu.defenseIncrease;
      }
      const playerScreenX = player.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
      const playerScreenY = player.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
      this.combatTextPresenter.showLevelUp(playerScreenX, playerScreenY - 20, accumulatedStats);

      if (accumulatedStats.hpIncrease > 0) {
        player.graphic.updateHp(player.unit.currentHp, player.unit.maxHp);
      }
    }

    if (summary.isFatal) {
      enemy.graphic.clear();
      this.hudPresenter.updateEnemies(this.enemySquad.filter(e => e.unit.currentHp > 0).length);
    }

    this.partyHudPresenter.updateParty(this.playerSquad);
    this.isProcessingAction = false;
    this.updateFogAndVisibility();
    this.checkEncounterState();

    this.finalizePlayerTurn(player);
  }

  private finalizePlayerTurn(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    player.hasActed = true;
    player.graphic.setSelected(false);
    player.graphic.setExhausted(true);
    this.selectedPlayerIndex = null;
    this.gridPresenter.clearHighlights();
    this.combatForecastPresenter.hide();
    this.turnStartCoords.set(player.unit.id, new TileCoordinate(player.coord.x, player.coord.y));

    const allActed = this.playerSquad.every(p => p.unit.currentHp <= 0 || p.hasActed);
    if (allActed) {
      this.phaseManager.advancePhase();
      this.hudPresenter.updatePhase('🔴 ENEMY');
      this.executeEnemyPhase();
    } else {
      const nextActiveHero = this.playerSquad.find(p => p.unit.currentHp > 0 && !p.hasActed);
      if (nextActiveHero) {
        this.centerCameraOn(nextActiveHero.coord);
      }
    }
  }

  private async executeEnemyPhase() {
    if (this.phaseManager.getPhase() !== TurnState.ENEMY_PHASE) {
      return;
    }

    this.isProcessingAction = true;
    const aliveEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0);

    aliveEnemies.forEach(e => e.graphic.setExhausted(false));

    for (const enemyData of aliveEnemies) {
      await new Promise<void>(resolve => {
        this.time.delayedCall(350, async () => {
          const playerInfos = this.playerSquad
            .filter(p => p.unit.currentHp > 0)
            .map(p => ({ unit: p.unit, coord: p.coord }));

          const occupiedTiles = [
            ...this.playerSquad.filter(p => p.unit.currentHp > 0).map(p => p.coord),
            ...this.enemySquad.filter(e => e.unit.currentHp > 0).map(e => e.coord)
          ];

          this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, playerInfos, occupiedTiles);
          const result = this.executeEnemyTurnUseCase.execute(enemyData.unit, enemyData.coord);

          enemyData.coord = result.targetCoordinate;
          this.audioService.playSound('hero_step');
          await enemyData.graphic.moveTo(enemyData.coord);
          this.updateFogAndVisibility();

          if (result.targetToAttack) {
            const targetPlayer = this.playerSquad.find(p => p.unit.id === result.targetToAttack!.id);
            if (targetPlayer) {
              const summary = this.attackUnitUseCase.execute(enemyData.unit, targetPlayer.unit);

              const screenX = targetPlayer.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
              const screenY = targetPlayer.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

              await enemyData.graphic.animateAttack(targetPlayer.coord);

              if (summary.isHit) {
                await targetPlayer.graphic.animateHit();
                if (summary.isCrit) {
                  this.combatTextPresenter.showCritical(screenX, screenY, summary.damageDealt);
                } else {
                  this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt, summary.hasAdvantage, summary.hasDisadvantage);
                }
                targetPlayer.graphic.updateHp(targetPlayer.unit.currentHp, targetPlayer.unit.maxHp);
                if (summary.isFatal) {
                  targetPlayer.graphic.clear();
                }
              } else {
                this.combatTextPresenter.showMiss(screenX, screenY);
                await targetPlayer.graphic.animateHit();
              }
            }
          }

          enemyData.graphic.setExhausted(true);
          resolve();
        });
      });
    }

    this.partyHudPresenter.updateParty(this.playerSquad);
    this.isProcessingAction = false;
    this.updateFogAndVisibility();
    this.checkEncounterState();

    this.phaseManager.advancePhase();
    this.hudPresenter.updatePhase(this.isEncounterActive ? '⚔️ COMBAT' : '🔵 EXPLORE');

    this.playerSquad.forEach(p => {
      if (p.unit.currentHp > 0) {
        p.hasActed = false;
        p.graphic.setExhausted(false);
        this.turnStartCoords.set(p.unit.id, new TileCoordinate(p.coord.x, p.coord.y));
      }
    });

    const nextActivePlayer = this.playerSquad.find(p => p.unit.currentHp > 0 && !p.hasActed);
    if (nextActivePlayer) {
      this.centerCameraOn(nextActivePlayer.coord);
    }
  }
}
