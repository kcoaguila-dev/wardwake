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
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private subtitleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private restartBtn: Phaser.GameObjects.Rectangle;
  private restartText: Phaser.GameObjects.Text;
  private visible: boolean = false;

  public onRestart?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = 640;
    const screenHeight = 360;

    const modalWidth = 360;
    const modalHeight = 260;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    // 1. Dark backdrop shield (depth: 270)
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.88)
      .setOrigin(0, 0)
      .setDepth(270)
      .setScrollFactor(0)
      .setVisible(false)
      .setInteractive();

    // 2. Modal Frame (depth: 271)
    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x090d16, 0.98)
      .setOrigin(0, 0)
      .setDepth(271)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffd700)
      .setVisible(false)
      .setInteractive();

    // 3. Title (depth: 272)
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 22, '🏆 VICTORY ACHIEVED!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5)
      .setDepth(272)
      .setScrollFactor(0)
      .setVisible(false);

    // 4. Subtitle (depth: 272)
    this.subtitleText = this.scene.add.text(screenWidth / 2, modalY + 44, 'Your expedition has concluded.', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5)
      .setDepth(272)
      .setScrollFactor(0)
      .setVisible(false);

    // 5. Stats List (depth: 272) - Top-left aligned for perfect non-overlapping readability
    this.statsText = this.scene.add.text(modalX + 50, modalY + 68, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      lineSpacing: 5,
      color: '#f8fafc'
    }).setOrigin(0, 0)
      .setDepth(272)
      .setScrollFactor(0)
      .setVisible(false);

    // 6. Return Button (depth: 272, 273)
    const btnWidth = 180;
    const btnHeight = 32;
    const btnY = modalY + modalHeight - 44;
    const btnX = (screenWidth - btnWidth) / 2;

    this.restartBtn = this.scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x1e3a8a)
      .setOrigin(0, 0)
      .setDepth(272)
      .setScrollFactor(0)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.restartText = this.scene.add.text(btnX + btnWidth / 2, btnY + btnHeight / 2, '🔙 RETURN TO TOWN', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5)
      .setDepth(273)
      .setScrollFactor(0)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const handleRestart = () => {
      if (this.visible && this.onRestart) {
        this.onRestart();
      }
    };

    this.restartBtn.on('pointerdown', handleRestart);
    this.restartText.on('pointerdown', handleRestart);
    this.restartBtn.on('pointerover', () => this.restartBtn.setFillStyle(0x2563eb));
    this.restartBtn.on('pointerout', () => this.restartBtn.setFillStyle(0x1e3a8a));

    // Screen-space direct click listener
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;

      const px = pointer.x;
      const py = pointer.y;
      if (px >= btnX && px <= btnX + btnWidth && py >= btnY && py <= btnY + btnHeight) {
        handleRestart();
      }
    });
  }

  public show(stats: RunSummaryStats): void {
    this.visible = true;

    if (stats.isVictory) {
      this.titleText.setText('👑 VICTORY ACHIEVED!');
      this.titleText.setColor('#ffd700');
      this.modalBg.setStrokeStyle(2, 0xffd700);
      this.subtitleText.setText('The Shadow Sovereign has fallen! Dungeon Conquered!');
    } else {
      this.titleText.setText('💀 PARTY DEFEATED');
      this.titleText.setColor('#ef4444');
      this.modalBg.setStrokeStyle(2, 0xef4444);
      this.subtitleText.setText('The squad was overwhelmed in the abyss and evacuated to town.');
    }

    const goldEarned = (stats.monstersSlain * 5) + (stats.floorsCleared * 20) + (stats.isVictory ? 500 : 0);

    const lines = [
      `🏰 Floors Cleared:   ${stats.floorsCleared}`,
      `⚔️ Monsters Slain:   ${stats.monstersSlain}`,
      `⭐ Total EXP Earned: ${stats.totalExp}`,
      `⏳ Turns Taken:      ${stats.turnsTaken}`,
      `🗡️ Relics Collected: ${stats.relicsFound}`,
      ``,
      `💰 Gold Earned:      +${goldEarned}G`
    ];

    if (stats.seedScore !== undefined) {
      lines.push(`🏆 Trial Score:      ${stats.seedScore}`);
    }

    this.statsText.setText(lines.join('\n'));

    this.backdrop.setVisible(true);
    this.modalBg.setVisible(true);
    this.titleText.setVisible(true);
    this.subtitleText.setVisible(true);
    this.statsText.setVisible(true);
    this.restartBtn.setVisible(true);
    this.restartText.setVisible(true);
  }

  public hide(): void {
    this.visible = false;
    this.backdrop.setVisible(false);
    this.modalBg.setVisible(false);
    this.titleText.setVisible(false);
    this.subtitleText.setVisible(false);
    this.statsText.setVisible(false);
    this.restartBtn.setVisible(false);
    this.restartText.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.backdrop.destroy();
    this.modalBg.destroy();
    this.titleText.destroy();
    this.subtitleText.destroy();
    this.statsText.destroy();
    this.restartBtn.destroy();
    this.restartText.destroy();
  }
}
