import * as Phaser from "phaser";
import { TileCoordinate } from "../domain/TileCoordinate";
import { GridMap } from "../domain/GridMap";

export class GridPresenter {
  private gridSprites: Phaser.GameObjects.Sprite[];
  private staircaseGraphics: Phaser.GameObjects.Graphics;
  private highlightGraphics: Phaser.GameObjects.Graphics;
  public static readonly TILE_SIZE = 32;

  constructor(private scene: Phaser.Scene) {
    this.gridSprites = [];
    this.staircaseGraphics = this.scene.add.graphics();
    this.highlightGraphics = this.scene.add.graphics();
  }

  drawGrid(gridMap: GridMap): void {
    this.clearGridSprites();

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        const coord = new TileCoordinate(x, y);

        const textureKey = gridMap.isWalkable(coord) ? 'tile_floor' : 'tile_wall';

        const sprite = this.scene.add.sprite(
          x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          textureKey
        );
        sprite.setScale(2);
        sprite.setDepth(0);
        this.gridSprites.push(sprite);
      }
    }
  }

  private clearGridSprites(): void {
    for (const sprite of this.gridSprites) {
      sprite.destroy();
    }
    this.gridSprites = [];
  }

  drawStaircase(coord: TileCoordinate): void {
    this.staircaseGraphics.clear();
    this.staircaseGraphics.setDepth(1);
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
    this.highlightGraphics.setDepth(1);
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
    this.clearGridSprites();
    this.staircaseGraphics.clear();
    this.highlightGraphics.clear();
  }
}
