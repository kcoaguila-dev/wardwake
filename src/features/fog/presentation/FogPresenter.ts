import * as Phaser from 'phaser';
import { GridMap } from '../../grid/domain/GridMap';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { VisibilityMap } from '../domain/VisibilityMap';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class FogPresenter {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene) {
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(1.5); // Above floor/walls (0), above staircase/highlights (1), below units (2)
  }

  public drawFog(gridMap: GridMap, visibilityMap: VisibilityMap): void {
    this.graphics.clear();

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        const coord = new TileCoordinate(x, y);
        const px = x * GridPresenter.TILE_SIZE;
        const py = y * GridPresenter.TILE_SIZE;

        if (!visibilityMap.isDiscovered(coord)) {
          // Undiscovered: Pitch black
          this.graphics.fillStyle(0x000000, 1.0);
          this.graphics.fillRect(px, py, GridPresenter.TILE_SIZE, GridPresenter.TILE_SIZE);
        } else if (!visibilityMap.isVisible(coord)) {
          // Discovered but not currently visible: Darkened/semi-transparent
          this.graphics.fillStyle(0x000000, 0.5); // 50% opacity black
          this.graphics.fillRect(px, py, GridPresenter.TILE_SIZE, GridPresenter.TILE_SIZE);
        }
      }
    }
  }

  public clear(): void {
    this.graphics.clear();
  }
}
