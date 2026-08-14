import { FogOfWar } from './FogOfWar';
import { VisibilityMap } from './VisibilityMap';
import { GridMap } from '../../grid/domain/GridMap';
import { Room } from '../../grid/domain/BspNode';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';

describe('FogOfWar', () => {
  let gridMap: GridMap;
  let visibilityMap: VisibilityMap;

  beforeEach(() => {
    gridMap = new GridMap(10, 10);
    // Everything is walkable by default in this test setup unless blocked,
    // but FogOfWar doesn't strictly depend on obstacles for light tracing, just boundary checking.
    // However, it does check `isWalkable(coord)` for the unit itself.
    visibilityMap = new VisibilityMap();
  });

  test('should reveal a 1-tile Manhattan radius when in a corridor', () => {
    // Empty rooms array so everywhere is considered a corridor
    const fogOfWar = new FogOfWar(gridMap, []);
    const playerPos = new TileCoordinate(5, 5);

    fogOfWar.updateVisibility([playerPos], visibilityMap);

    // Center should be visible
    expect(visibilityMap.isVisible(playerPos)).toBe(true);

    // 1-tile Manhattan neighbors should be visible
    expect(visibilityMap.isVisible(new TileCoordinate(4, 5))).toBe(true);
    expect(visibilityMap.isVisible(new TileCoordinate(6, 5))).toBe(true);
    expect(visibilityMap.isVisible(new TileCoordinate(5, 4))).toBe(true);
    expect(visibilityMap.isVisible(new TileCoordinate(5, 6))).toBe(true);

    // Diagonal (distance 2) should NOT be visible
    expect(visibilityMap.isVisible(new TileCoordinate(4, 4))).toBe(false);
    expect(visibilityMap.isVisible(new TileCoordinate(6, 6))).toBe(false);

    // Distance > 1 should NOT be visible
    expect(visibilityMap.isVisible(new TileCoordinate(7, 5))).toBe(false);
  });

  test('should reveal entire room and 1-tile boundary when in a room', () => {
    const room = new Room(2, 2, 3, 3); // x: 2-4, y: 2-4
    const fogOfWar = new FogOfWar(gridMap, [room]);
    const playerPos = new TileCoordinate(3, 3); // Inside the room

    fogOfWar.updateVisibility([playerPos], visibilityMap);

    // Check all tiles inside the room are visible
    for (let x = 2; x <= 4; x++) {
      for (let y = 2; y <= 4; y++) {
        expect(visibilityMap.isVisible(new TileCoordinate(x, y))).toBe(true);
      }
    }

    // Check boundary walls (1-tile radius around room) are visible
    expect(visibilityMap.isVisible(new TileCoordinate(1, 1))).toBe(true);
    expect(visibilityMap.isVisible(new TileCoordinate(5, 5))).toBe(true);

    // Check further tiles are NOT visible
    expect(visibilityMap.isVisible(new TileCoordinate(6, 6))).toBe(false);
    expect(visibilityMap.isVisible(new TileCoordinate(0, 0))).toBe(false);
  });

  test('does not update visibility from non-walkable tile', () => {
    // Block a tile and put player there (edge case, usually shouldn't happen)
    const fogOfWar = new FogOfWar(gridMap, []);
    const playerPos = new TileCoordinate(1, 1);
    gridMap.addObstacle(playerPos);

    fogOfWar.updateVisibility([playerPos], visibilityMap);

    expect(visibilityMap.isVisible(playerPos)).toBe(false);
  });
});
