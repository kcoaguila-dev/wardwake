import { TileCoordinate } from "./TileCoordinate";
import { TerrainType } from "./TerrainType";

export class GridMap {
  private blockedTiles: Set<string> = new Set();
  private terrains: Map<string, TerrainType> = new Map();

  constructor(public readonly width: number, public readonly height: number) {}

  setTerrain(coord: TileCoordinate, type: TerrainType): void {
    if (this.isWithinBounds(coord)) {
      this.terrains.set(coord.toString(), type);
    }
  }

  getTerrain(coord: TileCoordinate): TerrainType {
    return this.terrains.get(coord.toString()) ?? TerrainType.NONE;
  }

  addObstacle(coord: TileCoordinate): void {
    if (this.isWithinBounds(coord)) {
      this.blockedTiles.add(coord.toString());
    }
  }

  removeObstacle(coord: TileCoordinate): void {
    this.blockedTiles.delete(coord.toString());
  }

  isWithinBounds(coord: TileCoordinate): boolean {
    return coord.x >= 0 && coord.x < this.width && coord.y >= 0 && coord.y < this.height;
  }

  isWalkable(coord: TileCoordinate): boolean {
    return this.isWithinBounds(coord) && !this.blockedTiles.has(coord.toString());
  }
}
