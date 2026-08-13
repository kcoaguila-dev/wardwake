import * as Phaser from "phaser";
import { TileCoordinate } from "../domain/TileCoordinate";
import { GridMap } from "../domain/GridMap";

export class GridPresenter {
  private gridGraphics: Phaser.GameObjects.Graphics;
  private staircaseGraphics: Phaser.GameObjects.Graphics;
  private highlightGraphics: Phaser.GameObjects.Graphics;
  public static readonly TILE_SIZE = 32;

  constructor(private scene: Phaser.Scene) {
    this.gridGraphics = this.scene.add.graphics();
    this.staircaseGraphics = this.scene.add.graphics();
    this.highlightGraphics = this.scene.add.graphics();
  }

  drawGrid(gridMap: GridMap): void {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x444444, 1);

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        const coord = new TileCoordinate(x, y);
        this.gridGraphics.strokeRect(
          x * GridPresenter.TILE_SIZE,
          y * GridPresenter.TILE_SIZE,
          GridPresenter.TILE_SIZE,
          GridPresenter.TILE_SIZE
        );

        if (!gridMap.isWalkable(coord)) {
          this.gridGraphics.fillStyle(0x333333, 1);
          this.gridGraphics.fillRect(
            x * GridPresenter.TILE_SIZE,
            y * GridPresenter.TILE_SIZE,
            GridPresenter.TILE_SIZE,
            GridPresenter.TILE_SIZE
          );
        }
      }
    }
  }

  drawStaircase(coord: TileCoordinate): void {
    this.staircaseGraphics.clear();
    this.staircaseGraphics.fillStyle(0xffd700, 1);
    this.staircaseGraphics.fillRect(
      coord.x * GridPresenter.TILE_SIZE,
      coord.y * GridPresenter.TILE_SIZE,
      GridPresenter.TILE_SIZE,
      GridPresenter.TILE_SIZE
    );
  }

  highlightWalkableArea(validMoves: TileCoordinate[]): void {
    this.clearHighlights();
    this.highlightGraphics.fillStyle(0x0000ff, 0.3);

    for (const move of validMoves) {
      this.highlightGraphics.fillRect(
        move.x * GridPresenter.TILE_SIZE,
        move.y * GridPresenter.TILE_SIZE,
        GridPresenter.TILE_SIZE,
        GridPresenter.TILE_SIZE
      );
    }
  }

  clearHighlights(): void {
    this.highlightGraphics.clear();
  }

  clear(): void {
    this.gridGraphics.clear();
    this.staircaseGraphics.clear();
    this.highlightGraphics.clear();
  }
}
