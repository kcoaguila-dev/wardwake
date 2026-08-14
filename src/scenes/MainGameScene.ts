import * as Phaser from 'phaser';

import { GridMap } from '../features/grid/domain/GridMap';
import { Pathfinder } from '../features/grid/domain/Pathfinder';
import { TileCoordinate } from '../features/grid/domain/TileCoordinate';
import { GridPresenter } from '../features/grid/presentation/GridPresenter';
import { InputPresenter } from '../features/ui/presentation/InputPresenter';
import { CombatTextPresenter } from '../features/ui/presentation/CombatTextPresenter';
import { CombatForecastPresenter } from '../features/ui/presentation/CombatForecastPresenter';
import { MinimapPresenter } from '../features/ui/presentation/MinimapPresenter';
import { PhaseManagerUseCase } from '../features/turn/application/PhaseManagerUseCase';
import { GetValidMovesUseCase } from '../features/grid/application/GetValidMovesUseCase';
import { AttackUnitUseCase } from '../features/combat/application/AttackUnitUseCase';
import { ExecuteEnemyTurnUseCase } from '../features/ai/application/ExecuteEnemyTurnUseCase';
import { GenerateFloorUseCase } from '../features/grid/application/GenerateFloorUseCase';
import { Unit } from '../features/combat/domain/Unit';
import { WeaponType } from '../features/combat/domain/WeaponType';
import { IAudioService } from '../features/combat/application/ports/IAudioService';
import { TurnState } from '../features/turn/domain/TurnState';
import { UnitPresenter } from '../features/combat/presentation/UnitPresenter';
import { HudPresenter } from '../features/ui/presentation/HudPresenter';
import { FogOfWar } from '../features/fog/domain/FogOfWar';
import { VisibilityMap } from '../features/fog/domain/VisibilityMap';
import { FogPresenter } from '../features/fog/presentation/FogPresenter';
import { Item, ItemType } from '../features/inventory/domain/Item';
import { PickupItemUseCase } from '../features/inventory/application/PickupItemUseCase';

class DummyAudioService implements IAudioService {
  playSound(soundId: string): void {
    console.log(`Sound played: ${soundId}`);
  }
}

export class MainGameScene extends Phaser.Scene {
  // Map Dimensions (Expanded to 18x18 for 3x3 Chunsoft Macro-Grid)
  public static readonly MAP_WIDTH = 18;
  public static readonly MAP_HEIGHT = 18;

  // Use Cases
  private phaseManager!: PhaseManagerUseCase;
  private getValidMovesUseCase!: GetValidMovesUseCase;
  private attackUnitUseCase!: AttackUnitUseCase;
  private executeEnemyTurnUseCase!: ExecuteEnemyTurnUseCase;
  private generateFloorUseCase!: GenerateFloorUseCase;
  private pickupItemUseCase!: PickupItemUseCase;

  // Presenters
  private gridPresenter!: GridPresenter;
  private inputPresenter!: InputPresenter;
  private combatTextPresenter!: CombatTextPresenter;
  private hudPresenter!: HudPresenter;
  private combatForecastPresenter!: CombatForecastPresenter;
  private minimapPresenter!: MinimapPresenter;
  private fogPresenter!: FogPresenter;

  // Domain
  private gridMap!: GridMap;
  private pathfinder!: Pathfinder;
  private visibilityMap!: VisibilityMap;
  private fogOfWar!: FogOfWar;

  // State
  private playerSquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private enemySquad: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[] = [];
  private floorItems: { coord: TileCoordinate; item: Item; sprite: Phaser.GameObjects.Sprite }[] = [];
  private floorCount: number = 1;
  private staircaseCoord!: TileCoordinate;
  private selectedPlayerIndex: number | null = null;
  private isProcessingAction: boolean = false;

  constructor() {
    super('MainGameScene');
  }

  create() {
    this.pathfinder = new Pathfinder();
    this.phaseManager = new PhaseManagerUseCase();
    this.attackUnitUseCase = new AttackUnitUseCase(new DummyAudioService());
    this.generateFloorUseCase = new GenerateFloorUseCase(MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);
    this.pickupItemUseCase = new PickupItemUseCase();

    // Presenters
    this.gridPresenter = new GridPresenter(this);
    this.inputPresenter = new InputPresenter(this, MainGameScene.MAP_WIDTH, MainGameScene.MAP_HEIGHT);
    this.combatTextPresenter = new CombatTextPresenter(this);
    this.hudPresenter = new HudPresenter(this);
    this.combatForecastPresenter = new CombatForecastPresenter(this);
    this.minimapPresenter = new MinimapPresenter(this);
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
  }

