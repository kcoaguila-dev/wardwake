import { Pathfinder } from "../../../src/features/grid/domain/Pathfinder";
import { GridMap } from "../../../src/features/grid/domain/GridMap";
import { TileCoordinate } from "../../../src/features/grid/domain/TileCoordinate";

describe("Pathfinder", () => {
  let pathfinder: Pathfinder;
  let grid: GridMap;

  beforeEach(() => {
    pathfinder = new Pathfinder();
    grid = new GridMap(10, 10);
  });

  it("should return correct reachable tiles on an empty grid for movement range 2", () => {
    const start = new TileCoordinate(5, 5);
    const reachable = pathfinder.calculateReachableTiles(start, 2, grid);

    // For range 2 in 4-way orthogonal without obstacles, the number of reachable tiles is:
    // Dist 0: 1
    // Dist 1: 4
    // Dist 2: 8
    // Total: 13
    expect(reachable.length).toBe(13);

    // Verify a few specific tiles
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 5)))).toBe(true);
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 3)))).toBe(true); // Up 2
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 7)))).toBe(true); // Down 2
    expect(reachable.some(t => t.equals(new TileCoordinate(3, 5)))).toBe(true); // Left 2
    expect(reachable.some(t => t.equals(new TileCoordinate(7, 5)))).toBe(true); // Right 2
    expect(reachable.some(t => t.equals(new TileCoordinate(6, 6)))).toBe(true); // Diagonal 1, dist 2

    // Out of range
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 2)))).toBe(false);
  });

  it("should correctly block movement paths when obstacles are present", () => {
    // Block the path to the right and top
    grid.addObstacle(new TileCoordinate(6, 5));
    grid.addObstacle(new TileCoordinate(5, 4));

    const start = new TileCoordinate(5, 5);
    const reachable = pathfinder.calculateReachableTiles(start, 2, grid);

    // Should not be able to reach (7, 5) or (5, 3) because of blocks directly adjacent
    expect(reachable.some(t => t.equals(new TileCoordinate(7, 5)))).toBe(false);
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 3)))).toBe(false);

    // But should still reach (4, 5) and (5, 6)
    expect(reachable.some(t => t.equals(new TileCoordinate(4, 5)))).toBe(true);
    expect(reachable.some(t => t.equals(new TileCoordinate(5, 6)))).toBe(true);
  });

  it("should respect the outer edges of the GridMap (no negative coords or beyond bounds)", () => {
    // Start at corner
    const start = new TileCoordinate(0, 0);
    const reachable = pathfinder.calculateReachableTiles(start, 2, grid);

    // Max reach is 2. Should only be positive coordinates.
    for (const tile of reachable) {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(grid.width);
      expect(tile.y).toBeLessThan(grid.height);
    }

    // For (0,0) and range 2:
    // (0,0), (1,0), (2,0), (0,1), (1,1), (0,2) = 6 tiles
    expect(reachable.length).toBe(6);
  });
});
