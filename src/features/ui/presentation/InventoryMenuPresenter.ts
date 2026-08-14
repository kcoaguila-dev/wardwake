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
    const screenWidth = this.scene.scale.width || 640;
    const width = 220;
    const height = 230;

    this.container = this.scene.add.container((screenWidth - width) / 2, 48);
    this.container.setScrollFactor(0);
    this.container.setDepth(220);
    this.container.setVisible(false);

    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x0f172a, 0.97)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive();

    this.titleText = this.scene.add.text(14, 12, '🎒 INVENTORY', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    const closeBtn = this.scene.add.text(width - 24, 10, '✖', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#f87171'
    })
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

    const width = 220;
    let startY = 38;

    if (unit.inventory.length === 0) {
      const emptyText = this.scene.add.text(width / 2, startY + 30, '(Bag is Empty)', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#64748b'
      }).setOrigin(0.5, 0.5);
      const container = this.scene.add.container(0, 0, [emptyText]);
      this.itemBtns.push(container);
      this.container.add(container);
    } else {
      unit.inventory.forEach((item, index) => {
        const btnContainer = this.scene.add.container(10, startY + (index * 34));

        const btnBg = this.scene.add.rectangle(0, 0, 200, 28, 0x1e293b)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0x334155)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => btnBg.setFillStyle(0x334155))
          .on('pointerout', () => btnBg.setFillStyle(0x1e293b))
          .on('pointerdown', () => {
            if (this.onSelectItem) this.onSelectItem(item);
          });

        let icon = '🧪';
        if (item.type === ItemType.FOOD) icon = '🍞';
        else if (item.type === ItemType.ATTACK_BUFF) icon = '⚔️';
        else if (item.type === ItemType.RELIC_WEAPON || item.type === ItemType.RELIC_ARMOR) icon = '💍';

        const itemText = this.scene.add.text(8, 6, `${icon} ${item.name}`, {
          fontSize: '11px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#f8fafc'
        }).setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            if (this.onSelectItem) this.onSelectItem(item);
          });

        btnContainer.add([btnBg, itemText]);
        this.itemBtns.push(btnContainer);
        this.container.add(btnContainer);
      });
    }

    const screenWidth = this.scene.scale.width || 640;
    this.container.setPosition((screenWidth - width) / 2, 48);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
