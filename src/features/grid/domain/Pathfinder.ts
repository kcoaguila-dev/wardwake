import { TileCoordinate } from "./TileCoordinate";
import { GridMap } from "./GridMap";

export class Pathfinder {
  calculateReachableTiles(start: TileCoordinate, maxMovement: number, grid: GridMap, obstacles: TileCoordinate[] = []): TileCoordinate[] {
    const obstacleSet = new Set(obstacles.filter(o => !o.equals(start)).map(o => o.toString()));
    const reachable = new Map<string, TileCoordinate>();
    const queue: { coord: TileCoordinate; dist: number }[] = [];
    const visited = new Set<string>();

    queue.push({ coord: start, dist: 0 });
    visited.add(start.toString());

    // We add the start position to reachable as well
    reachable.set(start.toString(), start);

    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }   // Right
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.dist >= maxMovement) {
        continue;
      }

      for (const dir of directions) {
        const nextX = current.coord.x + dir.dx;
        const nextY = current.coord.y + dir.dy;
        const nextCoord = new TileCoordinate(nextX, nextY);
        const nextKey = nextCoord.toString();

        if (!visited.has(nextKey) && grid.isWalkable(nextCoord) && !obstacleSet.has(nextKey)) {
          visited.add(nextKey);
          reachable.set(nextKey, nextCoord);
          queue.push({ coord: nextCoord, dist: current.dist + 1 });
        }
      }
    }

    return Array.from(reachable.values());
  }

  findPath(start: TileCoordinate, target: TileCoordinate, grid: GridMap, obstacles: TileCoordinate[] = []): TileCoordinate[] {
    if (!grid.isWalkable(start)) return [];

    // If start is target, return path with just the start
    if (start.equals(target)) return [start];

    const obstacleSet = new Set(obstacles.filter(o => !o.equals(start) && !o.equals(target)).map(o => o.toString()));
    const queue: { coord: TileCoordinate; path: TileCoordinate[] }[] = [];
    const visited = new Set<string>();

    queue.push({ coord: start, path: [start] });
    visited.add(start.toString());

    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }   // Right
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.coord.equals(target)) {
        return current.path;
      }

      for (const dir of directions) {
        const nextX = current.coord.x + dir.dx;
        const nextY = current.coord.y + dir.dy;
        const nextCoord = new TileCoordinate(nextX, nextY);
        const nextKey = nextCoord.toString();

        if (!visited.has(nextKey) && grid.isWalkable(nextCoord) && !obstacleSet.has(nextKey)) {
          visited.add(nextKey);
          queue.push({ coord: nextCoord, path: [...current.path, nextCoord] });
        }
      }
    }

    return []; // No path found
  }
}
