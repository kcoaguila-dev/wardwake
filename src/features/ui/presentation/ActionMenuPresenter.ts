import * as Phaser from 'phaser';

export class ActionMenuPresenter {
  private container: Phaser.GameObjects.Container;
  private attackBtn: Phaser.GameObjects.Rectangle;
  private attackText: Phaser.GameObjects.Text;
  private itemBtn: Phaser.GameObjects.Rectangle;
  private itemText: Phaser.GameObjects.Text;
  private waitBtn: Phaser.GameObjects.Rectangle;
  private waitText: Phaser.GameObjects.Text;

  public onAttack?: () => void;
  public onItem?: () => void;
  public onWait?: () => void;

  private canAttack: boolean = false;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const width = 120;
    const height = 110;
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa);

    this.container.add(bg);

    const btnWidth = 100;
    const btnHeight = 25;
    const startX = 10;
    const startY = 15;

    // ATTACK
    this.attackBtn = this.scene.add.rectangle(startX, startY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x3f5b8a); })
      .on('pointerout', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x2a3b5c); })
      .on('pointerdown', () => {
        if (this.canAttack && this.onAttack) {
          this.onAttack();
        }
      });
    this.attackText = this.scene.add.text(startX + 10, startY + 5, '⚔️ ATTACK', { fontSize: '14px', color: '#ffffff' });

    // ITEM
    this.itemBtn = this.scene.add.rectangle(startX, startY + 30, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.itemBtn.setFillStyle(0x3f5b8a))
      .on('pointerout', () => this.itemBtn.setFillStyle(0x2a3b5c))
      .on('pointerdown', () => {
        if (this.onItem) this.onItem();
      });
    this.itemText = this.scene.add.text(startX + 10, startY + 35, '🎒 ITEM', { fontSize: '14px', color: '#ffffff' });

    // WAIT
    this.waitBtn = this.scene.add.rectangle(startX, startY + 60, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.waitBtn.setFillStyle(0x3f5b8a))
      .on('pointerout', () => this.waitBtn.setFillStyle(0x2a3b5c))
      .on('pointerdown', () => {
        if (this.onWait) this.onWait();
      });
    this.waitText = this.scene.add.text(startX + 10, startY + 65, '⏳ WAIT', { fontSize: '14px', color: '#ffffff' });

    this.container.add([
      this.attackBtn, this.attackText,
      this.itemBtn, this.itemText,
      this.waitBtn, this.waitText
    ]);
  }

  public show(x: number, y: number, canAttack: boolean): void {
    this.canAttack = canAttack;
    if (this.canAttack) {
      this.attackBtn.setFillStyle(0x2a3b5c);
      this.attackText.setColor('#ffffff');
    } else {
      this.attackBtn.setFillStyle(0x1a2436);
      this.attackText.setColor('#666666');
    }

    // Adjust position so it fits on screen
    const cam = this.scene.cameras.main;
    let finalX = x;
    let finalY = y;
    if (finalX + 120 > cam.width) finalX = cam.width - 120;
    if (finalY + 110 > cam.height) finalY = cam.height - 110;

    this.container.setPosition(finalX, finalY);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
