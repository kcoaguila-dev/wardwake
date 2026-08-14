import * as Phaser from 'phaser';

export class HudPresenter {
  private floorText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;
  private enemiesText: Phaser.GameObjects.Text;
  private endTurnButton: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x0f131c, 0.95);
    graphics.fillRect(0, 0, 320, 40);
    graphics.lineStyle(1, 0x2e384d, 1);
    graphics.lineBetween(0, 39, 320, 39);
    graphics.setScrollFactor(0);
    graphics.setDepth(10);

    const fontStyle = {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0',
    };

    this.floorText = this.scene.add.text(8, 12, '🏰 Floor 1', fontStyle);
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(11);

    this.phaseText = this.scene.add.text(90, 12, '🔵 PLAYER', fontStyle);
    this.phaseText.setScrollFactor(0);
    this.phaseText.setDepth(11);

    this.enemiesText = this.scene.add.text(215, 12, '⚔️ Left: 0', fontStyle);
    this.enemiesText.setScrollFactor(0);
    this.enemiesText.setDepth(11);

    // Create [⏳ END TURN] button
    this.endTurnButton = this.scene.add.text(8, 48, '[⏳ END TURN]', {
      ...fontStyle,
      color: '#fbbf24', // Golden color for interactivity
      backgroundColor: '#1e293b',
      padding: { x: 4, y: 2 }
    });
    this.endTurnButton.setScrollFactor(0);
    this.endTurnButton.setDepth(11);
    this.endTurnButton.setInteractive({ useHandCursor: true });

    this.endTurnButton.on('pointerdown', () => {
      this.scene.events.emit('ON_END_TURN_CLICKED');
    });

    this.endTurnButton.on('pointerover', () => {
      this.endTurnButton.setStyle({ color: '#ffffff' });
    });

    this.endTurnButton.on('pointerout', () => {
      this.endTurnButton.setStyle({ color: '#fbbf24' });
    });
  }

  updateFloor(floor: number): void {
    this.floorText.setText(`🏰 Floor ${floor}`);
  }

  updatePhase(phase: string): void {
    this.phaseText.setText(phase);
  }

  updateEnemies(count: number): void {
    this.enemiesText.setText(`⚔️ Left: ${count}`);
  }
}
