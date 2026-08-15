import * as Phaser from 'phaser';
import { GridMap } from '../../grid/domain/GridMap';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { VisibilityMap } from '../../fog/domain/VisibilityMap';

export class MinimapPresenter {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private mapGraphics: Phaser.GameObjects.Graphics;
  private entityGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;

  private mapWidth: number = 18;
  private mapHeight: number = 18;
  private boxSize: number = 72;
  private tileSize: number = 3.6;
  private isVisible: boolean = true;

  constructor(private scene: Phaser.Scene) {
    const width = this.scene.scale.width || 640;
    this.container = this.scene.add.container(width - this.boxSize - 10, 48);
    this.container.setScrollFactor(0);
    this.container.setDepth(50);

    // 1. Minimap Background
    this.background = this.scene.add.rectangle(0, 0, this.boxSize, this.boxSize, 0x0a0e17, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x2e384d)
      .setInteractive({ useHandCursor: true });

    this.background.on('pointerdown', () => this.toggle());

    // 2. Mini Map Graphics (Static Floor & Walls)
    this.mapGraphics = this.scene.add.graphics();

    // 3. Mini Entity Graphics (Dynamic Players & Enemies)
    this.entityGraphics = this.scene.add.graphics();

    // 4. Corner Label
    this.labelText = this.scene.add.text(4, 2, 'MAP [M]', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#64748b'
    });

    this.container.add([
      this.background,
      this.mapGraphics,
      this.entityGraphics,
      this.labelText
    ]);

    // Keyboard shortcut 'M'
    this.scene.input.keyboard?.on('keydown-M', () => this.toggle());
  }

  public drawMap(gridMap: GridMap, staircaseCoord: TileCoordinate, visibilityMap?: VisibilityMap): void {
    this.mapWidth = gridMap.width;
    this.mapHeight = gridMap.height;
    this.tileSize = (this.boxSize - 12) / Math.max(this.mapWidth, this.mapHeight);

    this.mapGraphics.clear();

    const offsetX = 6;
    const offsetY = 12;

    for (let x = 0; x < gridMap.width; x++) {
      for (let y = 0; y < gridMap.height; y++) {
        const coord = new TileCoordinate(x, y);
        if (gridMap.isWalkable(coord)) {
          // If a visibility map is provided, only draw discovered tiles
          if (visibilityMap && !visibilityMap.isDiscovered(coord)) {
            continue;
          }
          // Draw floor tile
          this.mapGraphics.fillStyle(0x334155, 0.9);
          this.mapGraphics.fillRect(
            offsetX + x * this.tileSize,
            offsetY + y * this.tileSize,
            Math.max(2, this.tileSize - 0.4),
            Math.max(2, this.tileSize - 0.4)
          );
        }
      }
    }

    // Draw Staircase Exit (Gold) if discovered
    if (!visibilityMap || visibilityMap.isDiscovered(staircaseCoord)) {
      this.mapGraphics.fillStyle(0xffea00, 1);
      this.mapGraphics.fillRect(
        offsetX + staircaseCoord.x * this.tileSize,
        offsetY + staircaseCoord.y * this.tileSize,
        Math.max(3, this.tileSize),
        Math.max(3, this.tileSize)
      );
    }
  }

  public updateEntities(playerCoords: TileCoordinate[], enemyCoords: TileCoordinate[], visibilityMap?: VisibilityMap): void {
    this.entityGraphics.clear();

    const offsetX = 6;
    const offsetY = 12;

    // Draw Enemies (Red Dots)
    this.entityGraphics.fillStyle(0xff3b30, 1);
    for (const coord of enemyCoords) {
      // Only draw enemies if they are currently visible
      if (!visibilityMap || visibilityMap.isVisible(coord)) {
        this.entityGraphics.fillCircle(
          offsetX + coord.x * this.tileSize + this.tileSize / 2,
          offsetY + coord.y * this.tileSize + this.tileSize / 2,
          1.8
        );
      }
    }

    // Draw Players (Cyan/Blue Dots)
    this.entityGraphics.fillStyle(0x00e5ff, 1);
    for (const coord of playerCoords) {
      this.entityGraphics.fillCircle(
        offsetX + coord.x * this.tileSize + this.tileSize / 2,
        offsetY + coord.y * this.tileSize + this.tileSize / 2,
        2.2
      );
    }
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }

  public resize(width: number): void {
    this.container.setPosition(width - this.boxSize - 10, 48);
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.setVisible(visible);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
