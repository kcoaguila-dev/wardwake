import { TileCoordinate } from "../../grid/domain/TileCoordinate";
import { GridMap } from "../../grid/domain/GridMap";
import { Pathfinder } from "../../grid/domain/Pathfinder";

export class FollowFormationCalculator {
  constructor(private pathfinder: Pathfinder) {}

  /**
   * Calculates the coordinate a follower should move to when following a leader.
   * If the follower is adjacent to any enemy, they should not follow (returns null).
   * Otherwise, the follower moves along the path to the leader's previous coordinate,
   * up to their max movement.
   */
  calculateFollowerDestination(
    followerCoord: TileCoordinate,
    leaderPreviousCoord: TileCoordinate,
    enemyCoords: TileCoordinate[],
    occupiedTiles: TileCoordinate[],
    grid: GridMap,
    maxMovement: number
  ): TileCoordinate | null {
    // Check if follower is adjacent to any enemy
    const isAdjacentToEnemy = enemyCoords.some(enemyCoord => {
      const dist = Math.abs(followerCoord.x - enemyCoord.x) + Math.abs(followerCoord.y - enemyCoord.y);
      return dist === 1;
    });

    if (isAdjacentToEnemy) {
      return null; // Engage nearby enemies or wait for tactical command
    }

    // Temporarily add occupied tiles as obstacles to find a clear path,
    // EXCEPT for the follower's current position and leader's previous position (target).
    // Note: The leader has moved, so leaderPreviousCoord should theoretically be empty or occupied by something else,
    // but we want to pathfind to it.

    // Actually, Pathfinder only checks grid.isWalkable. So we need a temporary grid.
    const tempGrid = new GridMap(grid.width, grid.height);

    // Copy blocked tiles from the original grid
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        const coord = new TileCoordinate(x, y);
        if (!grid.isWalkable(coord)) {
          tempGrid.addObstacle(coord);
        }
      }
    }

    // Add occupied tiles as obstacles
    for (const occupied of occupiedTiles) {
      if (!occupied.equals(followerCoord) && !occupied.equals(leaderPreviousCoord)) {
        tempGrid.addObstacle(occupied);
      }
    }

    const path = this.pathfinder.findPath(followerCoord, leaderPreviousCoord, tempGrid);

    if (path.length === 0) {
      return null;
    }

    // Path includes the start node at index 0.
    // So if maxMovement is 3, we can reach up to index 3 in the path array.
    // We want the furthest tile on the path that is within maxMovement.

    let targetIndex = Math.min(path.length - 1, maxMovement);

    // Ensure the chosen target tile is not occupied.
    // (We didn't add leaderPreviousCoord as an obstacle, so it could technically be occupied if another unit moved there).
    while (targetIndex > 0) {
      const candidateCoord = path[targetIndex];
      if (candidateCoord) {
        const isOccupied = occupiedTiles.some(t => t.equals(candidateCoord) && !t.equals(followerCoord));
        if (!isOccupied) {
          return candidateCoord;
        }
      }
      targetIndex--;
    }

    return followerCoord;
  }
}
