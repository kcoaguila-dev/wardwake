import { DungeonGenerator } from "../../../src/features/grid/domain/DungeonGenerator";
import { TileCoordinate } from "../../../src/features/grid/domain/TileCoordinate";
import { Room } from "../../../src/features/grid/domain/BspNode";

describe("DungeonGenerator", () => {
  it("should generate rooms that do not overlap", () => {
    const generator = new DungeonGenerator(30, 30);
    // Note: We need access to rooms to test overlap easily.
    // Since rooms is private, we will mock it or expose it for testing,
    // or test indirectly by re-implementing overlap check via map?
    // Let's modify DungeonGenerator to expose a getter for rooms for testing purposes
    // Or we can just access it using bracket notation as a workaround in JS/TS tests
    generator.generate();

    const rooms = (generator as any).rooms as Room[];

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const r1 = rooms[i];
        const r2 = rooms[j];

        if (!r1 || !r2) continue;

        const overlap = !(
          r1.x >= r2.x + r2.width ||
          r1.x + r1.width <= r2.x ||
          r1.y >= r2.y + r2.height ||
          r1.y + r1.height <= r2.y
        );

        expect(overlap).toBe(false);
      }
    }
  });

  it("should generate a map where all walkable tiles are connected", () => {
    const width = 30;
    const height = 30;
    const generator = new DungeonGenerator(width, height);
    const map = generator.generate();

    // Find first walkable tile
    let startTile: TileCoordinate | null = null;
    let totalWalkable = 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const coord = new TileCoordinate(x, y);
        if (map.isWalkable(coord)) {
          totalWalkable++;
          if (!startTile) {
            startTile = coord;
          }
        }
      }
    }

    expect(startTile).not.toBeNull();

    // Flood fill to count reachable walkable tiles
    const visited = new Set<string>();
    const queue: TileCoordinate[] = [startTile!];
    visited.add(startTile!.toString());

    let reachableCount = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      reachableCount++;

      const neighbors = [
        new TileCoordinate(current.x + 1, current.y),
        new TileCoordinate(current.x - 1, current.y),
        new TileCoordinate(current.x, current.y + 1),
        new TileCoordinate(current.x, current.y - 1)
      ];

      for (const neighbor of neighbors) {
        if (map.isWalkable(neighbor) && !visited.has(neighbor.toString())) {
          visited.add(neighbor.toString());
          queue.push(neighbor);
        }
      }
    }

    // All walkable tiles should be reachable from the start tile
    expect(reachableCount).toBe(totalWalkable);
  });

  it("should generate a GridMap with at least some rooms", () => {
    const generator = new DungeonGenerator(20, 20);
    const map = generator.generate();
    expect(map).toBeDefined();

    let walkableCount = 0;
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        if (map.isWalkable(new TileCoordinate(x, y))) {
          walkableCount++;
        }
      }
    }
    expect(walkableCount).toBeGreaterThan(0);
  });
});
