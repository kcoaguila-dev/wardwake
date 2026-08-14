import { GridMap } from "../domain/GridMap";
import { DungeonGenerator } from "../domain/DungeonGenerator";
import { TileCoordinate } from "../domain/TileCoordinate";

export interface FloorGenerationResult {
  map: GridMap;
  playerSpawns: TileCoordinate[];
  enemySpawns: TileCoordinate[];
  staircase: TileCoordinate;
}

export class GenerateFloorUseCase {
  constructor(private readonly width: number, private readonly height: number) {}

  public execute(playerCount: number = 2, enemyCount: number = 2): FloorGenerationResult {
    const generator = new DungeonGenerator(this.width, this.height);
    const map = generator.generate();
    const rooms = generator.getRooms();

    const allWalkable: TileCoordinate[] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const coord = new TileCoordinate(x, y);
        if (map.isWalkable(coord)) {
          allWalkable.push(coord);
        }
      }
    }

    if (allWalkable.length < playerCount + enemyCount + 1) {
      throw new Error("Generated map does not have enough walkable tiles for spawns.");
    }

    const playerSpawns: TileCoordinate[] = [];
    const enemySpawns: TileCoordinate[] = [];
    const usedSet = new Set<string>();

    const getRoomTiles = (roomIndex: number): TileCoordinate[] => {
      const room = rooms[roomIndex];
      if (!room) return [];
      const tiles: TileCoordinate[] = [];
      for (let x = room.x; x < room.x + room.width; x++) {
        for (let y = room.y; y < room.y + room.height; y++) {
          const c = new TileCoordinate(x, y);
          if (map.isWalkable(c) && !usedSet.has(c.toString())) {
            tiles.push(c);
          }
        }
      }
      return tiles;
    };

    // 1. Assign Player Spawns in starting room (room 0)
    const startRoomTiles = getRoomTiles(0);
    for (let i = 0; i < playerCount; i++) {
      const tile = startRoomTiles[i] || allWalkable.find(c => !usedSet.has(c.toString()))!;
      usedSet.add(tile.toString());
      playerSpawns.push(tile);
    }

    // 2. Assign Enemy Spawns in distant rooms (room 1, 2, or last room)
    const enemyRoomIndex = rooms.length > 1 ? rooms.length - 1 : 0;
    const enemyRoomTiles = getRoomTiles(enemyRoomIndex);
    for (let i = 0; i < enemyCount; i++) {
      const tile = enemyRoomTiles[i] || allWalkable.find(c => !usedSet.has(c.toString()))!;
      usedSet.add(tile.toString());
      enemySpawns.push(tile);
    }

    // 3. Place Staircase in the furthest available walkable tile
    let furthestTile: TileCoordinate = allWalkable.find(c => !usedSet.has(c.toString()))!;
    let maxDist = -1;
    const pCenter = playerSpawns[0] || new TileCoordinate(0, 0);

    for (const tile of allWalkable) {
      if (!usedSet.has(tile.toString())) {
        const dist = Math.abs(tile.x - pCenter.x) + Math.abs(tile.y - pCenter.y);
        if (dist > maxDist) {
          maxDist = dist;
          furthestTile = tile;
        }
      }
    }

    const staircase = furthestTile;

    return {
      map,
      playerSpawns,
      enemySpawns,
      staircase
    };
  }
}
