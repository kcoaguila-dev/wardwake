import { GridMap } from "../domain/GridMap";
import { DungeonGenerator } from "../domain/DungeonGenerator";
import { TileCoordinate } from "../domain/TileCoordinate";
import { Room } from "../domain/BspNode";
import { Item, ItemType } from "../../inventory/domain/Item";

export interface FloorGenerationResult {
  map: GridMap;
  playerSpawns: TileCoordinate[];
  enemySpawns: TileCoordinate[];
  staircase: TileCoordinate;
  rooms: Room[];
  items: { coord: TileCoordinate; item: Item }[];
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

    // 4. Generate 1-2 random items in distant rooms
    const generatedItems: { coord: TileCoordinate; item: Item }[] = [];
    const numItems = Math.floor(Math.random() * 2) + 1; // 1 to 2 items

    // Pick rooms other than the starting room if possible
    const itemRooms = rooms.length > 1 ? rooms.slice(1) : rooms;

    for (let i = 0; i < numItems; i++) {
      const room = itemRooms[Math.floor(Math.random() * itemRooms.length)];
      if (!room) continue;

      const availableTiles: TileCoordinate[] = [];
      for (let x = room.x; x < room.x + room.width; x++) {
        for (let y = room.y; y < room.y + room.height; y++) {
          const c = new TileCoordinate(x, y);
          if (map.isWalkable(c) && !usedSet.has(c.toString()) && !c.equals(staircase)) {
            availableTiles.push(c);
          }
        }
      }

      if (availableTiles.length > 0) {
        const coord = availableTiles[Math.floor(Math.random() * availableTiles.length)]!;
        usedSet.add(coord.toString());

        // Randomly pick Item Type (Vulnerary/Heal or Attack Buff)
        const isHeal = Math.random() > 0.5;
        const item = isHeal
          ? new Item(`item_${Math.random()}`, 'Vulnerary', ItemType.HEAL, 10)
          : new Item(`item_${Math.random()}`, 'Strength Potion', ItemType.ATTACK_BUFF, 2);

        generatedItems.push({ coord, item });
      }
    }

    return {
      map,
      playerSpawns,
      enemySpawns,
      staircase,
      rooms,
      items: generatedItems
    };
  }
}
