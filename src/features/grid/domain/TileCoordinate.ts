export class TileCoordinate {
  constructor(public readonly x: number, public readonly y: number) {}

  equals(other: TileCoordinate): boolean {
    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }
}
