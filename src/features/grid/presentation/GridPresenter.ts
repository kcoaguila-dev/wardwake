import * as Phaser from "phaser";
import { TileCoordinate } from "../domain/TileCoordinate";
import { GridMap } from "../domain/GridMap";

export class GridPresenter {
  private gridSprites: Phaser.GameObjects.Sprite[];
  private staircaseGraphics: Phaser.GameObjects.Graphics;
  private highlightGraphics: Phaser.GameObjects.Graphics;
  private shadowGraphics: Phaser.GameObjects.Graphics;
  public static readonly TILE_SIZE = 32;

  constructor(private scene: Phaser.Scene) {
    this.gridSprites = [];
    this.shadowGraphics = this.scene.add.graphics();
    this.staircaseGraphics = this.scene.add.graphics();
    this.highlightGraphics = this.scene.add.graphics();
  }

  drawGrid(gridMap: GridMap): void {
    this.clearGridSprites();
    this.shadowGraphics.clear();
    this.shadowGraphics.setDepth(0.5);

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        const coord = new TileCoordinate(x, y);
        const isFloor = gridMap.isWalkable(coord);
        const textureKey = isFloor ? 'tile_floor' : 'tile_wall';

        const sprite = this.scene.add.sprite(
          x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2,
          textureKey
        );
        sprite.setScale(2);
        sprite.setDepth(0);

        if (!isFloor) {
          // Autotiling facade: Check if wall faces floor south
          const southCoord = new TileCoordinate(x, y + 1);
          const hasFloorSouth = y < gridMap.height - 1 && gridMap.isWalkable(southCoord);

          if (hasFloorSouth) {
            // Front-facing wall: Full brightness stone
            sprite.setTint(0xffffff);

            // Draw subtle cast shadow on the floor below
            this.shadowGraphics.fillStyle(0x000000, 0.4);
            this.shadowGraphics.fillRect(
              x * GridPresenter.TILE_SIZE,
              (y + 1) * GridPresenter.TILE_SIZE,
              GridPresenter.TILE_SIZE,
              6
            );
          } else {
            // Ceiling / Top wall: Darker stone
            sprite.setTint(0x7a8a9e);
          }
        }

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

    const px = coord.x * GridPresenter.TILE_SIZE;
    const py = coord.y * GridPresenter.TILE_SIZE;

    // Dark underground descent pit
    this.staircaseGraphics.fillStyle(0x120d1e, 1);
    this.staircaseGraphics.fillRect(px + 2, py + 2, 28, 28);

    // Golden descending steps
    const stepColors = [0x8b6508, 0xc69214, 0xffd700];
    for (let i = 0; i < 3; i++) {
      this.staircaseGraphics.fillStyle(stepColors[i]!, 1);
      this.staircaseGraphics.fillRect(px + 4 + i * 2, py + 5 + i * 7, 24 - i * 4, 6);
    }

    // Illuminated golden staircase border
    this.staircaseGraphics.lineStyle(2, 0xffea00, 1);
    this.staircaseGraphics.strokeRect(px + 2, py + 2, 28, 28);
  }

  highlightWalkableArea(validMoves: TileCoordinate[], selectedCoord?: TileCoordinate): void {
    this.clearHighlights();
    this.highlightGraphics.setDepth(1);

    // Draw walkable tiles in bright cyan with a glowing border
    for (const move of validMoves) {
      this.highlightGraphics.fillStyle(0x00d4ff, 0.35);
      this.highlightGraphics.fillRect(
        move.x * GridPresenter.TILE_SIZE + 1,
        move.y * GridPresenter.TILE_SIZE + 1,
        GridPresenter.TILE_SIZE - 2,
        GridPresenter.TILE_SIZE - 2
      );

      this.highlightGraphics.lineStyle(1.5, 0x38bdf8, 0.9);
      this.highlightGraphics.strokeRect(
        move.x * GridPresenter.TILE_SIZE + 1,
        move.y * GridPresenter.TILE_SIZE + 1,
        GridPresenter.TILE_SIZE - 2,
        GridPresenter.TILE_SIZE - 2
      );
    }

    // Draw prominent yellow selection border on the active unit
    if (selectedCoord) {
      this.highlightGraphics.lineStyle(2, 0xffea00, 1);
      this.highlightGraphics.strokeRect(
        selectedCoord.x * GridPresenter.TILE_SIZE,
        selectedCoord.y * GridPresenter.TILE_SIZE,
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
    this.shadowGraphics.clear();
    this.staircaseGraphics.clear();
    this.highlightGraphics.clear();
  }
}
