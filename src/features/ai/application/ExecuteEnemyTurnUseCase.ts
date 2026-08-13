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
    private readonly playerUnits: PlayerUnitInfo[]
  ) {}

  execute(enemyUnit: Unit, enemyCoord: TileCoordinate): EnemyTurnResult {
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

    // 2. If already adjacent, no need to move, just attack
    if (minDistance === 1) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: closestPlayer.unit
      };
    }

    // 3. Find path to closest player
    // Note: To find a path, the target tile itself shouldn't be considered an obstacle by our generic BFS if we want to reach it,
    // or we might want to path to a tile *adjacent* to it.
    // Wait, our `Pathfinder.findPath` returns a path if `grid.isWalkable()` is true for all steps.
    // If the player is on a tile, does `grid.isWalkable()` return true?
    // According to GridMap.ts, blockedTiles only tracks explicit obstacles. Units don't automatically block tiles in GridMap unless explicitly added as obstacles.
    // We assume GridMap only knows about static obstacles, or we just path towards the player unit's coordinate.

    // We will just find a path to the player's coordinate.
    const path = this.pathfinder.findPath(enemyCoord, closestPlayer.coord, this.grid);

    // If no path found (player surrounded by obstacles, or unreachable)
    if (path.length === 0) {
      return {
        targetCoordinate: enemyCoord,
        targetToAttack: null
      };
    }

    // 4. Move up to movement range (assume fixed range, e.g., 3 for basic AI, but if we don't have a parameter let's say 3)
    // Actually, Unit class doesn't have a movement attribute right now.
    // I will default movement range to 3.
    const movementRange = 3;

    // path includes start at index 0. We can move up to `movementRange` steps.
    // So index `movementRange` in the path array is the max distance we can reach.
    // If path length is shorter than movementRange + 1, we can reach the player (which means we will be on top of the player).
    // Wait, we can't move onto the player's tile. We must stop *adjacent* to the player.
    // So the final target we want is the tile in the path right before the player's tile.

    let targetCoordinate = enemyCoord;
    let targetToAttack: Unit | null = null;

    // The path ends at the player. We want to traverse up to movementRange steps.
    for (let i = 1; i < path.length; i++) { // start at 1 because 0 is enemyCoord
      if (i > movementRange) {
        break; // can't move further
      }

      const nextCoord = path[i];
      if (nextCoord.equals(closestPlayer.coord)) {
        // we are adjacent to the player (this step would land on the player)
        targetToAttack = closestPlayer.unit;
        break;
      }

      targetCoordinate = nextCoord;
    }

    // Now, after we moved, are we adjacent to the player?
    // Recalculate Manhattan distance from our final targetCoordinate to the player.
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
