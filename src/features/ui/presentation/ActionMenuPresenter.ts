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
  private cancelBtn: Phaser.GameObjects.Rectangle;
  private cancelText: Phaser.GameObjects.Text;

  public onAttack?: () => void;
  public onItem?: () => void;
  public onWait?: () => void;
  public onCancel?: () => void;

  private canAttack: boolean = false;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setVisible(false);

    const width = 120;
    const height = 138;
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa)
      .setInteractive(); // Shield against clicking world underneath

    this.container.add(this.bg);

    const btnWidth = 100;
    const btnHeight = 26;
    const startX = 10;

    // 1. ATTACK Button (y = 10)
    const attackY = 10;
    this.attackBtn = this.scene.add.rectangle(startX, attackY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.attackText = this.scene.add.text(startX + 10, attackY + 5, '⚔️ ATTACK', {
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

    // 2. ITEM Button (y = 42)
    const itemY = 42;
    this.itemBtn = this.scene.add.rectangle(startX, itemY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.itemText = this.scene.add.text(startX + 10, itemY + 5, '🎒 ITEM', {
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

    // 3. WAIT Button (y = 74)
    const waitY = 74;
    this.waitBtn = this.scene.add.rectangle(startX, waitY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.waitText = this.scene.add.text(startX + 10, waitY + 5, '⏳ WAIT', {
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

    // 4. CANCEL Button (y = 106)
    const cancelY = 106;
    this.cancelBtn = this.scene.add.rectangle(startX, cancelY, btnWidth, btnHeight, 0x3d1c24)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.cancelText = this.scene.add.text(startX + 10, cancelY + 5, '❌ CANCEL', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setInteractive({ useHandCursor: true });

    const handleCancel = () => {
      if (this.onCancel) this.onCancel();
    };
    this.cancelBtn.on('pointerdown', handleCancel);
    this.cancelText.on('pointerdown', handleCancel);
    this.cancelBtn.on('pointerover', () => this.cancelBtn.setFillStyle(0x5c222c));
    this.cancelBtn.on('pointerout', () => this.cancelBtn.setFillStyle(0x3d1c24));

    this.container.add([
      this.attackBtn, this.attackText,
      this.itemBtn, this.itemText,
      this.waitBtn, this.waitText,
      this.cancelBtn, this.cancelText
    ]);
  }

  public show(worldX: number, worldY: number, canAttack: boolean): void {
    this.canAttack = canAttack;
    if (this.canAttack) {
      this.attackBtn.setFillStyle(0x2a3b5c);
      this.attackText.setColor('#ffffff');
    } else {
      this.attackBtn.setFillStyle(0x1a2436);
      this.attackText.setColor('#556677');
    }

    // Anchor action menu right next to unit in world coordinates
    let finalX = worldX;
    let finalY = worldY;

    // Keep menu inside camera map boundaries dynamically
    const bounds = this.scene.cameras.main.getBounds();
    const mapMaxX = bounds.width > 0 ? bounds.width - 125 : 24 * 32 - 125;
    const mapMaxY = bounds.height > 0 ? bounds.height - 145 : 24 * 32 - 145;
    if (finalX > mapMaxX) finalX = worldX - 125;
    if (finalY > mapMaxY) finalY = mapMaxY;
    if (finalX < 5) finalX = 5;
    if (finalY < 5) finalY = 5;

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
