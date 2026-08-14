import { FollowFormationCalculator } from "../../../src/features/ai/domain/FollowFormationCalculator";
import { Pathfinder } from "../../../src/features/grid/domain/Pathfinder";
import { GridMap } from "../../../src/features/grid/domain/GridMap";
import { TileCoordinate } from "../../../src/features/grid/domain/TileCoordinate";

describe("FollowFormationCalculator", () => {
  let calculator: FollowFormationCalculator;
  let pathfinder: Pathfinder;
  let grid: GridMap;

  beforeEach(() => {
    pathfinder = new Pathfinder();
    calculator = new FollowFormationCalculator(pathfinder);
    grid = new GridMap(10, 10);
  });

  it("should return null if follower is adjacent to an enemy", () => {
    const followerCoord = new TileCoordinate(2, 2);
    const leaderPreviousCoord = new TileCoordinate(4, 2);
    const enemyCoord = new TileCoordinate(3, 2);
    const enemyCoords = [enemyCoord];
    const occupiedTiles = [followerCoord, enemyCoord];

    const result = calculator.calculateFollowerDestination(
      followerCoord,
      leaderPreviousCoord,
      enemyCoords,
      occupiedTiles,
      grid,
      3
    );

    expect(result).toBeNull();
  });

  it("should return the leader's previous coord if within max movement", () => {
    const followerCoord = new TileCoordinate(2, 2);
    const leaderPreviousCoord = new TileCoordinate(4, 2);
    const enemyCoords: TileCoordinate[] = [];
    const occupiedTiles = [followerCoord];

    const result = calculator.calculateFollowerDestination(
      followerCoord,
      leaderPreviousCoord,
      enemyCoords,
      occupiedTiles,
      grid,
      3
    );

    expect(result).toEqual(leaderPreviousCoord);
  });

  it("should stop at max movement if leader's previous coord is further", () => {
    const followerCoord = new TileCoordinate(2, 2);
    const leaderPreviousCoord = new TileCoordinate(6, 2);
    const enemyCoords: TileCoordinate[] = [];
    const occupiedTiles = [followerCoord];

    const result = calculator.calculateFollowerDestination(
      followerCoord,
      leaderPreviousCoord,
      enemyCoords,
      occupiedTiles,
      grid,
      2
    );

    // Path: (2,2) -> (3,2) -> (4,2)
    expect(result).toEqual(new TileCoordinate(4, 2));
  });

  it("should navigate around obstacles to reach leader's previous coord", () => {
    const followerCoord = new TileCoordinate(2, 2);
    const leaderPreviousCoord = new TileCoordinate(4, 2);
    grid.addObstacle(new TileCoordinate(3, 2));
    const enemyCoords: TileCoordinate[] = [];
    const occupiedTiles = [followerCoord];

    const result = calculator.calculateFollowerDestination(
      followerCoord,
      leaderPreviousCoord,
      enemyCoords,
      occupiedTiles,
      grid,
      4
    );

    // Path: (2,2) -> (2,1) -> (3,1) -> (4,1) -> (4,2) (length 4) or similar
    expect(result).toEqual(leaderPreviousCoord);
  });

  it("should stop at the furthest unoccupied tile if leader's previous coord is occupied by another unit", () => {
    const followerCoord = new TileCoordinate(2, 2);
    const leaderPreviousCoord = new TileCoordinate(4, 2);
    const otherUnitCoord = new TileCoordinate(4, 2);
    const enemyCoords: TileCoordinate[] = [];
    const occupiedTiles = [followerCoord, otherUnitCoord];

    const result = calculator.calculateFollowerDestination(
      followerCoord,
      leaderPreviousCoord,
      enemyCoords,
      occupiedTiles,
      grid,
      3
    );

    // Target is (4,2), but it's occupied. Path goes (2,2)->(3,2)->(4,2).
    // Furthest unoccupied is (3,2).
    expect(result).toEqual(new TileCoordinate(3, 2));
  });

  it("should return follower coord if no valid path exists", () => {
      const followerCoord = new TileCoordinate(0, 0);
      const leaderPreviousCoord = new TileCoordinate(2, 2);

      // Block the follower completely
      grid.addObstacle(new TileCoordinate(1, 0));
      grid.addObstacle(new TileCoordinate(0, 1));

      const enemyCoords: TileCoordinate[] = [];
      const occupiedTiles = [followerCoord];

      const result = calculator.calculateFollowerDestination(
        followerCoord,
        leaderPreviousCoord,
        enemyCoords,
        occupiedTiles,
        grid,
        3
      );

      expect(result).toBeNull();
  });
});
