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
  private playerUnit!: Unit;
  private playerCoord!: TileCoordinate;
  private enemyUnit!: Unit;
  private enemyCoord!: TileCoordinate;
  private playerUnits!: PlayerUnitInfo[];

  // Visuals
  private playerGraphic!: Phaser.GameObjects.Graphics;
  private enemyGraphic!: Phaser.GameObjects.Graphics;

  constructor() {
    super('MainGameScene');
  }

  create() {
    // 1. Initialize Domain
    this.gridMap = new GridMap(10, 10);
    this.pathfinder = new Pathfinder();

    // 2. Initialize Presenters
    this.gridPresenter = new GridPresenter(this);
    this.inputPresenter = new InputPresenter(this);
    this.combatTextPresenter = new CombatTextPresenter(this);

    // 3. Initialize Units
    this.playerUnit = new Unit('p1', 'Player', 20, 5, 2, WeaponType.SWORD);
    this.playerCoord = new TileCoordinate(2, 2);

    this.enemyUnit = new Unit('e1', 'Enemy', 15, 4, 1, WeaponType.AXE);
    this.enemyCoord = new TileCoordinate(7, 7);

    this.playerUnits = [{ unit: this.playerUnit, coord: this.playerCoord }];

    // 4. Initialize Use Cases
    this.phaseManager = new PhaseManagerUseCase();
    this.getValidMovesUseCase = new GetValidMovesUseCase(this.gridMap, this.pathfinder);
    this.attackUnitUseCase = new AttackUnitUseCase(new DummyAudioService());
    this.executeEnemyTurnUseCase = new ExecuteEnemyTurnUseCase(this.gridMap, this.pathfinder, this.playerUnits);

    // 5. Draw Initial State
    this.gridPresenter.drawGrid(this.gridMap);

    this.playerGraphic = this.add.graphics();
    this.updateGraphic(this.playerGraphic, this.playerCoord, 0x0000ff); // Blue for player

    this.enemyGraphic = this.add.graphics();
    this.updateGraphic(this.enemyGraphic, this.enemyCoord, 0xff0000); // Red for enemy

    // 6. Setup Input Listeners
    this.events.on('ON_TILE_CLICKED', this.onTileClicked, this);
  }

  private onTileClicked(coord: TileCoordinate) {
    if (this.phaseManager.getPhase() !== TurnState.PLAYER_PHASE) {
      return;
    }

    let actionTaken = false;

    // Check if clicked tile contains enemy
    if (this.enemyUnit.currentHp > 0 && coord.equals(this.enemyCoord)) {
      // Calculate Manhattan distance to check if adjacent
      const dist = Math.abs(this.playerCoord.x - coord.x) + Math.abs(this.playerCoord.y - coord.y);
      if (dist === 1) {
        // Attack enemy
        const summary = this.attackUnitUseCase.execute(this.playerUnit, this.enemyUnit);

        const screenX = coord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        const screenY = coord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt);

        if (summary.isFatal) {
          this.enemyGraphic.clear();
        }
        actionTaken = true;
      }
    } else {
      // Check for valid move
      const validMoves = this.getValidMovesUseCase.execute(this.playerCoord, 3);
      const isReachable = validMoves.some(move => move.equals(coord));

      if (isReachable) {
        // Update player coord
        this.playerCoord = coord;
        this.playerUnits[0].coord = coord; // Update array reference
        this.updateGraphic(this.playerGraphic, this.playerCoord, 0x0000ff);
        actionTaken = true;
      }
    }

    if (actionTaken) {
      this.phaseManager.advancePhase();
      // To implement Enemy phase, we will need to trigger it here or in update.
      // Since it's turn-based, we'll trigger it explicitly.
      this.executeEnemyPhase();
    }
  }

  private executeEnemyPhase() {
    if (this.enemyUnit.currentHp <= 0) {
      // Enemy is dead, skip turn
      this.phaseManager.advancePhase();
      return;
    }

    this.time.delayedCall(500, () => {
      // Recheck in case game state changed
      if (this.phaseManager.getPhase() !== TurnState.ENEMY_PHASE) {
        return;
      }

      const result = this.executeEnemyTurnUseCase.execute(this.enemyUnit, this.enemyCoord);

      // Move enemy
      this.enemyCoord = result.targetCoordinate;
      this.updateGraphic(this.enemyGraphic, this.enemyCoord, 0xff0000);

      // Attack player if in range
      if (result.targetToAttack) {
        const summary = this.attackUnitUseCase.execute(this.enemyUnit, this.playerUnit);

        const screenX = this.playerCoord.x * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        const screenY = this.playerCoord.y * GridPresenter.TILE_SIZE + (GridPresenter.TILE_SIZE / 2);
        this.combatTextPresenter.showDamage(screenX, screenY, summary.damageDealt);

        if (summary.isFatal) {
          this.playerGraphic.clear();
        }
      }

      this.phaseManager.advancePhase();
    });
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
