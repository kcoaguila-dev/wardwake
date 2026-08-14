import { VisibilityMap } from './VisibilityMap';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridMap } from '../../grid/domain/GridMap';
import { Room } from '../../grid/domain/BspNode';

export class FogOfWar {
  constructor(private gridMap: GridMap, private rooms: Room[]) {}

  /**
   * Updates the visibility map based on the active squad's coordinates.
   * @param squadCoords Array of current tile coordinates for all living units in the squad.
   * @param visibilityMap The current visibility map to be updated.
   */
  public updateVisibility(squadCoords: TileCoordinate[], visibilityMap: VisibilityMap): void {
    // 1. Clear currently visible tiles (they are recalculated each turn/move)
    visibilityMap.clearVisible();

    for (const coord of squadCoords) {
      if (!this.gridMap.isWalkable(coord)) continue;

      // Check if unit is in a room
      const room = this.getRoomAt(coord);

      if (room) {
        // Unit is inside a room: entire room and its border walls become visible and discovered
        this.revealRoom(room, visibilityMap);
      } else {
        // Unit is in a corridor: 1-tile Manhattan radius (including walls)
        this.revealCorridor(coord, visibilityMap);
      }
    }
  }

  private getRoomAt(coord: TileCoordinate): Room | undefined {
    return this.rooms.find(
      (r) => coord.x >= r.x && coord.x < r.x + r.width && coord.y >= r.y && coord.y < r.y + r.height
    );
  }

  private revealRoom(room: Room, visibilityMap: VisibilityMap): void {
    // Reveal all floor tiles within the room plus a 1-tile border for walls
    for (let x = room.x - 1; x <= room.x + room.width; x++) {
      for (let y = room.y - 1; y <= room.y + room.height; y++) {
        if (x >= 0 && x < this.gridMap.width && y >= 0 && y < this.gridMap.height) {
          visibilityMap.markVisible(new TileCoordinate(x, y));
        }
      }
    }
  }

  private revealCorridor(center: TileCoordinate, visibilityMap: VisibilityMap): void {
    // 1-tile Manhattan distance visibility in corridors
    const offsets = [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (const offset of offsets) {
      const x = center.x + offset.dx;
      const y = center.y + offset.dy;
      if (x >= 0 && x < this.gridMap.width && y >= 0 && y < this.gridMap.height) {
        visibilityMap.markVisible(new TileCoordinate(x, y));
      }
    }
  }
}
