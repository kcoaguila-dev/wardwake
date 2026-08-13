import { TileCoordinate } from "./TileCoordinate";
import { GridMap } from "./GridMap";

export class Pathfinder {
  calculateReachableTiles(start: TileCoordinate, maxMovement: number, grid: GridMap): TileCoordinate[] {
    if (!grid.isWalkable(start) && maxMovement >= 0) {
       // Optionally we could just return start if it's the current position,
       // but typically unit is on a walkable tile. Let's return just start if we want to be safe or empty array.
       // We'll proceed assuming standard BFS where we only queue valid moves, and start is valid.
    }

    const reachable = new Map<string, TileCoordinate>();
    const queue: { coord: TileCoordinate; dist: number }[] = [];
    const visited = new Set<string>();

    queue.push({ coord: start, dist: 0 });
    visited.add(start.toString());

    // We add the start position to reachable as well (optional, but standard for 'range')
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

        if (!visited.has(nextKey) && grid.isWalkable(nextCoord)) {
          visited.add(nextKey);
          reachable.set(nextKey, nextCoord);
          queue.push({ coord: nextCoord, dist: current.dist + 1 });
        }
      }
    }

    return Array.from(reachable.values());
  }
}
