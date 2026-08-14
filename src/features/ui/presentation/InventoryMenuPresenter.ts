import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { Item, ItemType } from '../../inventory/domain/Item';

export class InventoryMenuPresenter {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private itemBtns: Phaser.GameObjects.Container[] = [];

  public onSelectItem?: (item: Item) => void;
  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(210);
    this.container.setVisible(false);

    const width = 200;
    const height = 240;

    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa)
      .setInteractive();

    this.titleText = this.scene.add.text(12, 12, '🎒 INVENTORY', {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    const closeBtn = this.scene.add.text(width - 28, 10, '✖', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff5555'
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.onClose) this.onClose();
      });

    this.container.add([this.bg, this.titleText, closeBtn]);
  }

  public show(unit: Unit, worldX?: number, worldY?: number): void {
    // Clear previous items
    this.itemBtns.forEach(btn => btn.destroy());
    this.itemBtns = [];

    let startY = 40;

    if (unit.inventory.length === 0) {
      const emptyText = this.scene.add.text(12, startY, '(Empty)', {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#8899aa'
      });
      const container = this.scene.add.container(0, 0, [emptyText]);
      this.itemBtns.push(container);
      this.container.add(container);
    } else {
      unit.inventory.forEach((item, index) => {
        const btnContainer = this.scene.add.container(10, startY + (index * 36));

        const btnBg = this.scene.add.rectangle(0, 0, 180, 30, 0x2a3b5c)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => btnBg.setFillStyle(0x3f5b8a))
          .on('pointerout', () => btnBg.setFillStyle(0x2a3b5c))
          .on('pointerdown', () => {
            if (this.onSelectItem) this.onSelectItem(item);
          });

        const itemTextStr = item.type === ItemType.HEAL ? `🧪 ${item.name}` : `💍 ${item.name}`;
        const itemText = this.scene.add.text(10, 6, itemTextStr, {
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#ffffff'
        }).setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            if (this.onSelectItem) this.onSelectItem(item);
          });

        btnContainer.add([btnBg, itemText]);
        this.itemBtns.push(btnContainer);
        this.container.add(btnContainer);
      });
    }

    if (worldX !== undefined && worldY !== undefined) {
      let finalX = worldX;
      let finalY = worldY;
      const mapMaxX = 18 * 32 - 205;
      const mapMaxY = 18 * 32 - 245;
      if (finalX > mapMaxX) finalX = worldX - 205;
      if (finalY > mapMaxY) finalY = mapMaxY;
      if (finalX < 5) finalX = 5;
      if (finalY < 5) finalY = 5;
      this.container.setPosition(finalX, finalY);
    } else {
      const cam = this.scene.cameras.main;
      this.container.setPosition(cam.worldView.centerX - 100, cam.worldView.centerY - 120);
    }

    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
