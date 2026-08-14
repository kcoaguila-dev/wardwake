import { GridMap } from "./GridMap";
import { TileCoordinate } from "./TileCoordinate";
import { Room } from "./BspNode";

export class DungeonGenerator {
  private rooms: Room[] = [];

  constructor(public readonly width: number, public readonly height: number) {}

  public getRooms(): Room[] {
    return this.rooms;
  }

  public generate(): GridMap {
    this.rooms = [];
    const map = new GridMap(this.width, this.height);

    // 1. Initially block all tiles as solid rock walls
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        map.addObstacle(new TileCoordinate(x, y));
      }
    }

    // 2. Divide map into Chunsoft Macro Cells (e.g. 2x2 grid for 10x10)
    const cols = Math.max(2, Math.floor(this.width / 5));
    const rows = Math.max(2, Math.floor(this.height / 5));
    const cellW = Math.floor(this.width / cols);
    const cellH = Math.floor(this.height / rows);

    const cellRooms: (Room | null)[][] = Array.from({ length: cols }, () => Array(rows).fill(null));

    // 3. Carve a distinct room inside each macro-cell
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cellX = c * cellW;
        const cellY = r * cellH;

        // Leave at least 1 tile border padding inside each cell
        const minSize = 2;
        const maxW = Math.max(minSize, cellW - 2);
        const maxH = Math.max(minSize, cellH - 2);

        const roomW = Math.floor(Math.random() * (maxW - minSize + 1)) + minSize;
        const roomH = Math.floor(Math.random() * (maxH - minSize + 1)) + minSize;

        const roomX = cellX + 1 + Math.floor(Math.random() * (cellW - roomW - 1));
        const roomY = cellY + 1 + Math.floor(Math.random() * (cellH - roomH - 1));

        const room = new Room(roomX, roomY, roomW, roomH);
        this.rooms.push(room);
        cellRooms[c]![r] = room;

        // Carve room floor
        for (let x = room.x; x < room.x + room.width; x++) {
          for (let y = room.y; y < room.y + room.height; y++) {
            map.removeObstacle(new TileCoordinate(x, y));
          }
        }
      }
    }

    // 4. Connect adjacent macro cells with clean 1-tile L-junction corridors
    // Horizontal connections
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const roomA = cellRooms[c]![r]!;
        const roomB = cellRooms[c + 1]![r]!;
        this.connectRooms(roomA, roomB, map);
      }
    }

    // Vertical connections
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows - 1; r++) {
        const roomA = cellRooms[c]![r]!;
        const roomB = cellRooms[c]![r + 1]!;
        this.connectRooms(roomA, roomB, map);
      }
    }

    return map;
  }

  private connectRooms(r1: Room, r2: Room, map: GridMap): void {
    // Pick center anchor points of both rooms
    const x1 = Math.floor(r1.x + r1.width / 2);
    const y1 = Math.floor(r1.y + r1.height / 2);
    const x2 = Math.floor(r2.x + r2.width / 2);
    const y2 = Math.floor(r2.y + r2.height / 2);

    // 50% chance: Horizontal then Vertical, or Vertical then Horizontal
    if (Math.random() > 0.5) {
      this.carveHorizontalLine(x1, x2, y1, map);
      this.carveVerticalLine(y1, y2, x2, map);
    } else {
      this.carveVerticalLine(y1, y2, x1, map);
      this.carveHorizontalLine(x1, x2, y2, map);
    }
  }

  private carveHorizontalLine(x1: number, x2: number, y: number, map: GridMap): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        map.removeObstacle(new TileCoordinate(x, y));
      }
    }
  }

  private carveVerticalLine(y1: number, y2: number, x: number, map: GridMap): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        map.removeObstacle(new TileCoordinate(x, y));
      }
    }
  }
}
