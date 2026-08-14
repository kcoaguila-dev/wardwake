import { GridMap } from "./GridMap";
import { TileCoordinate } from "./TileCoordinate";
import { Room } from "./BspNode";

interface Edge {
  u: number;
  v: number;
}

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

    // 2. Divide map into Chunsoft Macro Cells (e.g. 3x3 grid for 24x24)
    const cols = Math.max(2, Math.floor(this.width / 7));
    const rows = Math.max(2, Math.floor(this.height / 7));
    const cellW = Math.floor(this.width / cols);
    const cellH = Math.floor(this.height / rows);

    const cellRooms: Room[] = [];
    const cellCount = cols * rows;

    // 3. Carve a distinct room/junction inside each macro-cell
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellX = c * cellW;
        const cellY = r * cellH;

        // 80% chance of standard chamber, 20% chance of small crossroad hub
        const isSmallHub = Math.random() < 0.2;

        const minW = isSmallHub ? 2 : 3;
        const minH = isSmallHub ? 2 : 3;
        const maxW = isSmallHub ? 3 : Math.max(minW, cellW - 2);
        const maxH = isSmallHub ? 3 : Math.max(minH, cellH - 2);

        const roomW = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
        const roomH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;

        const roomX = cellX + 1 + Math.floor(Math.random() * Math.max(1, cellW - roomW - 1));
        const roomY = cellY + 1 + Math.floor(Math.random() * Math.max(1, cellH - roomH - 1));

        const room = new Room(roomX, roomY, roomW, roomH);
        this.rooms.push(room);
        cellRooms.push(room);

        // Carve room floor
        for (let x = room.x; x < room.x + room.width; x++) {
          for (let y = room.y; y < room.y + room.height; y++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
              map.removeObstacle(new TileCoordinate(x, y));
            }
          }
        }
      }
    }

    // 4. Generate all potential grid edges between adjacent cells
    const allEdges: Edge[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const currentIdx = r * cols + c;
        // Horizontal neighbor
        if (c + 1 < cols) {
          allEdges.push({ u: currentIdx, v: r * cols + (c + 1) });
        }
        // Vertical neighbor
        if (r + 1 < rows) {
          allEdges.push({ u: currentIdx, v: (r + 1) * cols + c });
        }
      }
    }

    // Shuffle edges randomly
    for (let i = allEdges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = allEdges[i]!;
      allEdges[i] = allEdges[j]!;
      allEdges[j] = temp;
    }

    // Disjoint Set Union (DSU) for randomized Kruskal's Minimum Spanning Tree
    const parent: number[] = Array.from({ length: cellCount }, (_, i) => i);
    const find = (i: number): number => {
      if (parent[i] === i) return i;
      parent[i] = find(parent[i]!);
      return parent[i]!;
    };
    const union = (i: number, j: number): boolean => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    };

    const selectedEdges: Edge[] = [];
    const remainingEdges: Edge[] = [];

    for (const edge of allEdges) {
      if (union(edge.u, edge.v)) {
        selectedEdges.push(edge);
      } else {
        remainingEdges.push(edge);
      }
    }

    // Add 2-3 extra random cycle edges for organic loops and alternate escape paths
    const extraCycles = Math.min(remainingEdges.length, 2 + Math.floor(Math.random() * 2));
    for (let k = 0; k < extraCycles; k++) {
      selectedEdges.push(remainingEdges[k]!);
    }

    // 5. Carve clean 1-tile L-junction corridors for all selected edges
    for (const edge of selectedEdges) {
      const roomA = cellRooms[edge.u]!;
      const roomB = cellRooms[edge.v]!;
      this.connectRooms(roomA, roomB, map);
    }

    return map;
  }

  private connectRooms(r1: Room, r2: Room, map: GridMap): void {
    // Pick anchor points inside both rooms
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
