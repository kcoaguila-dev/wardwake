import * as Phaser from 'phaser';

import { GridMap } from '../features/grid/domain/GridMap';
import { Pathfinder } from '../features/grid/domain/Pathfinder';
import { TileCoordinate } from '../features/grid/domain/TileCoordinate';
import { GridPresenter } from '../features/grid/presentation/GridPresenter';
import { InputPresenter } from '../features/ui/presentation/InputPresenter';
import { CombatTextPresenter } from '../features/ui/presentation/CombatTextPresenter';
import { PhaseManagerUseCase } from '../features/turn/application/PhaseManagerUseCase';
import { GetValidMovesUseCase } from '../features/grid/application/GetValidMovesUseCase';
import { AttackUnitUseCase } from '../features/combat/application/AttackUnitUseCase';
import { ExecuteEnemyTurnUseCase, PlayerUnitInfo } from '../features/ai/application/ExecuteEnemyTurnUseCase';
import { Unit } from '../features/combat/domain/Unit';
import { WeaponType } from '../features/combat/domain/WeaponType';
import { IAudioService } from '../features/combat/application/ports/IAudioService';
import { TurnState } from '../features/turn/domain/TurnState';

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

  // Domain
  private gridMap!: GridMap;
  private pathfinder!: Pathfinder;

  // State
  private playerSquad!: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: Phaser.GameObjects.Graphics }[];
  private enemySquad!: { unit: Unit; coord: TileCoordinate; hasActed: boolean; graphic: Phaser.GameObjects.Graphics }[];
  private floorCount: number = 1;
  private floorText!: Phaser.GameObjects.Text;
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

    // 3. Initialize Units
    this.playerSquad = [
      { unit: new Unit('p1', 'Sword Fighter', 20, 5, 2, WeaponType.SWORD), coord: new TileCoordinate(1, 1), hasActed: false, graphic: this.add.graphics() },
      { unit: new Unit('p2', 'Lance Knight', 22, 6, 3, WeaponType.LANCE), coord: new TileCoordinate(1, 2), hasActed: false, graphic: this.add.graphics() }
    ];

    this.enemySquad = [
      { unit: new Unit('e1', 'Axe Warrior', 15, 6, 1, WeaponType.AXE), coord: new TileCoordinate(8, 7), hasActed: false, graphic: this.add.graphics() },
      { unit: new Unit('e2', 'Sword Guard', 18, 4, 3, WeaponType.SWORD), coord: new TileCoordinate(8, 8), hasActed: false, graphic: this.add.graphics() }
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

    this.playerSquad.forEach(p => this.updateGraphic(p.graphic, p.coord, 0x0000ff)); // Blue
    this.enemySquad.forEach(e => this.updateGraphic(e.graphic, e.coord, 0xff0000)); // Red

    // Display floor
    this.floorText = this.add.text(10, 330, `Floor ${this.floorCount}`, { fontSize: '20px', color: '#ffffff' });

    // 6. Setup Input Listeners
    this.events.on('ON_TILE_CLICKED', this.onTileClicked, this);
  }

  private onTileClicked(coord: TileCoordinate) {
    if (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    // 1. If clicking on an active, unacted player unit, select it
    const clickedPlayerIndex = this.playerSquad.findIndex(p => p.unit.currentHp > 0 && !p.hasActed && p.coord.equals(coord));
    if (clickedPlayerIndex !== -1) {
      this.selectedPlayerIndex = clickedPlayerIndex;
      const validMoves = this.getValidMovesUseCase.execute(coord, 3); // 3 move range

      // Filter out tiles occupied by other alive units
      const filteredMoves = validMoves.filter(move => {
        const hasOtherPlayer = this.playerSquad.some((p, i) => i !== clickedPlayerIndex && p.unit.currentHp > 0 && p.coord.equals(move));
        const hasEnemy = this.enemySquad.some(e => e.unit.currentHp > 0 && e.coord.equals(move));
        return !hasOtherPlayer && !hasEnemy;
      });

      this.gridPresenter.highlightWalkableArea(filteredMoves);
      return;
    }

    if (this.selectedPlayerIndex === null) {
      return; // No unit selected
    }

    const selectedPlayer = this.playerSquad[this.selectedPlayerIndex];
    let actionTaken = false;

    // 2. If clicking on an alive enemy, try to attack
    const clickedEnemy = this.enemySquad.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));
    if (clickedEnemy) {
      const dist = Math.abs(selectedPlayer.coord.x - coord.x) + Math.abs(selectedPlayer.coord.y - coord.y);
      if (dist === 1) { // Melee range
        const summary = this.attackUnitUseCase.execute(selectedPlayer.unit, clickedEnemy.unit);

        const screenX = coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        const screenY = coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt);

        if (summary.isFatal) {
          clickedEnemy.graphic.clear();
        }
        actionTaken = true;
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
        this.updateGraphic(selectedPlayer.graphic, selectedPlayer.coord, 0x0000ff);
        actionTaken = true;
      }
    }

    if (actionTaken) {
      selectedPlayer.hasActed = true;
      this.selectedPlayerIndex = null;
      this.gridPresenter.clearHighlights();
      this.updateGraphic(selectedPlayer.graphic, selectedPlayer.coord, 0x5555ff); // Change color to indicate it acted

      if (this.checkWinCondition()) {
        return;
      }

      // Check if all active players have acted
      const allActed = this.playerSquad.every(p => p.unit.currentHp <= 0 || p.hasActed);
      if (allActed) {
        this.phaseManager.advancePhase();
        this.executeEnemyPhase();
      }
    }
  }

  private checkWinCondition() {
    const allEnemiesDead = this.enemySquad.every(e => e.unit.currentHp <= 0);
    const playerOnStaircase = this.playerSquad.some(p => p.unit.currentHp > 0 && p.coord.equals(this.staircaseCoord));

    if (allEnemiesDead || playerOnStaircase) {
      this.floorCount++;
      this.floorText.setText(`Floor ${this.floorCount}`);

      const banner = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'FLOOR CLEARED', {
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
    this.playerSquad[0].coord = new TileCoordinate(1, 1);
    this.playerSquad[1].coord = new TileCoordinate(1, 2);

    this.playerSquad.forEach(p => {
      p.unit.currentHp = p.unit.maxHp;
      p.hasActed = false;
      this.updateGraphic(p.graphic, p.coord, 0x0000ff);
    });

    // Reset enemies
    this.enemySquad[0].coord = new TileCoordinate(8, 7);
    this.enemySquad[1].coord = new TileCoordinate(8, 8);

    this.enemySquad.forEach(e => {
      e.unit.currentHp = e.unit.maxHp;
      e.hasActed = false;
      this.updateGraphic(e.graphic, e.coord, 0xff0000);
    });

    this.selectedPlayerIndex = null;
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
        this.time.delayedCall(500, () => {
          // Re-update player info for the use case in case someone died or moved
          const playerInfos = this.playerSquad
            .filter(p => p.unit.currentHp > 0)
            .map(p => ({ unit: p.unit, coord: p.coord }));

          this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, playerInfos);
          const result = this.executeEnemyTurnUseCase.execute(enemyData.unit, enemyData.coord);

          // Move enemy
          enemyData.coord = result.targetCoordinate;
          this.updateGraphic(enemyData.graphic, enemyData.coord, 0xff0000);

          // Attack player if in range
          if (result.targetToAttack) {
            const targetPlayer = this.playerSquad.find(p => p.unit.id === result.targetToAttack!.id);
            if (targetPlayer) {
              const summary = this.attackUnitUseCase.execute(enemyData.unit, targetPlayer.unit);

              const screenX = targetPlayer.coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
              const screenY = targetPlayer.coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
              this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt);

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
      // Reset player acted states
      this.playerSquad.forEach(p => {
        if (p.unit.currentHp > 0) {
          p.hasActed = false;
          this.updateGraphic(p.graphic, p.coord, 0x0000ff);
        }
      });
    }
  }

  private updateGraphic(graphic: Phaser.GameObjects.Graphics, coord: TileCoordinate, color: number) {
    graphic.clear();
    graphic.fillStyle(color, 1);
    graphic.fillRect(
      coord.x * GridPresenter.TILE_SIZE + 4,
      coord.y * GridPresenter.TILE_SIZE + 4,
      GridPresenter.TILE_SIZE - 8,
      GridPresenter.TILE_SIZE - 8
    );
  }
}
