import * as Phaser from 'phaser';

export class ActionMenuPresenter {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
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

    const width = 130;
    const height = 120;
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa)
      .setInteractive(); // Blocks clicks to the underlying game world

    this.container.add(this.bg);

    const btnWidth = 110;
    const btnHeight = 28;
    const startX = 10;

    // 1. ATTACK Button (y = 12)
    const attackY = 12;
    this.attackBtn = this.scene.add.rectangle(startX, attackY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.attackText = this.scene.add.text(startX + 12, attackY + 6, '⚔️ ATTACK', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleAttack = () => {
      if (this.canAttack && this.onAttack) this.onAttack();
    };
    this.attackBtn.on('pointerdown', handleAttack);
    this.attackText.on('pointerdown', handleAttack);
    this.attackBtn.on('pointerover', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x3f5b8a); });
    this.attackBtn.on('pointerout', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x2a3b5c); });

    // 2. ITEM Button (y = 46)
    const itemY = 46;
    this.itemBtn = this.scene.add.rectangle(startX, itemY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.itemText = this.scene.add.text(startX + 12, itemY + 6, '🎒 ITEM', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleItem = () => {
      if (this.onItem) this.onItem();
    };
    this.itemBtn.on('pointerdown', handleItem);
    this.itemText.on('pointerdown', handleItem);
    this.itemBtn.on('pointerover', () => this.itemBtn.setFillStyle(0x3f5b8a));
    this.itemBtn.on('pointerout', () => this.itemBtn.setFillStyle(0x2a3b5c));

    // 3. WAIT Button (y = 80)
    const waitY = 80;
    this.waitBtn = this.scene.add.rectangle(startX, waitY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.waitText = this.scene.add.text(startX + 12, waitY + 6, '⏳ WAIT', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleWait = () => {
      if (this.onWait) this.onWait();
    };
    this.waitBtn.on('pointerdown', handleWait);
    this.waitText.on('pointerdown', handleWait);
    this.waitBtn.on('pointerover', () => this.waitBtn.setFillStyle(0x3f5b8a));
    this.waitBtn.on('pointerout', () => this.waitBtn.setFillStyle(0x2a3b5c));

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
      this.attackText.setColor('#556677');
    }

    const cam = this.scene.cameras.main;
    let finalX = x;
    let finalY = y;

    const width = 130;
    const height = 120;

    if (finalX + width > cam.width) finalX = cam.width - width - 10;
    if (finalY + height > cam.height) finalY = cam.height - height - 10;
    if (finalY < 42) finalY = 42;
    if (finalX < 10) finalX = 10;

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
