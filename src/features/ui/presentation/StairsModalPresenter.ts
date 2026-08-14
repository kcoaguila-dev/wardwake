import * as Phaser from 'phaser';

export class StairsModalPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private infoText: Phaser.GameObjects.Text;

  private descendBtn: Phaser.GameObjects.Rectangle;
  private descendText: Phaser.GameObjects.Text;
  private stayBtn: Phaser.GameObjects.Rectangle;
  private stayText: Phaser.GameObjects.Text;

  public onDescend?: () => void;
  public onStay?: () => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(250);
    this.container.setScrollFactor(0); // Anchored to camera viewport
    this.container.setVisible(false);

    const screenWidth = 640;
    const screenHeight = 360;

    // Semi-transparent backdrop shield
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 260;
    const modalHeight = 150;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    // Modal Background Window
    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive();

    // Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 18, '🪜 STAIRWAY DESCEND', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    // Subtitle / Prompt
    this.descText = this.scene.add.text(screenWidth / 2, modalY + 44, 'Descend to Floor 2?', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Context / Enemies info
    this.infoText = this.scene.add.text(screenWidth / 2, modalY + 68, '⚠️ 2 enemies remain.', {
      fontSize: '9.5px',
      fontFamily: 'monospace',
      color: '#f59e0b'
    }).setOrigin(0.5, 0.5);

    // 1. DESCEND Button
    const btnWidth = 105;
    const btnHeight = 28;
    const btnY = modalY + 98;

    const descendBtnX = screenWidth / 2 - btnWidth - 8;
    this.descendBtn = this.scene.add.rectangle(descendBtnX, btnY, btnWidth, btnHeight, 0x1e3a8a)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    this.descendText = this.scene.add.text(descendBtnX + btnWidth / 2, btnY + btnHeight / 2, '⬇️ DESCEND', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    const handleDescend = () => {
      if (this.onDescend) this.onDescend();
    };
    this.descendBtn.on('pointerdown', handleDescend);
    this.descendText.on('pointerdown', handleDescend);
    this.descendBtn.on('pointerover', () => this.descendBtn.setFillStyle(0x2563eb));
    this.descendBtn.on('pointerout', () => this.descendBtn.setFillStyle(0x1e3a8a));

    // 2. STAY / CANCEL Button
    const stayBtnX = screenWidth / 2 + 8;
    this.stayBtn = this.scene.add.rectangle(stayBtnX, btnY, btnWidth, btnHeight, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x64748b)
      .setInteractive({ useHandCursor: true });

    this.stayText = this.scene.add.text(stayBtnX + btnWidth / 2, btnY + btnHeight / 2, '❌ STAY', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    const handleStay = () => {
      if (this.onStay) this.onStay();
    };
    this.stayBtn.on('pointerdown', handleStay);
    this.stayText.on('pointerdown', handleStay);
    this.stayBtn.on('pointerover', () => this.stayBtn.setFillStyle(0x475569));
    this.stayBtn.on('pointerout', () => this.stayBtn.setFillStyle(0x334155));

    this.container.add([
      this.backdrop,
      this.modalBg,
      this.titleText,
      this.descText,
      this.infoText,
      this.descendBtn,
      this.descendText,
      this.stayBtn,
      this.stayText
    ]);
  }

  public show(nextFloor: number, remainingEnemies: number): void {
    this.descText.setText(`Descend deeper to Floor ${nextFloor}?`);

    if (remainingEnemies > 0) {
      this.infoText.setColor('#f59e0b');
      this.infoText.setText(`⚠️ ${remainingEnemies} ${remainingEnemies === 1 ? 'enemy remains' : 'enemies remain'}.`);
    } else {
      this.infoText.setColor('#34d399');
      this.infoText.setText('✨ All enemies cleared!');
    }

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
