import { TileCoordinate } from "../domain/TileCoordinate";
import { GridMap } from "../domain/GridMap";
import { Pathfinder } from "../domain/Pathfinder";

export class GetValidMovesUseCase {
  constructor(private gridMap: GridMap, private pathfinder: Pathfinder) {}

  execute(unitPos: TileCoordinate, movementStat: number, obstacles: TileCoordinate[] = []): TileCoordinate[] {
    return this.pathfinder.calculateReachableTiles(unitPos, movementStat, this.gridMap, obstacles);
  }
}
