import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { Item, ItemType } from '../../inventory/domain/Item';

export class InventoryMenuPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private closeBtnBg: Phaser.GameObjects.Rectangle;
  private closeBtnText: Phaser.GameObjects.Text;
  private itemGameObjects: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

  public onSelectItem?: (item: Item) => void;
  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    const width = 230;
    const height = 230;
    const modalX = (screenWidth - width) / 2;
    const modalY = (screenHeight - height) / 2;

    this.container = this.scene.add.container(modalX, modalY);
    this.container.setScrollFactor(0);
    this.container.setDepth(240);
    this.container.setVisible(false);

    // Full screen backdrop shield (depth 239)
    this.backdrop = this.scene.add.rectangle(-modalX, -modalY, screenWidth, screenHeight, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: any) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (this.onClose) this.onClose();
      });

    // Modal Background
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive();

    // Title
    this.titleText = this.scene.add.text(14, 14, '🎒 INVENTORY', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    // Dedicated Close Button
    this.closeBtnBg = this.scene.add.rectangle(width - 20, 20, 26, 26, 0x1e293b)
      .setStrokeStyle(1.5, 0xef4444)
      .setInteractive({ useHandCursor: true });

    this.closeBtnText = this.scene.add.text(width - 20, 20, '✖', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    const triggerClose = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.onClose) this.onClose();
    };

    this.closeBtnBg.on('pointerdown', triggerClose);
    this.closeBtnText.on('pointerdown', triggerClose);
    this.closeBtnBg.on('pointerover', () => this.closeBtnBg.setFillStyle(0x7f1d1d));
    this.closeBtnBg.on('pointerout', () => this.closeBtnBg.setFillStyle(0x1e293b));

    this.container.add([this.backdrop, this.bg, this.titleText, this.closeBtnBg, this.closeBtnText]);
  }

  public show(unit: Unit): void {
    // Clear previous items
    this.itemGameObjects.forEach(obj => obj.destroy());
    this.itemGameObjects = [];

    const width = 230;
    let startY = 44;

    if (unit.inventory.length === 0) {
      const emptyText = this.scene.add.text(width / 2, startY + 40, '(Bag is Empty)', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#64748b'
      }).setOrigin(0.5, 0.5);
      this.itemGameObjects.push(emptyText);
      this.container.add(emptyText);
    } else {
      unit.inventory.forEach((item, index) => {
        const btnX = 10;
        const btnY = startY + (index * 34);

        const btnBg = this.scene.add.rectangle(btnX, btnY, 210, 28, 0x1e293b)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0x334155)
          .setInteractive({ useHandCursor: true });

        let icon = '🧪';
        if (item.type === ItemType.FOOD) icon = '🍞';
        else if (item.type === ItemType.ATTACK_BUFF) icon = '⚔️';
        else if (item.type === ItemType.RELIC_WEAPON || item.type === ItemType.RELIC_ARMOR) icon = '💍';

        const itemText = this.scene.add.text(btnX + 8, btnY + 7, `${icon} ${item.name}`, {
          fontSize: '11px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#f8fafc'
        }).setInteractive({ useHandCursor: true });

        const selectItem = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
          if (event && event.stopPropagation) event.stopPropagation();
          if (this.onSelectItem) this.onSelectItem(item);
        };

        btnBg.on('pointerdown', selectItem);
        itemText.on('pointerdown', selectItem);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x334155));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x1e293b));
        itemText.on('pointerover', () => btnBg.setFillStyle(0x334155));
        itemText.on('pointerout', () => btnBg.setFillStyle(0x1e293b));

        this.itemGameObjects.push(btnBg, itemText);
        this.container.add([btnBg, itemText]);
      });
    }

    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    this.container.setPosition((screenWidth - width) / 2, (screenHeight - 230) / 2);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
