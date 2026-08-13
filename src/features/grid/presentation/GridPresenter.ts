import * as Phaser from "phaser";
import { TileCoordinate } from "../domain/TileCoordinate";
import { GridMap } from "../domain/GridMap";

export class GridPresenter {
  private graphics: Phaser.GameObjects.Graphics;
  public static readonly TILE_SIZE = 32;

  constructor(private scene: Phaser.Scene) {
    this.graphics = this.scene.add.graphics();
  }

  drawGrid(gridMap: GridMap): void {
    this.graphics.lineStyle(1, 0x444444, 1);

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        this.graphics.strokeRect(
          x * GridPresenter.TILE_SIZE,
          y * GridPresenter.TILE_SIZE,
          GridPresenter.TILE_SIZE,
          GridPresenter.TILE_SIZE
        );
      }
    }
  }

  highlightWalkableArea(validMoves: TileCoordinate[]): void {
    this.graphics.fillStyle(0x0000ff, 0.3);

    for (const move of validMoves) {
      this.graphics.fillRect(
        move.x * GridPresenter.TILE_SIZE,
        move.y * GridPresenter.TILE_SIZE,
        GridPresenter.TILE_SIZE,
        GridPresenter.TILE_SIZE
      );
    }
  }

  clear(): void {
    this.graphics.clear();
  }
}
