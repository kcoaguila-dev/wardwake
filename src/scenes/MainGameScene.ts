import * as Phaser from 'phaser';

import { GridMap } from '../features/grid/domain/GridMap';
import { Pathfinder } from '../features/grid/domain/Pathfinder';
import { TileCoordinate } from '../features/grid/domain/TileCoordinate';
import { GridPresenter } from '../features/grid/presentation/GridPresenter';
import { InputPresenter } from '../features/ui/presentation/InputPresenter';
import { CombatTextPresenter } from '../features/ui/presentation/CombatTextPresenter';
import { CombatForecastPresenter } from '../features/ui/presentation/CombatForecastPresenter';
import { PhaseManagerUseCase } from '../features/turn/application/PhaseManagerUseCase';
import { GetValidMovesUseCase } from '../features/grid/application/GetValidMovesUseCase';
import { AttackUnitUseCase } from '../features/combat/application/AttackUnitUseCase';
import { ExecuteEnemyTurnUseCase, PlayerUnitInfo } from '../features/ai/application/ExecuteEnemyTurnUseCase';
import { Unit } from '../features/combat/domain/Unit';
import { WeaponType } from '../features/combat/domain/WeaponType';
import { IAudioService } from '../features/combat/application/ports/IAudioService';
import { TurnState } from '../features/turn/domain/TurnState';
import { UnitPresenter } from '../features/combat/presentation/UnitPresenter';
import { HudPresenter } from '../features/ui/presentation/HudPresenter';

class DummyAudioService implements IAudioService {
  playSound(soundId: string): void {
    console.log(`Sound played: ${soundId}`);
  }
}

export class MainGameScene extends Phaser.Scene {
  // Use Cases
  private phaseManager!: PhaseManagerUseCase;
  private getValidMovesUseCase!: GetValidMovesUseCase;
  private attackUnitUseCase!: AttackUnitUseCase;
  private executeEnemyTurnUseCase!: ExecuteEnemyTurnUseCase;

  // Presenters
  private gridPresenter!: GridPresenter;
  private inputPresenter!: InputPresenter;
  private combatTextPresenter!: CombatTextPresenter;
  private hudPresenter!: HudPresenter;
  private combatForecastPresenter!: CombatForecastPresenter;

  // Domain
  private gridMap!: GridMap;
  private pathfinder!: Pathfinder;

