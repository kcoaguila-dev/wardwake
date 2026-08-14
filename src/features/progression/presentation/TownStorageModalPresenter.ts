import * as Phaser from 'phaser';
import { TownManagerUseCase } from '../application/TownManagerUseCase';
import { GameDatabase } from '../../../core/domain/GameDatabase';

export class TownStorageModalPresenter {
  private container: Phaser.GameObjects.Container;
  private itemsText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene, private townManager: TownManagerUseCase) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const screenWidth = 640;
    const screenHeight = 360;

    const backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.75)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 280;
    const modalHeight = 200;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    const modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0f172a, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xd97706)
      .setInteractive();

    const titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '📦 STORAGE CHEST', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fcd34d'
    }).setOrigin(0.5, 0.5);

    this.itemsText = this.scene.add.text(screenWidth / 2, modalY + 60, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5, 0);

    const closeBtnW = 100;
    const closeBtnH = 28;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 40;

    const closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const closeText = this.scene.add.text(screenWidth / 2, closeBtnY + closeBtnH / 2, 'CLOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    closeBtn.on('pointerdown', () => this.hide());
    backdrop.on('pointerdown', () => this.hide());

    this.container.add([backdrop, modalBg, titleText, this.itemsText, closeBtn, closeText]);
  }

  public show(): void {
    this.refresh();
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  private refresh(): void {
    const data = this.townManager.getTownData();
    if (data.storedItems.length === 0) {
      this.itemsText.setText('The chest is empty.\n\n(Find rare relics in the dungeon\nand survive to store them!)');
    } else {
      const itemNames = data.storedItems.map(id => {
        try {
          return GameDatabase.items.getOrThrow(id).name;
        } catch {
          return id;
        }
      });
      this.itemsText.setText(itemNames.join('\n'));
    }
  }
}
