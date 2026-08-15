import * as Phaser from 'phaser';

export interface RunSummaryStats {
  isVictory: boolean;
  floorsCleared: number;
  monstersSlain: number;
  totalExp: number;
  turnsTaken: number;
  relicsFound: number;
  seedScore?: number;
}

export class RunSummaryModalPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private subtitleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private restartBtn: Phaser.GameObjects.Rectangle;
  private restartText: Phaser.GameObjects.Text;

  public onRestart?: () => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const screenWidth = 640;
    const screenHeight = 360;

    // Dark backdrop shield
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 320;
    const modalHeight = 220;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x090d16, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive();

    // 1. Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 24, '🏆 VICTORY ACHIEVED!', {
      fontSize: '15px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5);

    // 2. Subtitle
    this.subtitleText = this.scene.add.text(screenWidth / 2, modalY + 48, 'Your expedition has concluded.', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    // 3. Stats Grid Text
    this.statsText = this.scene.add.text(screenWidth / 2, modalY + 105, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      lineSpacing: 5,
      align: 'center',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5);

    // 4. Play Again Button
    const btnWidth = 150;
    const btnHeight = 32;
    const btnY = modalY + 168;
    const btnX = (screenWidth - btnWidth) / 2;

    this.restartBtn = this.scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x1e3a8a)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    this.restartText = this.scene.add.text(btnX + btnWidth / 2, btnY + btnHeight / 2, '🔙 RETURN TO TOWN', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    const handleRestart = () => {
      if (this.isVisible() && this.onRestart) this.onRestart();
    };
    this.restartBtn.on('pointerdown', handleRestart);
    this.restartText.on('pointerdown', handleRestart);
    this.restartBtn.on('pointerover', () => this.restartBtn.setFillStyle(0x2563eb));
    this.restartBtn.on('pointerout', () => this.restartBtn.setFillStyle(0x1e3a8a));

    // Screen-space pointer listener
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      if (px >= btnX && px <= btnX + btnWidth && py >= btnY && py <= btnY + btnHeight) {
        handleRestart();
      }
    });

    this.container.add([
      this.backdrop,
      this.modalBg,
      this.titleText,
      this.subtitleText,
      this.statsText,
      this.restartBtn,
      this.restartText
    ]);
  }

  public show(stats: RunSummaryStats): void {
    if (stats.isVictory) {
      this.titleText.setText('🏆 VICTORY ACHIEVED!');
      this.titleText.setColor('#ffd700');
      this.subtitleText.setText('The Shadow Sovereign has fallen! Dungeon Conquered!');
    } else {
      this.titleText.setText('💀 EXPEDITION FAILED');
      this.titleText.setColor('#ef4444');
      this.subtitleText.setText('All heroes have fallen in the dungeon depths.');
    }

    const goldEarned = (stats.monstersSlain * 5) + (stats.floorsCleared * 20) + (stats.isVictory ? 500 : 0);

    const lines = [
      `🏰 Floors Cleared:   ${stats.floorsCleared}`,
      `⚔️ Monsters Slain:   ${stats.monstersSlain}`,
      `⭐ Total EXP Earned: ${stats.totalExp}`,
      `⏳ Turns Taken:      ${stats.turnsTaken}`,
      `🗡️ Relics Collected: ${stats.relicsFound}`,
      ``,
      `💰 Gold Earned:      ${goldEarned}`
    ];

    if (stats.seedScore !== undefined) {
      lines.push(``);
      lines.push(`🏆 Trial Score:      ${stats.seedScore}`);
    }

    this.statsText.setText(lines.join('\n'));

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
