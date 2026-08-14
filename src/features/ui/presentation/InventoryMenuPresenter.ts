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
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const width = 200;
    const height = 250;
    const cam = this.scene.cameras.main;

    this.container.setPosition((cam.width - width) / 2, (cam.height - height) / 2);

    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa);

    this.titleText = this.scene.add.text(10, 10, '🎒 INVENTORY', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });

    const closeBtn = this.scene.add.text(width - 30, 10, '✖', { fontSize: '16px', color: '#ff5555' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.onClose) this.onClose();
      });

    this.container.add([this.bg, this.titleText, closeBtn]);
  }

  public show(unit: Unit): void {
    // Clear previous items
    this.itemBtns.forEach(btn => btn.destroy());
    this.itemBtns = [];

    let startY = 40;

    if (unit.inventory.length === 0) {
      const emptyText = this.scene.add.text(10, startY, 'Empty', { fontSize: '14px', color: '#aaaaaa' });
      const container = this.scene.add.container(0, 0, [emptyText]);
      this.itemBtns.push(container);
      this.container.add(container);
    } else {
      unit.inventory.forEach((item, index) => {
        const btnContainer = this.scene.add.container(10, startY + (index * 35));

        const btnBg = this.scene.add.rectangle(0, 0, 180, 30, 0x2a3b5c)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => btnBg.setFillStyle(0x3f5b8a))
          .on('pointerout', () => btnBg.setFillStyle(0x2a3b5c))
          .on('pointerdown', () => {
            if (this.onSelectItem) this.onSelectItem(item);
          });

        const itemTextStr = item.type === ItemType.HEAL ? `🧪 ${item.name}` : `💍 ${item.name}`;
        const itemText = this.scene.add.text(10, 5, itemTextStr, { fontSize: '14px', color: '#ffffff' });

        btnContainer.add([btnBg, itemText]);
        this.itemBtns.push(btnContainer);
        this.container.add(btnContainer);
      });
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
