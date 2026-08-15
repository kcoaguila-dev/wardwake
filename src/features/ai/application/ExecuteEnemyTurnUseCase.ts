import { GridMap } from '../../grid/domain/GridMap';
import { Pathfinder } from '../../grid/domain/Pathfinder';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { Unit } from '../../combat/domain/Unit';

export interface PlayerUnitInfo {
  unit: Unit;
  coord: TileCoordinate;
}

export interface EnemyTurnResult {
  targetCoordinate: TileCoordinate;
  targetToAttack: Unit | null;
}

export class ExecuteEnemyTurnUseCase {
  constructor(
    private readonly grid: GridMap,
    private readonly pathfinder: Pathfinder,
    private readonly playerUnits: PlayerUnitInfo[],
    private readonly occupiedTiles: TileCoordinate[] = []
  ) {}


  private checkLineOfSight(start: TileCoordinate, end: TileCoordinate): boolean {
    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
      if (x0 !== start.x || y0 !== start.y) {
        if (!this.grid.isWalkable(new TileCoordinate(x0, y0))) {
          return false;
        }
      }
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    return true;
  }

  execute(enemyUnit: Unit, enemyCoord: TileCoordinate): EnemyTurnResult {
    if (enemyUnit.statusTurns > 0 && (enemyUnit.statusEffect === 'SLEEP' || enemyUnit.statusEffect === 'PETRIFIED')) {
      enemyUnit.decrementStatus();
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    if (this.playerUnits.length === 0) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    // 1. Find the closest player unit by Manhattan distance
    let closestPlayer: PlayerUnitInfo | null = null;
    let minDistance = Infinity;

    for (const playerInfo of this.playerUnits) {
      const dist = Math.abs(playerInfo.coord.x - enemyCoord.x) + Math.abs(playerInfo.coord.y - enemyCoord.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestPlayer = playerInfo;
      }
    }

    if (!closestPlayer) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    // Check detection radius
    if (minDistance > enemyUnit.detectionRadius) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    // Check ranged attack
    if (enemyUnit.attackRange > 1 && minDistance <= enemyUnit.attackRange) {
      if (this.checkLineOfSight(enemyCoord, closestPlayer.coord)) {
        return {
          targetCoordinate: enemyCoord,
          targetToAttack: closestPlayer.unit
        };
      }
    }

    // 2. If already adjacent, no need to move, just attack
    if (minDistance === 1) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: closestPlayer.unit
      };
    }

    // 3. Build a dynamic pathfinding grid that treats other occupied tiles as obstacles
    const dynamicGrid = new GridMap(this.grid.width, this.grid.height);
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        const c = new TileCoordinate(x, y);
        if (!this.grid.isWalkable(c)) {
          dynamicGrid.addObstacle(c);
        }
      }
    }

    // Add occupied tiles (other enemies and other players) as obstacles, except start and target player
    for (const occupied of this.occupiedTiles) {
      if (!occupied.equals(enemyCoord) && !occupied.equals(closestPlayer.coord)) {
        dynamicGrid.addObstacle(occupied);
      }
    }

    // Find path using dynamic grid
    let path = this.pathfinder.findPath(enemyCoord, closestPlayer.coord, dynamicGrid);

    // Fallback: If blocked by allies, pathfind on standard grid to at least move closer
    if (path.length === 0) {
      path = this.pathfinder.findPath(enemyCoord, closestPlayer.coord, this.grid);
    }

    if (path.length === 0) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    // 4. Traverse up to movement range (3 tiles)
    const movementRange = 3;
    let targetCoordinate = enemyCoord;
    let targetToAttack: Unit | null = null;

    for (let i = 1; i < path.length; i++) {
      if (i > movementRange) {
        break;
      }

      const nextCoord = path[i];
      if (!nextCoord) {
        break;
      }

      if (nextCoord.equals(closestPlayer.coord)) {
        // Adjacent to player (this step would land on player)
        targetToAttack = closestPlayer.unit;
        break;
      }

      // Check if tile is occupied by another unit (cannot stop on top of another unit)
      const isOccupied = this.occupiedTiles.some(o => !o.equals(enemyCoord) && o.equals(nextCoord));
      if (isOccupied) {
        // Cannot pass through or stop on occupied tile
        break;
      }

      targetCoordinate = nextCoord;
    }

    // After moving, check if adjacent to the player to strike
    const finalDistToPlayer = Math.abs(closestPlayer.coord.x - targetCoordinate.x) + Math.abs(closestPlayer.coord.y - targetCoordinate.y);
    if (finalDistToPlayer === 1) {
      targetToAttack = closestPlayer.unit;
    }

    return {
      targetCoordinate,
      targetToAttack
    };
  }
}
