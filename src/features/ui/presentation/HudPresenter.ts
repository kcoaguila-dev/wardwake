import * as Phaser from 'phaser';

export class HudPresenter {
  private floorText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;
  private turnText: Phaser.GameObjects.Text;
  private endTurnButton: Phaser.GameObjects.Text;
  private muteButton: Phaser.GameObjects.Text;
  private onMuteToggleCallback?: () => void;
  private isMuted: boolean = false;

  constructor(private scene: Phaser.Scene) {
    const width = this.scene.scale.width || 640;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x0f131c, 0.95);
    graphics.fillRect(0, 0, width, 40);
    graphics.lineStyle(1, 0x2e384d, 1);
    graphics.lineBetween(0, 39, width, 39);
    graphics.setScrollFactor(0);
    graphics.setDepth(10);

    const fontStyle = {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0',
    };

    this.floorText = this.scene.add.text(12, 12, '🏰 Floor 1', fontStyle);
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(11);

    this.phaseText = this.scene.add.text(110, 12, '🔵 EXPLORE', fontStyle);
    this.phaseText.setScrollFactor(0);
    this.phaseText.setDepth(11);

    this.turnText = this.scene.add.text(215, 12, '⏳ Turn 1', fontStyle);
    this.turnText.setScrollFactor(0);
    this.turnText.setDepth(11);

    // End Turn Button
    this.endTurnButton = this.scene.add.text(width - 130, 10, '[⏳ END TURN]', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0',
      backgroundColor: '#1e293b',
      padding: { x: 6, y: 3 }
    });
    this.endTurnButton.setScrollFactor(0);
    this.endTurnButton.setDepth(11);
    this.endTurnButton.setInteractive({ useHandCursor: true });
    this.endTurnButton.on('pointerover', () => this.endTurnButton.setColor('#ffff00'));
    this.endTurnButton.on('pointerout', () => this.endTurnButton.setColor('#e2e8f0'));
    this.endTurnButton.on('pointerdown', () => {
      this.scene.events.emit('ON_END_TURN_CLICKED');
    });

    // Mute Button
    this.muteButton = this.scene.add.text(width - 32, 10, '🔊', {
      fontSize: '14px',
      fontFamily: 'monospace',
      padding: { x: 4, y: 2 }
    });
    this.muteButton.setScrollFactor(0);
    this.muteButton.setDepth(11);
    this.muteButton.setInteractive({ useHandCursor: true });
    this.muteButton.on('pointerdown', () => {
      this.isMuted = !this.isMuted;
      this.muteButton.setText(this.isMuted ? '🔇' : '🔊');
      if (this.onMuteToggleCallback) {
        this.onMuteToggleCallback();
      }
    });
  }

  setOnMuteToggle(callback: () => void): void {
    this.onMuteToggleCallback = callback;
  }

  updateFloor(floor: number): void {
    this.floorText.setText(`🏰 Floor ${floor}`);
  }

  updatePhase(phase: string): void {
    this.phaseText.setText(phase);
  }

  updateTurns(turns: number): void {
    this.turnText.setText(`⏳ Turn ${turns}`);
  }

  updateEnemies(count: number): void {
    // Deprecated for fog of war mystery, replaced with turn count or no-op
  }
}
