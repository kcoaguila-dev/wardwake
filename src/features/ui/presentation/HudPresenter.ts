import * as Phaser from 'phaser';

export class HudPresenter {
  private floorText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;
  private enemiesText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 320, 40);
    graphics.setScrollFactor(0);
    graphics.setDepth(10); // make sure it's above everything

    this.floorText = this.scene.add.text(5, 10, '🏰 Floor 1', { fontSize: '14px', color: '#ffffff' });
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(11);

    this.phaseText = this.scene.add.text(100, 10, '🔵 PLAYER PHASE', { fontSize: '14px', color: '#ffffff' });
    this.phaseText.setScrollFactor(0);
    this.phaseText.setDepth(11);

    this.enemiesText = this.scene.add.text(230, 10, 'Enemies: 0', { fontSize: '14px', color: '#ffffff' });
    this.enemiesText.setScrollFactor(0);
    this.enemiesText.setDepth(11);
  }

  updateFloor(floor: number): void {
    this.floorText.setText(`🏰 Floor ${floor}`);
  }

  updatePhase(phase: string): void {
    this.phaseText.setText(phase);
  }

  updateEnemies(count: number): void {
    this.enemiesText.setText(`Enemies: ${count}`);
  }
}
