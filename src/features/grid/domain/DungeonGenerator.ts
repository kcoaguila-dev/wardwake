import { GridMap } from "./GridMap";
import { TileCoordinate } from "./TileCoordinate";
import { BspNode, Room } from "./BspNode";

export class DungeonGenerator {
  private readonly minNodeSize = 4;
  private root!: BspNode;
  private rooms: Room[] = [];

  constructor(public readonly width: number, public readonly height: number) {}

  public getRooms(): Room[] {
    return this.rooms;
  }

  public generate(): GridMap {
    this.root = new BspNode(0, 0, this.width, this.height);
    this.rooms = [];
    this.splitNode(this.root);

    this.carveRooms(this.root);

    const map = new GridMap(this.width, this.height);

    // Initially block everything (all walls)
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        map.addObstacle(new TileCoordinate(x, y));
      }
    }

    // Carve out rooms
    for (const room of this.rooms) {
      for (let x = room.x; x < room.x + room.width; x++) {
        for (let y = room.y; y < room.y + room.height; y++) {
          map.removeObstacle(new TileCoordinate(x, y));
        }
      }
    }

    // Connect rooms by creating corridors between sibling nodes recursively
    this.connectNodes(this.root, map);

    return map;
  }

  private connectNodes(node: BspNode, map: GridMap): void {
    if (node.leftChild && node.rightChild) {
      this.connectNodes(node.leftChild, map);
      this.connectNodes(node.rightChild, map);

      // Dig corridor between leftChild's center and rightChild's center
      const leftCenter = this.getNodeCenter(node.leftChild);
      const rightCenter = this.getNodeCenter(node.rightChild);

      this.digCorridor(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y, map);
    }
  }

  private getNodeCenter(node: BspNode): { x: number, y: number } {
    if (node.room) {
      return {
        x: Math.floor(node.room.x + node.room.width / 2),
        y: Math.floor(node.room.y + node.room.height / 2)
      };
    }

    // If not a leaf, find center of descendants
    let center = { x: Math.floor(node.x + node.width / 2), y: Math.floor(node.y + node.height / 2) };
    if (node.leftChild) {
        center = this.getNodeCenter(node.leftChild);
    } else if (node.rightChild) {
        center = this.getNodeCenter(node.rightChild);
    }
    return center;
  }

  private digCorridor(x1: number, y1: number, x2: number, y2: number, map: GridMap): void {
    // Dig horizontal then vertical, or vertical then horizontal
    const startHoriz = Math.random() > 0.5;

    if (startHoriz) {
      this.digHorizontal(x1, x2, y1, map);
      this.digVertical(y1, y2, x2, map);
    } else {
      this.digVertical(y1, y2, x1, map);
      this.digHorizontal(x1, x2, y2, map);
    }
  }

  private digHorizontal(x1: number, x2: number, y: number, map: GridMap): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      map.removeObstacle(new TileCoordinate(x, y));
    }
  }

  private digVertical(y1: number, y2: number, x: number, map: GridMap): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      map.removeObstacle(new TileCoordinate(x, y));
    }
  }

  private carveRooms(node: BspNode): void {
    if (node.leftChild || node.rightChild) {
      if (node.leftChild) this.carveRooms(node.leftChild);
      if (node.rightChild) this.carveRooms(node.rightChild);
    } else {
      // It's a leaf, carve a room
      // Room size should be random, but at least minRoomSize and fit inside node with some padding
      const minRoomSize = 3;
      const padding = 1;

      const maxWidth = node.width - (padding * 2);
      const maxHeight = node.height - (padding * 2);

      if (maxWidth >= minRoomSize && maxHeight >= minRoomSize) {
        const roomWidth = Math.floor(Math.random() * (maxWidth - minRoomSize + 1)) + minRoomSize;
        const roomHeight = Math.floor(Math.random() * (maxHeight - minRoomSize + 1)) + minRoomSize;

        const roomX = node.x + padding + Math.floor(Math.random() * (maxWidth - roomWidth + 1));
        const roomY = node.y + padding + Math.floor(Math.random() * (maxHeight - roomHeight + 1));

        node.room = new Room(roomX, roomY, roomWidth, roomHeight);
        this.rooms.push(node.room);
      }
    }
  }

  private splitNode(node: BspNode): void {
    if (node.leftChild || node.rightChild) {
      return; // Already split
    }

    // Determine direction of split
    // If width is >25% larger than height, split vertically
    // If height is >25% larger than width, split horizontally
    // Otherwise, random
    let splitHorizontally = Math.random() > 0.5;
    if (node.width > node.height && node.width / node.height >= 1.25) {
      splitHorizontally = false;
    } else if (node.height > node.width && node.height / node.width >= 1.25) {
      splitHorizontally = true;
    }

    const max = (splitHorizontally ? node.height : node.width) - this.minNodeSize;
    if (max <= this.minNodeSize) {
      return; // Node is too small to split further
    }

    // Random split point between minNodeSize and max
    const splitPoint = Math.floor(Math.random() * (max - this.minNodeSize)) + this.minNodeSize;

    if (splitHorizontally) {
      node.leftChild = new BspNode(node.x, node.y, node.width, splitPoint);
      node.rightChild = new BspNode(node.x, node.y + splitPoint, node.width, node.height - splitPoint);
    } else {
      node.leftChild = new BspNode(node.x, node.y, splitPoint, node.height);
      node.rightChild = new BspNode(node.x + splitPoint, node.y, node.width - splitPoint, node.height);
    }

    this.splitNode(node.leftChild);
    this.splitNode(node.rightChild);
  }
}
