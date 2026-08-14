import { TileCoordinate } from '../../grid/domain/TileCoordinate';

export class VisibilityMap {
  private discoveredTiles: Set<string> = new Set();
  private visibleTiles: Set<string> = new Set();

  public isDiscovered(coord: TileCoordinate): boolean {
    return this.discoveredTiles.has(coord.toString());
  }

  public isVisible(coord: TileCoordinate): boolean {
    return this.visibleTiles.has(coord.toString());
  }

  public markDiscovered(coord: TileCoordinate): void {
    this.discoveredTiles.add(coord.toString());
  }

  public markVisible(coord: TileCoordinate): void {
    this.visibleTiles.add(coord.toString());
    // Every visible tile is also implicitly discovered
    this.markDiscovered(coord);
  }

  public clearVisible(): void {
    this.visibleTiles.clear();
  }

  public getVisibleTiles(): TileCoordinate[] {
    const coords: TileCoordinate[] = [];
    for (const tileString of this.visibleTiles) {
      const [xStr, yStr] = tileString.split(',');
      if (xStr && yStr) {
        coords.push(new TileCoordinate(parseInt(xStr, 10), parseInt(yStr, 10)));
      }
    }
    return coords;
  }
}