  // State
  private playerSquad!: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[];
  private enemySquad!: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: UnitPresenter }[];
  private floorCount: number = 1;
  private staircaseCoord!: TileCoordinate;
  private selectedPlayerIndex: number | null = null;

  constructor() {
    super('MainGameScene');
  }

  create() {
    // 1. Initialize Domain
    this.gridMap = new GridMap(10, 10);
    this.pathfinder = new Pathfinder();

    // Setup Map Obstacles
    // Room 1: x: 0-3, Room 2: x: 6-9
    // Corridor: x: 4-5, y: 4-5
    for (let y = 0; y < 10; y++) {
      if (y !== 4 && y !== 5) {
        this.gridMap.addObstacle(new TileCoordinate(4, y));
        this.gridMap.addObstacle(new TileCoordinate(5, y));
      }
    }

    this.staircaseCoord = new TileCoordinate(9, 9);

    // 2. Initialize Presenters
    this.gridPresenter = new GridPresenter(this);
    this.inputPresenter = new InputPresenter(this);
    this.combatTextPresenter = new CombatTextPresenter(this);
    this.hudPresenter = new HudPresenter(this);
    this.combatForecastPresenter = new CombatForecastPresenter(this);

    // Adjust Camera to make room for HUD
    this.cameras.main.scrollY = -40;

    // 3. Initialize Units
    const p1Unit = new Unit('p1', 'Sword Fighter', 20, 5, 2, WeaponType.SWORD);
    const p1Coord = new TileCoordinate(1, 1);
    const p2Unit = new Unit('p2', 'Lance Knight', 22, 6, 3, WeaponType.LANCE);
    const p2Coord = new TileCoordinate(1, 2);

    this.playerSquad = [
      { unit: p1Unit, coord: p1Coord, hasActed: false, graphic: new UnitPresenter(this, p1Unit, p1Coord) },
      { unit: p2Unit, coord: p2Coord, hasActed: false, graphic: new UnitPresenter(this, p2Unit, p2Coord) }
    ];

    const e1Unit = new Unit('e1', 'Axe Warrior', 15, 6, 1, WeaponType.AXE);
    const e1Coord = new TileCoordinate(8, 7);
    const e2Unit = new Unit('e2', 'Sword Guard', 18, 4, 3, WeaponType.SWORD);
    const e2Coord = new TileCoordinate(8, 8);

    this.enemySquad = [
      { unit: e1Unit, coord: e1Coord, hasActed: false, graphic: new UnitPresenter(this, e1Unit, e1Coord) },
      { unit: e2Unit, coord: e2Coord, hasActed: false, graphic: new UnitPresenter(this, e2Unit, e2Coord) }
    ];

    // 4. Initialize Use Cases
    this.phaseManager = new PhaseManagerUseCase();
    this.getValidMovesUseCase = new GetValidMovesUseCase(this.gridMap, this.pathfinder);
    this.attackUnitUseCase = new AttackUnitUseCase(new DummyAudioService());

    // Create player unit info array for enemy AI
    const playerUnitInfos = this.playerSquad.map(p => ({ unit: p.unit, coord: p.coord }));
    this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, playerUnitInfos);

    // 5. Draw Initial State
    this.gridPresenter.drawGrid(this.gridMap);
    this.gridPresenter.drawStaircase(this.staircaseCoord);

    this.playerSquad.forEach(p => {
      p.graphic.setTint(0x0000ff);
      p.graphic.updateHp(p.unit.currentHp, p.unit.maxHp);
    });

    this.enemySquad.forEach(e => {
      e.graphic.setTint(0xff0000);
      e.graphic.updateHp(e.unit.currentHp, e.unit.maxHp);
    });

    this.hudPresenter.updateFloor(this.floorCount);
    this.hudPresenter.updatePhase('🔵 PLAYER');
    this.hudPresenter.updateEnemies(this.enemySquad.length);

    // 6. Setup Input Listeners
    this.events.on('ON_TILE_CLICKED', this.onTileClicked, this);
    this.events.on('ON_TILE_HOVER', this.onTileHover, this);
  }

  private onTileHover(coord: TileCoordinate) {
    if (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
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
    if (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
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
      // Trigger a hover update manually using the currently hovered coordinate if we just selected,
      // but pointer move should handle most of it.
      return;
    }

    if (this.selectedPlayerIndex === null) {
      return; // No unit selected
    }

    const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
    if (!selectedPlayer) {
      return;
    }

    let actionTaken = false;

    // 2. If clicking on an alive enemy, try to attack
    const clickedEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));
    if (clickedEnemy) {
      const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
      if (dist === 1) { // Melee range
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
        this.combatForecastPresenter.hide();
      }
    } else {
      // 3. Try to move to the empty valid tile
      const validMoves = this.getValidMovesUseCase.execute(selectedPlayer.coord, 3);

      // Filter again just to be safe
      const filteredMoves = validMoves.filter(move => {
        const hasOtherPlayer = this.playerSquad.some(p => p.unit.id !== selectedPlayer.unit.id && p.unit.currentHp > 0 && p.coord.equals(move));
        const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
        return !hasOtherPlayer && !hasEnemy;
      });

      const isReachable = filteredMoves.some(move => move.equals(coord));

      if (isReachable) {
        selectedPlayer.coord = coord;
        selectedPlayer.graphic.moveTo(coord);
        selectedPlayer.graphic.setTint(0x0000ff);
        actionTaken = true;
        this.combatForecastPresenter.hide();
      }
    }

    if (actionTaken) {
      selectedPlayer.hasActed = true;
      this.selectedPlayerIndex = null;
      this.gridPresenter.clearHighlights();
      selectedPlayer.graphic.setTint(0x5555ff); // Change color to indicate it acted

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

  private checkWinCondition() {
    const allEnemiesDead = this.enemySquad.every(e => e.unit.currentHp <= 0);
    const playerOnStaircase = this.playerSquad.some(p => p.unit.currentHp > 0 && p.coord.equals(this.staircaseCoord));

    if (allEnemiesDead || playerOnStaircase) {
      this.floorCount++;
      this.hudPresenter.updateFloor(this.floorCount);

      const banner = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 40, 'FLOOR CLEARED', {
        fontSize: '40px',
        color: '#ffff00',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        banner.destroy();
        this.resetFloor();
      });

      return true;
    }
    return false;
  }

  private resetFloor() {
    // Reset players
    this.playerSquad[0]!.coord = new TileCoordinate(1, 1);
    this.playerSquad[1]!.coord = new TileCoordinate(1, 2);

    this.playerSquad.forEach(p => {
      p.unit.currentHp = p.unit.maxHp;
      p.hasActed = false;
      p.graphic.moveTo(p.coord);
      p.graphic.setTint(0x0000ff);
      p.graphic.updateHp(p.unit.currentHp, p.unit.maxHp);
    });

    // Reset enemies
    this.enemySquad[0]!.coord = new TileCoordinate(8, 7);
    this.enemySquad[1]!.coord = new TileCoordinate(8, 8);

    this.enemySquad.forEach(e => {
      e.unit.currentHp = e.unit.maxHp;
      e.hasActed = false;
      e.graphic.moveTo(e.coord);
      e.graphic.setTint(0xff0000);
      e.graphic.updateHp(e.unit.currentHp, e.unit.maxHp);
    });

    this.hudPresenter.updateFloor(this.floorCount);
    this.hudPresenter.updateEnemies(this.enemySquad.length);

    this.selectedPlayerIndex = null;
    this.combatForecastPresenter.hide();
    this.gridPresenter.clearHighlights();

    // Ensure phase manager goes back to PLAYER_PHASE if it somehow wasn't (e.g. cleared on enemy turn)
    while (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      this.phaseManager.advancePhase();
    }
  }

  private async executeEnemyPhase() {
    if (this.phaseManager.getPhase() !== TurnState.ENEMY_PHASE) {
      return;
    }

    const aliveEnemies = this.enemySquad.filter(e => e.unit.currentHp > 0);

    for (const enemyData of aliveEnemies) {
      // Small delay between enemy actions
      await new Promise<void>(resolve => {
        this.time.delayedCall(500, async () => {
          // Re-update player info for the use case in case someone died or moved
          const playerInfos = this.playerSquad
            .filter(p => p.unit.currentHp > 0)
            .map(p => ({ unit: p.unit, coord: p.coord }));

          this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, playerInfos);
          const result = this.executeEnemyTurnUseCase.execute(enemyData.unit, enemyData.coord);

          // Move enemy
          enemyData.coord = result.targetCoordinate;
          enemyData.graphic.moveTo(enemyData.coord);
          enemyData.graphic.setTint(0xff0000);

          // Attack player if in range
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
          resolve();
        });
      });
    }

    if (!this.checkWinCondition()) {
      this.phaseManager.advancePhase();
      this.hudPresenter.updatePhase('🔵 PLAYER');
      // Reset player acted states
      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          p.hasActed = false;
          p.graphic.setTint(0x0000ff);
        }
      });
    }
  }
}