  private startFloor(floorNumber: number): void {
    this.floorCount = floorNumber;
    this.selectedPlayerIndex = null;
    this.isProcessingAction = false;
    this.combatForecastPresenter.hide();
    this.gridPresenter.clearHighlights();

    // 1. Generate Procedural Layout & Dynamic Spawns (3-4 Enemies on 18x18)
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

    // We will update minimap after computing visibility

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

    // Clear old items
    this.floorItems.forEach(i => i.sprite.destroy());
    this.floorItems = [];

    // Draw new items
    for (const floorItem of floorData.items) {
      const px = floorItem.coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const py = floorItem.coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      const textureKey = floorItem.item.type === ItemType.HEAL ? 'item_potion' : 'item_sword'; // Assuming some keys, we can fallback to a generic one or use shapes
      // We will just use a generic sprite or a coloured box. Let's use a rectangle graphic or a sprite if it exists. We'll use a sprite with tint for safety.
      const sprite = this.add.sprite(px, py, 'ui_box'); // 'ui_box' is usually loaded in Preloader, if not we'll handle it. Let's tint it.
      sprite.setDepth(1); // Above floor, below units
      sprite.setScale(0.5);
      if (floorItem.item.type === ItemType.HEAL) {
        sprite.setTint(0x00ff00);
      } else {
        sprite.setTint(0xff8800);
      }

      this.floorItems.push({
        coord: floorItem.coord,
        item: floorItem.item,
        sprite: sprite
      });
    }

    // 4. Spawn / Reset Enemies
    this.enemySquad.forEach(e => e.graphic.clear());
    this.enemySquad = [];

    for (let i = 0; i < floorData.enemySpawns.length; i++) {
      const coord = floorData.enemySpawns[i]!;
      const isAxe = i % 2 === 0;
      const unit = isAxe
        ? new Unit(`e${i + 1}`, 'Axe Warrior', 15 + floorNumber * 2, 5 + floorNumber, 1, WeaponType.AXE)
        : new Unit(`e${i + 1}`, 'Sword Guard', 18 + floorNumber * 2, 4 + floorNumber, 2, WeaponType.SWORD);

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

    this.updateVisibility();
  }

  private updateVisibility(): void {
    const squadCoords = this.playerSquad.filter(p => p.unit.currentHp > 0).map(p => p.coord);
    this.fogOfWar.updateVisibility(squadCoords, this.visibilityMap);
    this.fogPresenter.drawFog(this.gridMap, this.visibilityMap);
    this.updateMinimap();

    // Hide enemies that are not visible
    this.enemySquad.forEach(e => {
      if (e.unit.currentHp > 0) {
        if (this.visibilityMap.isVisible(e.coord)) {
          e.graphic.setVisible(true);
        } else {
          e.graphic.setVisible(false);
        }
      }
    });

    // Hide items that are not discovered
    this.floorItems.forEach(i => {
      if (this.visibilityMap.isDiscovered(i.coord)) {
        i.sprite.setVisible(true);
        // Dim if discovered but not visible
        if (this.visibilityMap.isVisible(i.coord)) {
          i.sprite.setAlpha(1);
        } else {
          i.sprite.setAlpha(0.5);
        }
      } else {
        i.sprite.setVisible(false);
      }
    });
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

    this.minimapPresenter.drawMap(this.gridMap, this.staircaseCoord, this.visibilityMap);
    this.minimapPresenter.updateEntities(playerCoords, enemyCoords, this.visibilityMap);
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

    // Check if hovered tile has an alive enemy unit and is within melee range
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
    if (this.isProcessingAction || this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    // 1. If clicking on an active, unacted player unit, select it
    const clickedPlayerIndex = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && !p.hasActed && p.coord.equals(coord));
    if (clickedPlayerIndex !== -1) {
      this.selectedPlayerIndex = clickedPlayerIndex;
      this.combatForecastPresenter.hide();
      const validMoves = this.getValidMovesUseCase.execute(coord, 3); // 3 move range

      // Filter out tiles occupied by other alive units
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

    let actionTaken = false;

    // 2. If clicking on an alive enemy within melee range, execute attack
    const clickedEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));
    if (clickedEnemy) {
      const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
      if (dist === 1) { // Melee range
        this.isProcessingAction = true;
        this.combatForecastPresenter.hide();

        const summary = this.attackUnitUseCase.execute(selectedPlayer.unit, clickedEnemy.unit);

        const screenX = coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        const screenY = coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);

        await selectedPlayer.graphic.animateAttack(clickedEnemy.coord);
        await clickedEnemy.graphic.animateHit();

        this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt, summary.hasAdvantage, summary.hasDisadvantage);
        clickedEnemy.graphic.updateHp(clickedEnemy.unit.currentHp, clickedEnemy.unit.maxHp);

        if (summary.isFatal) {
          clickedEnemy.graphic.clear();
          this.hudPresenter.updateEnemies(this.enemySquad.filter(e => e.unit.currentHp > 0).length);
        }

        actionTaken = true;
        this.isProcessingAction = false;
        this.updateVisibility();
      }
    } else {
      // 3. Try to move to the empty valid tile
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
        selectedPlayer.coord = coord;
        await selectedPlayer.graphic.moveTo(coord);
        this.centerCameraOn(coord);

        // 4. Check for item pickup
        const itemIndex = this.floorItems.findIndex(i => i.coord.equals(coord));
        if (itemIndex !== -1) {
          const floorItem = this.floorItems[itemIndex]!;
          const message = this.pickupItemUseCase.execute(selectedPlayer.unit, floorItem.item);

          const screenX = coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
          const screenY = coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
          this.combatTextPresenter.showBanner(screenX, screenY, message);

          floorItem.sprite.destroy();
          this.floorItems.splice(itemIndex, 1);
        }

        actionTaken = true;
        this.isProcessingAction = false;
        this.updateVisibility();
      }
    }

    if (actionTaken) {
      selectedPlayer.hasActed = true;
      this.selectedPlayerIndex = null;
      this.gridPresenter.clearHighlights();
      // Gray out / darken exhausted player unit
      selectedPlayer.graphic.setExhausted(true);

      if (this.checkWinCondition()) {
        return;
      }

      // Check if all active players have acted
      const allActed = this.playerSquad.every(p => p.unit.currentHp <= 0 || p.hasActed);
      if (allActed) {
        this.phaseManager.advancePhase();
        this.hudPresenter.updatePhase('🔴 ENEMY');
        this.executeEnemyPhase();
      }
    }
  }

  private checkWinCondition(): boolean {
    const allEnemiesDead = this.enemySquad.every(e => e.unit.currentHp <= 0);
    const playerOnStaircase = this.playerSquad.some(p => p.unit.currentHp > 0 && p.coord.equals(this.staircaseCoord));

    if (allEnemiesDead || playerOnStaircase) {
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

    // Restore enemies to bright active state for their turn
    aliveEnemies.forEach(e => e.graphic.setExhausted(false));

    for (const enemyData of aliveEnemies) {
      await new Promise<void>(resolve => {
        this.time.delayedCall(350, async () => {
          // Re-update player and obstacle info in case someone moved or died
          const playerInfos = this.playerSquad
            .filter(p => p.unit.currentHp > 0)
            .map(p => ({ unit: p.unit, coord: p.coord }));

          const occupiedTiles = [
            ...this.playerSquad.filter(p => p.unit.currentHp > 0).map(p => p.coord),
            ...this.enemySquad.filter(e => e.unit.currentHp > 0).map(e => e.coord)
          ];

          this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, playerInfos, occupiedTiles);
          const result = this.executeEnemyTurnUseCase.execute(enemyData.unit, enemyData.coord);

          // Move enemy and await the movement tween to complete
          enemyData.coord = result.targetCoordinate;
          await enemyData.graphic.moveTo(enemyData.coord);
          this.updateVisibility();

          // Attack player if adjacent
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

          // Darken exhausted enemy unit
          enemyData.graphic.setExhausted(true);
          resolve();
        });
      });
    }

    this.isProcessingAction = false;
    this.updateVisibility();

    if (!this.checkWinCondition()) {
      this.phaseManager.advancePhase();
      this.hudPresenter.updatePhase('🔵 PLAYER');

      // Reset player acted states & restore bright active colors
      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          p.hasActed = false;
          p.graphic.setExhausted(false);
        }
      });

      // Center camera back on active player
      const nextActivePlayer = this.playerSquad.find(p => p.unit.currentHp > 0 && !p.hasActed);
      if (nextActivePlayer) {
        this.centerCameraOn(nextActivePlayer.coord);
      }
    }
  }
}
