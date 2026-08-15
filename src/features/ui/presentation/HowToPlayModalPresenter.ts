import * as Phaser from 'phaser';

export class HowToPlayModalPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private closeBtn: Phaser.GameObjects.Rectangle;
  private closeBtnText: Phaser.GameObjects.Text;

  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = 640;
    const screenHeight = 360;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(350);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Dark backdrop shield - clicking backdrop closes modal
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    
    this.backdrop.on('pointerdown', () => this.handleClose());

    const modalWidth = 440;
    const modalHeight = 270;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0c1322, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive(); // Prevent click-through to backdrop

    // 1. Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '📖 EXPEDITION FIELD MANUAL', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    // 2. Guide Text
    const lines = [
      '⚔️ WEAPON TRIANGLE ADVANTAGE (+3 DMG / -3 DMG):',
      '   🗡️ SWORD > 🪓 AXE  |  🪓 AXE > 🔱 LANCE  |  🔱 LANCE > 🗡️ SWORD',
      '',
      '🏃 EXPEDITION MOVEMENT & PARTY TACTICS:',
      ' • WASD / Click : Move 1 tile or Bump-Attack adjacent enemies.',
      ' • Shift + Move : Fast Corridor Sprint. Step on an ally to Swap!',
      ' • Tab / Space  : Cycle active party leader / Wait a turn.',
      ' • I Key        : Open inventory to eat food & equip weapon relics.',
      '',
      '🍖 BELLY & TRAPS:',
      ' • Belly depletes 1% every 10 steps. Eat food before starving!',
      ' • Spike & Poison Traps are hidden in floor tiles until stepped on.',
      ' • Beware Floor 5 & 10 Bosses and purple glowing Dread FOEs!'
    ];

    this.contentText = this.scene.add.text(modalX + 18, modalY + 45, lines.join('\n'), {
      fontSize: '9.5px',
      fontFamily: 'monospace',
      lineSpacing: 3,
      color: '#f1f5f9'
    });

    // 3. Close Button
    const closeBtnW = 140;
    const closeBtnH = 28;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 36;

    this.closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0xef4444)
      .setInteractive({ useHandCursor: true });

    this.closeBtnText = this.scene.add.text(screenWidth / 2, closeBtnY + 14, '❌ CLOSE (Esc)', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    this.closeBtn.on('pointerover', () => this.closeBtn.setFillStyle(0x334155));
    this.closeBtn.on('pointerout', () => this.closeBtn.setFillStyle(0x1e293b));
    this.closeBtn.on('pointerdown', () => this.handleClose());
    this.closeBtnText.on('pointerdown', () => this.handleClose());

    this.container.add([
      this.backdrop,
      this.modalBg,
      this.titleText,
      this.contentText,
      this.closeBtn,
      this.closeBtnText
    ]);
  }

  private handleClose(): void {
    this.hide();
    if (this.onClose) this.onClose();
  }

  public show(): void {
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
