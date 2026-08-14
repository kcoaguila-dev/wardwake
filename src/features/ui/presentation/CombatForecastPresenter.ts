import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { CombatResolver } from '../../combat/domain/CombatResolver';

export class CombatForecastPresenter {
  private container: Phaser.GameObjects.Container;
  private bgRect: Phaser.GameObjects.Rectangle;
  private forecastText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(60);
    this.container.setVisible(false);

    // Compact floating pill
    this.bgRect = this.scene.add.rectangle(0, 0, 140, 20, 0x0f172a, 0.94)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1.5, 0xffd700);

    this.forecastText = this.scene.add.text(0, 0, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.container.add([this.bgRect, this.forecastText]);
  }

  public show(attacker: Unit, defender: Unit, worldX: number, worldY: number): void {
    const result = CombatResolver.calculateDamage(attacker, defender);
    const newHp = Math.max(0, defender.currentHp - result.damageDealt);
    const isLethal = newHp === 0;

    let icon = '⚔️';
    if (attacker.weaponType === 'LANCE') icon = '🔱';
    else if (attacker.weaponType === 'AXE') icon = '🪓';

    let strokeColor = 0x38bdf8; // Default Cyan
    let textColor = '#ffffff';

    let previewString = '';
    if (isLethal) {
      previewString = `${icon} ${result.damageDealt} DMG (1-Hit Kill! 🔥)`;
      strokeColor = 0xff4444;
      textColor = '#fca5a5';
    } else if (result.hasAdvantage) {
      previewString = `${icon} ${result.damageDealt} DMG [${defender.currentHp}➔${newHp} HP]`;
      strokeColor = 0xffd700;
      textColor = '#fef08a';
    } else if (result.hasDisadvantage) {
      previewString = `${icon} ${result.damageDealt} DMG [${defender.currentHp}➔${newHp} HP]`;
      strokeColor = 0x64748b;
      textColor = '#cbd5e1';
    } else {
      previewString = `${icon} ${result.damageDealt} DMG [${defender.currentHp}➔${newHp} HP]`;
      strokeColor = 0x38bdf8;
      textColor = '#ffffff';
    }

    this.bgRect.setStrokeStyle(1.5, strokeColor);
    this.forecastText.setColor(textColor);
    this.forecastText.setText(previewString);

    // Auto-adjust pill width based on text length
    const pillWidth = Math.max(130, this.forecastText.width + 16);
    this.bgRect.setSize(pillWidth, 20);

    // Position directly above the targeted unit in world space
    this.container.setPosition(worldX, worldY - 24);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
