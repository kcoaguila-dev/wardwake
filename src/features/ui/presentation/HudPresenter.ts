import * as Phaser from 'phaser';

export class HudPresenter {
  private floorText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;
  private turnText: Phaser.GameObjects.Text;
  private endTurnButton: Phaser.GameObjects.Text;
  private settingsButton: Phaser.GameObjects.Text;
  private muteButton: Phaser.GameObjects.Text;
  private seedText?: Phaser.GameObjects.Text;
  private onMuteToggleCallback?: () => void;
  private onSettingsClickCallback?: () => void;
  private isMuted: boolean = false;

  constructor(private scene: Phaser.Scene) {
    const width = this.scene.scale.width || 640;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x0a0e17, 0.96);
    graphics.fillRect(0, 0, width, 38);
    graphics.lineStyle(1, 0x1e293b, 1);
    graphics.lineBetween(0, 38, width, 38);
    graphics.setScrollFactor(0);
    graphics.setDepth(10);

    const fontStyle = {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0',
    };

    this.floorText = this.scene.add.text(10, 11, '🏰 F1', fontStyle);
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(11);

    this.phaseText = this.scene.add.text(80, 11, '🔵 EXPLORE', fontStyle);
    this.phaseText.setScrollFactor(0);
    this.phaseText.setDepth(11);

    this.turnText = this.scene.add.text(175, 11, '⏳ T1', fontStyle);
    this.turnText.setScrollFactor(0);
    this.turnText.setDepth(11);

    // End Turn Button
    this.endTurnButton = this.scene.add.text(width - 152, 8, '[⏳ END TURN]', {
      fontSize: '11px',
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

    // Seed Text
    this.seedText = this.scene.add.text(width / 2, 8, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#34d399',
      backgroundColor: '#064e3b',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0);
    this.seedText.setScrollFactor(0);
    this.seedText.setDepth(11);
    this.seedText.setVisible(false);

    // Settings Button (⚙️)
    this.settingsButton = this.scene.add.text(width - 54, 8, '⚙️', {
      fontSize: '13px',
      fontFamily: 'monospace',
      padding: { x: 4, y: 2 }
    });
    this.settingsButton.setScrollFactor(0);
    this.settingsButton.setDepth(11);
    this.settingsButton.setInteractive({ useHandCursor: true });
    this.settingsButton.on('pointerdown', () => {
      if (this.onSettingsClickCallback) {
        this.onSettingsClickCallback();
      }
    });

    // Mute Button (🔊)
    this.muteButton = this.scene.add.text(width - 28, 8, '🔊', {
      fontSize: '13px',
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

    this.relayout();
  }

  private relayout(): void {
    const spacing = 12;
    const pX = this.floorText.x + this.floorText.width + spacing;
    this.phaseText.setX(pX);
    const tX = this.phaseText.x + this.phaseText.width + spacing;
    this.turnText.setX(tX);
  }

  setOnMuteToggle(callback: () => void): void {
    this.onMuteToggleCallback = callback;
  }

  setOnSettingsClick(callback: () => void): void {
    this.onSettingsClickCallback = callback;
  }

  updateFloor(floor: number, modifier?: string): void {
    if (modifier && modifier !== 'NORMAL') {
      const labelMap: Record<string, string> = {
        'DARK_LABYRINTH': '🌙 DARK',
        'TREASURE_VAULT': '💰 VAULT',
        'MONSTER_SURGE': '👹 SURGE',
        'GOLD_RUSH': '🪙 GOLD'
      };
      const modLabel = labelMap[modifier] || modifier;
      this.floorText.setText(`🏰 F${floor} • ${modLabel}`);
    } else {
      this.floorText.setText(`🏰 F${floor}`);
    }
    this.relayout();
  }

  updatePhase(phase: string): void {
    this.phaseText.setText(phase);
    this.relayout();
  }

  updateTurns(turns: number): void {
    this.turnText.setText(`⏳ T${turns}`);
    this.relayout();
  }

  updateEnemies(_count: number): void {
    // Deprecated for fog of war mystery
  }

  updateSeedInfo(seed: string | null): void {
    if (seed && this.seedText) {
      this.seedText.setText(`🌱 SEED: ${seed}`);
      this.seedText.setVisible(true);
    } else if (this.seedText) {
      this.seedText.setVisible(false);
    }
  }
}
