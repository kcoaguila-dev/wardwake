import { GridMap } from "../domain/GridMap";
import { DungeonGenerator } from "../domain/DungeonGenerator";
import { TileCoordinate } from "../domain/TileCoordinate";

export class GenerateFloorUseCase {
  constructor(private readonly width: number, private readonly height: number) {}

  public execute(): {
    map: GridMap;
    playerSpawn: TileCoordinate;
    enemySpawn: TileCoordinate;
    staircase: TileCoordinate;
  } {
    const generator = new DungeonGenerator(this.width, this.height);
    const map = generator.generate();

    const walkableCoords: TileCoordinate[] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const coord = new TileCoordinate(x, y);
        if (map.isWalkable(coord)) {
          walkableCoords.push(coord);
        }
      }
    }

    if (walkableCoords.length < 3) {
      throw new Error("Generated map does not have enough walkable tiles for spawns.");
    }

    // Shuffle the walkable coordinates to pick random ones
    for (let i = walkableCoords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [walkableCoords[i], walkableCoords[j]] = [walkableCoords[j], walkableCoords[i]];
    }

    const playerSpawn = walkableCoords[0];
    const enemySpawn = walkableCoords[1];
    const staircase = walkableCoords[2];

    return { map, playerSpawn, enemySpawn, staircase };
  }
}
