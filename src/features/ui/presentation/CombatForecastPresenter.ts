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
    this.bgRect = this.scene.add.rectangle(0, 0, 180, 20, 0x0f172a, 0.94)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1.5, 0xffd700);

    this.forecastText = this.scene.add.text(0, 0, '', {
      fontSize: '9.5px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.container.add([this.bgRect, this.forecastText]);
  }

  public show(attacker: Unit, defender: Unit, worldX: number, worldY: number): void {
    const { hitChance, critChance, hasAdvantage, hasDisadvantage } = CombatResolver.calculateRates(attacker, defender);
    // Calculate deterministic base damage for forecast
    let bonusDamage = 0;
    if (hasAdvantage) bonusDamage = CombatResolver.ADVANTAGE_BONUS_DAMAGE;
    else if (hasDisadvantage) bonusDamage = CombatResolver.DISADVANTAGE_PENALTY_DAMAGE;
    const baseDamage = Math.max(1, (attacker.attack + bonusDamage) - defender.defense);

    const newHp = Math.max(0, defender.currentHp - baseDamage);
    const isLethal = newHp === 0;

    let icon = '⚔️';
    if (attacker.weaponType === 'LANCE') icon = '🔱';
    else if (attacker.weaponType === 'AXE') icon = '🪓';

    let strokeColor = 0x38bdf8; // Default Cyan
    let textColor = '#ffffff';

    const hitPct = Math.round(hitChance * 100);
    const critPct = Math.round(critChance * 100);

    let previewString = '';
    if (isLethal) {
      previewString = `${icon} ${baseDamage} DMG (1-Hit Kill! 🔥) [Hit ${hitPct}% | Crit ${critPct}%]`;
      strokeColor = 0xff4444;
      textColor = '#fca5a5';
    } else if (hasAdvantage) {
      previewString = `${icon} ${baseDamage} DMG [${defender.currentHp}➔${newHp} HP] [Hit ${hitPct}% | Crit ${critPct}%]`;
      strokeColor = 0xffd700;
      textColor = '#fef08a';
    } else if (hasDisadvantage) {
      previewString = `${icon} ${baseDamage} DMG [${defender.currentHp}➔${newHp} HP] [Hit ${hitPct}% | Crit ${critPct}%]`;
      strokeColor = 0x64748b;
      textColor = '#cbd5e1';
    } else {
      previewString = `${icon} ${baseDamage} DMG [${defender.currentHp}➔${newHp} HP] [Hit ${hitPct}% | Crit ${critPct}%]`;
      strokeColor = 0x38bdf8;
      textColor = '#ffffff';
    }

    this.bgRect.setStrokeStyle(1.5, strokeColor);
    this.forecastText.setColor(textColor);
    this.forecastText.setText(previewString);

    // Auto-adjust pill width based on text length
    const pillWidth = Math.max(150, this.forecastText.width + 16);
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
