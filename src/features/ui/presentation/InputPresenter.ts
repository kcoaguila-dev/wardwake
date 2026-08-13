import * as Phaser from "phaser";
import { TileCoordinate } from "../../grid/domain/TileCoordinate";

export class InputPresenter {
  constructor(private scene: Phaser.Scene) {
    this.scene.input.on("pointerdown", this.handlePointerDown, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tileX = Math.floor(pointer.x / 32);
    const tileY = Math.floor(pointer.y / 32);

    const tileCoordinate = new TileCoordinate(tileX, tileY);
    this.scene.events.emit("ON_TILE_CLICKED", tileCoordinate);
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.handlePointerDown, this);
  }
}
