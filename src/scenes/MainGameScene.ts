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
import { PhaseManagerUseCase } from '../features/turn/application/PhaseManagerUseCase';
import { GetValidMovesUseCase } from '../features/grid/application/GetValidMovesUseCase';
import { AttackUnitUseCase } from '../features/combat/application/AttackUnitUseCase';
import { GainExpUseCase } from '../features/combat/application/GainExpUseCase';
import { LevelUpUseCase } from '../features/combat/application/LevelUpUseCase';
import { ConsumeItemUseCase } from '../features/inventory/application/ConsumeItemUseCase';
import { ExecuteEnemyTurnUseCase } from '../features/ai/application/ExecuteEnemyTurnUseCase';
import { GenerateFloorUseCase } from '../features/grid/application/GenerateFloorUseCase';
import { Unit } from '../features/combat/domain/Unit';
import { WeaponType } from '../features/combat/domain/WeaponType';
import { EnemyFactory } from '../features/combat/domain/EnemyFactory';
import { Item, ItemType } from '../features/inventory/domain/Item';
import { TurnState } from '../features/turn/domain/TurnState';
import { UnitPresenter } from '../features/combat/presentation/UnitPresenter';
import { HudPresenter } from '../features/ui/presentation/HudPresenter';
import { WebAudioSynthService } from '../features/combat/infrastructure/WebAudioSynthService';

export class MainGameScene extends Phaser.Scene {
  // Map Dimensions (Expanded to 18x18 for 3x3 Chunsoft Macro-Grid)
  public static readonly MAP_WIDTH = 18;
  public static readonly MAP_HEIGHT = 18;

  // Use Cases
  private phaseManager!: PhaseManagerUseCase;
  private getValidMovesUseCase!: GetValidMovesUseCase;
  private attackUnitUseCase!: AttackUnitUseCase;
  private gainExpUseCase!: GainExpUseCase;
  private consumeItemUseCase!: ConsumeItemUseCase;
  private executeEnemyTurnUseCase!: ExecuteEnemyTurnUseCase;
  private generateFloorUseCase!: GenerateFloorUseCase;

  // Presenters
  private gridPresenter!: GridPresenter;
  private inputPresenter!: InputPresenter;
  private combatTextPresenter!: CombatTextPresenter;
  private hudPresenter!: HudPresenter;
  private combatForecastPresenter!: CombatForecastPresenter;
  private minimapPresenter!: MinimapPresenter;
  private actionMenuPresenter!: ActionMenuPresenter;
  private inventoryMenuPresenter!: InventoryMenuPresenter;

  // Audio
  private audioService!: WebAudioSynthService;

  // Domain
  private gridMap!: GridMap;
  private pathfinder!: Pathfinder;

  // State
  private playerSquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private enemySquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private floorCount: number = 1;
  private staircaseCoord!: TileCoordinate;
  private selectedPlayerIndex: number | null = null;
  private isProcessingAction: boolean = false;
  private isMenuOpen: boolean = false;
  private isTargeting: boolean = false;

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
    this.generateFloorUseCase = new GenerateFloorUseCase(MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);

