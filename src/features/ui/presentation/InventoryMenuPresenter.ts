import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { Item, ItemType } from '../../inventory/domain/Item';

export class InventoryMenuPresenter {
  private baseElements: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
  private backdrop: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private closeBtnBg: Phaser.GameObjects.Rectangle;
  private closeBtnText: Phaser.GameObjects.Text;
  private itemGameObjects: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

  private visible: boolean = false;
  public onSelectItem?: (item: Item) => void;
  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    const width = 230;
    const height = 230;
    const modalX = (screenWidth - width) / 2;
    const modalY = (screenHeight - height) / 2;

    // 1. Full-screen backdrop shield (Depth 240)
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(240)
      .setInteractive();

    this.backdrop.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.hide();
      if (this.onClose) this.onClose();
    });

    // 2. Modal Background Window (Depth 241)
    this.bg = this.scene.add.rectangle(modalX, modalY, width, height, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(241)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive();

    // 3. Title (Depth 242)
    this.titleText = this.scene.add.text(modalX + 16, modalY + 16, '🎒 INVENTORY', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(242);

    // 4. Dedicated Close Button (Depth 243-244)
    const closeX = modalX + width - 20;
    const closeY = modalY + 20;
    this.closeBtnBg = this.scene.add.rectangle(closeX, closeY, 26, 26, 0x1e293b)
      .setScrollFactor(0)
      .setDepth(243)
      .setStrokeStyle(1.5, 0xef4444)
      .setInteractive({ useHandCursor: true });

    this.closeBtnText = this.scene.add.text(closeX, closeY, '✖', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(244).setInteractive({ useHandCursor: true });

    const triggerClose = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.hide();
      if (this.onClose) this.onClose();
    };

    this.closeBtnBg.on('pointerdown', triggerClose);
    this.closeBtnText.on('pointerdown', triggerClose);
    this.closeBtnBg.on('pointerover', () => this.closeBtnBg.setFillStyle(0x7f1d1d));
    this.closeBtnBg.on('pointerout', () => this.closeBtnBg.setFillStyle(0x1e293b));

    this.baseElements = [this.backdrop, this.bg, this.titleText, this.closeBtnBg, this.closeBtnText];

    // Hide by default
    this.setVisible(false);

    // Keyboard shortcut to close
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible && this.onClose) this.onClose();
    });
  }

  private setVisible(state: boolean): void {
    this.visible = state;
    this.baseElements.forEach(el => el.setVisible(state));
    this.itemGameObjects.forEach(el => el.setVisible(state));
  }

  public show(unit: Unit): void {
    // Clear previous dynamic item rows
    this.itemGameObjects.forEach(obj => obj.destroy());
    this.itemGameObjects = [];

    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    const width = 230;
    const height = 230;
    const modalX = (screenWidth - width) / 2;
    const modalY = (screenHeight - height) / 2;
    const startY = 48;

    if (unit.inventory.length === 0) {
      const emptyText = this.scene.add.text(modalX + width / 2, modalY + startY + 40, '(Bag is Empty)', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#64748b'
      }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(242);
      this.itemGameObjects.push(emptyText);
    } else {
      unit.inventory.forEach((item, index) => {
        const btnX = modalX + 10;
        const btnY = modalY + startY + (index * 34);

        const btnBg = this.scene.add.rectangle(btnX, btnY, 210, 28, 0x1e293b)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(243)
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
        }).setScrollFactor(0).setDepth(244).setInteractive({ useHandCursor: true });

        const selectItem = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
          if (event && event.stopPropagation) event.stopPropagation();
          if (this.visible && this.onSelectItem) {
            this.onSelectItem(item);
          }
        };

        btnBg.on('pointerdown', selectItem);
        itemText.on('pointerdown', selectItem);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x334155));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x1e293b));
        itemText.on('pointerover', () => btnBg.setFillStyle(0x334155));
        itemText.on('pointerout', () => btnBg.setFillStyle(0x1e293b));

        this.itemGameObjects.push(btnBg, itemText);
      });
    }

    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.baseElements.forEach(el => el.destroy());
    this.itemGameObjects.forEach(el => el.destroy());
    this.baseElements = [];
    this.itemGameObjects = [];
  }
}
