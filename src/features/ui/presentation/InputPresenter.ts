import * as Phaser from "phaser";
import { TileCoordinate } from "../../grid/domain/TileCoordinate";

export class InputPresenter {
  private lastHoveredTile: TileCoordinate | null = null;

  constructor(private scene: Phaser.Scene) {
    this.scene.input.on("pointerdown", this.handlePointerDown, this);
    this.scene.input.on("pointermove", this.handlePointerMove, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tileX = Math.floor(pointer.x / 32);
    const tileY = Math.floor(pointer.y / 32);

    const tileCoordinate = new TileCoordinate(tileX, tileY);
    this.scene.events.emit("ON_TILE_CLICKED", tileCoordinate);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const tileX = Math.floor(pointer.x / 32);
    const tileY = Math.floor(pointer.y / 32);

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