    // Presenters
    this.gridPresenter = new GridPresenter(this);
    this.inputPresenter = new InputPresenter(this, MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);
    this.combatTextPresenter = new CombatTextPresenter(this);
    this.hudPresenter = new HudPresenter(this);
    this.hudPresenter.setOnMuteToggle(() => this.audioService.toggleMute());
    this.combatForecastPresenter = new CombatForecastPresenter(this);
    this.minimapPresenter = new MinimapPresenter(this);
    this.actionMenuPresenter = new ActionMenuPresenter(this);
    this.inventoryMenuPresenter = new InventoryMenuPresenter(this);

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
  }

  private startFloor(floorNumber: number): void {
    this.floorCount = floorNumber;
    this.selectedPlayerIndex = null;
    this.isProcessingAction = false;
    this.isMenuOpen = false;
    this.isTargeting = false;
    this.combatForecastPresenter.hide();
    this.actionMenuPresenter.hide();
    this.inventoryMenuPresenter.hide();
    this.gridPresenter.clearHighlights();

    // 1. Generate Procedural Layout & Dynamic Spawns
    const enemyCount = Math.min(5, 3 + Math.floor((floorNumber - 1) / 2));
    const floorData = this.generateFloorUseCase.execute(2, enemyCount);

    this.gridMap = floorData.map;
    this.staircaseCoord = floorData.staircase;
    this.getValidMovesUseCase = new GetValidMovesUseCase(this.gridMap, this.pathfinder);
    this.inputPresenter.setBounds(this.gridMap.width, this.gridMap.height);

    // 2. Draw Floor & Staircase
    this.gridPresenter.drawGrid(this.gridMap);
    this.gridPresenter.drawStaircase(this.staircaseCoord);
    this.minimapPresenter.drawMap(this.gridMap, this.staircaseCoord);

    // 3. Spawn / Reset Players
    if (this.playerSquad.length === 0) {
      const p1Unit = new Unit('p1', 'Sword Fighter', 20, 5, 2, WeaponType.SWORD);
      const p2Unit = new Unit('p2', 'Lance Knight', 22, 6, 3, WeaponType.LANCE);

      this.playerSquad = [
        { unit: p1Unit, coord: floorData.playerSpawns[0]!, hasActed: false, graphic: new UnitPresenter(this, p1Unit, floorData.playerSpawns[0]!, true) },
        { unit: p2Unit, coord: floorData.playerSpawns[1]!, hasActed: false, graphic: new UnitPresenter(this, p2Unit, floorData.playerSpawns[1]!, true) }
      ];
    } else {
      this.playerSquad.forEach((p, idx) => {
        p.coord = floorData.playerSpawns[idx] || floorData.playerSpawns[0]!;
        p.hasActed = false;
        p.unit.currentHp = p.unit.maxHp; // Heal to full on new floor
        p.graphic.moveTo(p.coord);
        p.graphic.updateHp(p.unit.currentHp, p.unit.maxHp);
        p.graphic.setExhausted(false);
      });
    }

    // 4. Spawn / Reset Enemies with Tiered Difficulty
    this.enemySquad.forEach(e => e.graphic.clear());
    this.enemySquad = [];

    for (let i = 0; i < floorData.enemySpawns.length; i++) {
      const coord = floorData.enemySpawns[i]!;
      const unit = EnemyFactory.createEnemy(floorNumber, i);
      const graphic = new UnitPresenter(this, unit, coord, false);
      graphic.updateHp(unit.currentHp, unit.maxHp);

      this.enemySquad.push({
        unit,
        coord,
        hasActed: false,
        graphic
      });
    }

    // 5. Update HUD & Phase
    this.hudPresenter.updateFloor(this.floorCount);
    this.hudPresenter.updatePhase('🔵 PLAYER');
    this.hudPresenter.updateEnemies(this.enemySquad.length);

    // Reset phase manager to PLAYER_PHASE
    while (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      this.phaseManager.advancePhase();
    }

    // Set all players to active vibrant state
    this.playerSquad.forEach(p => {
      p.graphic.setExhausted(false);
    });

    // Center camera on the first player
    if (this.playerSquad[0]) {
      this.centerCameraOn(this.playerSquad[0].coord, false);
    }

    this.updateMinimap();
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
    const enemyCoords = this.enemySquad.filter(e => e.unit.currentHp > 0).map(e => e.coord);
    this.minimapPresenter.updateEntities(playerCoords, enemyCoords);
  }

  private onTileHover(coord: TileCoordinate) {
    if (this.isProcessingAction || this.isMenuOpen || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
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

    const hoveredEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));
    if (hoveredEnemy) {
      const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
      if (dist === 1) { // Melee range
        this.combatForecastPresenter.show(selectedPlayer.unit, hoveredEnemy.unit);
        return;
      }
    }

    this.combatForecastPresenter.hide();
  }

  private async onTileClicked(coord: TileCoordinate) {
    if (this.isProcessingAction || this.isMenuOpen || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    // 1. If currently in targeting mode for an attack
    if (this.isTargeting && this.selectedPlayerIndex !== null) {
      const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
      const clickedEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));

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

    // 2. Select an active unacted player
    const clickedPlayerIndex = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && !p.hasActed && p.coord.equals(coord));
    if (clickedPlayerIndex !== -1) {
      this.selectedPlayerIndex = clickedPlayerIndex;
      this.combatForecastPresenter.hide();
      const validMoves = this.getValidMovesUseCase.execute(coord, 3);

      const filteredMoves = validMoves.filter(move => {
        const hasOtherPlayer = this.playerSquad.some((p, i) => i !== clickedPlayerIndex && p.unit.currentHp > 0 && p.coord.equals(move));
        const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
        return !hasOtherPlayer && !hasEnemy;
      });

      this.gridPresenter.highlightWalkableArea(filteredMoves, coord);
      this.centerCameraOn(coord);
      return;
    }

    if (this.selectedPlayerIndex === null) {
      return;
    }

    const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
    if (!selectedPlayer) {
      return;
    }

    // 3. Move to valid tile
    const validMoves = this.getValidMovesUseCase.execute(selectedPlayer.coord, 3);
    const filteredMoves = validMoves.filter(move => {
      const hasOtherPlayer = this.playerSquad.some(p => p.unit.id !== selectedPlayer.unit.id && p.unit.currentHp > 0 && p.coord.equals(move));
      const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
      return !hasOtherPlayer && !hasEnemy;
    });

    const isReachable = filteredMoves.some(move => move.equals(coord));

    if (isReachable) {
      this.isProcessingAction = true;
      this.combatForecastPresenter.hide();
      this.gridPresenter.clearHighlights();
      selectedPlayer.coord = coord;
      this.audioService.playSound('hero_step');
      await selectedPlayer.graphic.moveTo(coord);
      this.centerCameraOn(coord);
      this.isProcessingAction = false;
      this.updateMinimap();

      // Show Action Menu after moving
      this.showActionMenuForPlayer(selectedPlayer);
    }
  }

  private showActionMenuForPlayer(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    this.isMenuOpen = true;

    const hasAdjacentEnemy = this.enemySquad.some(e => {
      if (e.unit.currentHp <= 0) return false;
      const dist = Math.abs(player.coord.x - e.coord.x) + Math.abs(player.coord.y - e.coord.y);
      return dist === 1;
    });

    const worldX = player.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE;
    const worldY = player.coord.y * GridPresenter.TILE_SIZE;

    const cam = this.cameras.main;
    const screenX = worldX - cam.scrollX;
    const screenY = worldY - cam.scrollY;

    this.actionMenuPresenter.onAttack = () => {
      this.actionMenuPresenter.hide();
      this.isMenuOpen = false;
      this.isTargeting = true;
    };

    this.actionMenuPresenter.onWait = () => {
      this.actionMenuPresenter.hide();
      this.isMenuOpen = false;
      this.finalizePlayerTurn(player);
    };

    this.actionMenuPresenter.onItem = () => {
      this.actionMenuPresenter.hide();
      this.showInventoryMenu(player);
    };

    this.actionMenuPresenter.show(screenX, screenY, hasAdjacentEnemy);
  }

  private showInventoryMenu(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    this.inventoryMenuPresenter.onClose = () => {
      this.inventoryMenuPresenter.hide();
      this.showActionMenuForPlayer(player);
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
      }

      this.finalizePlayerTurn(player);
    };

    this.inventoryMenuPresenter.show(player.unit);
  }

  private async executePlayerAttack(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }, enemy: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter }) {
    this.isProcessingAction = true;
    this.combatForecastPresenter.hide();

    const summary = this.attackUnitUseCase.execute(player.unit, enemy.unit);

    const screenX = enemy.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
    const screenY = enemy.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

    await player.graphic.animateAttack(enemy.coord);
    await enemy.graphic.animateHit();

    this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt, summary.hasAdvantage, summary.hasDisadvantage);
    enemy.graphic.updateHp(enemy.unit.currentHp, enemy.unit.maxHp);

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

    this.isProcessingAction = false;
    this.updateMinimap();

    this.finalizePlayerTurn(player);
  }

  private finalizePlayerTurn(player: { unit: Unit, coord: TileCoordinate, graphic: UnitPresenter, hasActed: boolean }) {
    player.hasActed = true;
    this.selectedPlayerIndex = null;
    this.gridPresenter.clearHighlights();
    player.graphic.setExhausted(true);

    if (this.checkWinCondition()) {
      return;
    }

    const allActed = this.playerSquad.every(p => p.unit.currentHp <= 0 || p.hasActed);
    if (allActed) {
      this.phaseManager.advancePhase();
      this.hudPresenter.updatePhase('🔴 ENEMY');
      this.executeEnemyPhase();
    }
  }

  private checkWinCondition(): boolean {
    const allEnemiesDead = this.enemySquad.every(e => e.unit.currentHp <= 0);
    const playerOnStaircase = this.playerSquad.some(p => p.unit.currentHp > 0 && p.coord.equals(this.staircaseCoord));

    if (allEnemiesDead || playerOnStaircase) {
      if (playerOnStaircase) {
        this.audioService.playSound('staircase_descend');
      }
      this.startFloor(this.floorCount + 1);
      return true;
    }
    return false;
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
          this.updateMinimap();

          if (result.targetToAttack) {
            const targetPlayer = this.playerSquad.find(p => p.unit.id === result.targetToAttack!.id);
            if (targetPlayer) {
              const summary = this.attackUnitUseCase.execute(enemyData.unit, targetPlayer.unit);

              const screenX = targetPlayer.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
              const screenY = targetPlayer.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

              await enemyData.graphic.animateAttack(targetPlayer.coord);
              await targetPlayer.graphic.animateHit();

              this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt, summary.hasAdvantage, summary.hasDisadvantage);
              targetPlayer.graphic.updateHp(targetPlayer.unit.currentHp, targetPlayer.unit.maxHp);

              if (summary.isFatal) {
                targetPlayer.graphic.clear();
              }
            }
          }

          enemyData.graphic.setExhausted(true);
          resolve();
        });
      });
    }

    this.isProcessingAction = false;
    this.updateMinimap();

    if (!this.checkWinCondition()) {
      this.phaseManager.advancePhase();
      this.hudPresenter.updatePhase('🔵 PLAYER');

      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          p.hasActed = false;
          p.graphic.setExhausted(false);
        }
      });

      const nextActivePlayer = this.playerSquad.find(p => p.unit.currentHp > 0 && !p.hasActed);
      if (nextActivePlayer) {
        this.centerCameraOn(nextActivePlayer.coord);
      }
    }
  }
}
