import * as Phaser from "phaser";
import { TileCoordinate } from "../../grid/domain/TileCoordinate";

export class InputPresenter {
  private lastHoveredTile: TileCoordinate | null = null;

  constructor(private scene: Phaser.Scene) {
    this.scene.input.on("pointerdown", this.handlePointerDown, this);
    this.scene.input.on("pointermove", this.handlePointerMove, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / 32);
    const tileY = Math.floor(worldPoint.y / 32);

    if (tileX < 0 || tileX >= 10 || tileY < 0 || tileY >= 10) {
      return;
    }

    const tileCoordinate = new TileCoordinate(tileX, tileY);
    this.scene.events.emit("ON_TILE_CLICKED", tileCoordinate);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / 32);
    const tileY = Math.floor(worldPoint.y / 32);

    if (tileX < 0 || tileX >= 10 || tileY < 0 || tileY >= 10) {
      if (this.lastHoveredTile) {
        this.lastHoveredTile = null;
        this.scene.events.emit("ON_TILE_HOVER", new TileCoordinate(-1, -1));
      }
      return;
    }

    const tileCoordinate = new TileCoordinate(tileX, tileY);
    if (!this.lastHoveredTile || !this.lastHoveredTile.equals(tileCoordinate)) {
      this.lastHoveredTile = tileCoordinate;
      this.scene.events.emit("ON_TILE_HOVER", tileCoordinate);
    }
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.handlePointerDown, this);
    this.scene.input.off("pointermove", this.handlePointerMove, this);
  }
}
