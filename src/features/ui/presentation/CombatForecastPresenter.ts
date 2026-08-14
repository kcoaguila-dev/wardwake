import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { CombatResolver } from '../../combat/domain/CombatResolver';

export class CombatForecastPresenter {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private attackerText: Phaser.GameObjects.Text;
  private defenderText: Phaser.GameObjects.Text;
  private advantageText: Phaser.GameObjects.Text;
  private damageText: Phaser.GameObjects.Text;
  private hpText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);

    // Box dimensions
    const width = 250;
    const height = 120;

    // Create UI elements
    this.background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff);

    this.attackerText = this.scene.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.defenderText = this.scene.add.text(10, 30, '', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.advantageText = this.scene.add.text(10, 50, '', {
      fontSize: '12px',
      color: '#ffff00',
      fontStyle: 'bold',
    });

    this.damageText = this.scene.add.text(10, 75, '', {
      fontSize: '14px',
      color: '#ff5555',
      fontStyle: 'bold',
    });

    this.hpText = this.scene.add.text(10, 95, '', {
      fontSize: '14px',
      color: '#55ff55',
    });

    this.container.add([
      this.background,
      this.attackerText,
      this.defenderText,
      this.advantageText,
      this.damageText,
      this.hpText,
    ]);
  }

  public show(attacker: Unit, defender: Unit): void {
    const result = CombatResolver.calculateDamage(attacker, defender);

    this.attackerText.setText(`Atk: ${attacker.name} (${attacker.weaponType})`);
    this.defenderText.setText(`Def: ${defender.name} (${defender.weaponType})`);

    let advantageString = '';
    if (result.hasAdvantage) {
      const icon = this.getWeaponIcon(attacker.weaponType);
      advantageString = `${icon} ADVANTAGE +${CombatResolver.ADVANTAGE_BONUS_DAMAGE} DMG`;
      this.advantageText.setColor('#ffff00');
    } else if (result.hasDisadvantage) {
      advantageString = `DISADVANTAGE ${CombatResolver.DISADVANTAGE_PENALTY_DAMAGE} DMG`;
      this.advantageText.setColor('#aaaaaa');
    }
    this.advantageText.setText(advantageString);

    this.damageText.setText(`DMG: ${result.damageDealt}`);

    const newHp = Math.max(0, defender.currentHp - result.damageDealt);
    this.hpText.setText(`HP: ${defender.currentHp} ➔ ${newHp}`);

    // Position at the bottom center or near the top
    const cam = this.scene.cameras.main;
    this.container.setPosition(cam.width / 2 - 125, cam.height - 130);

    this.container.setVisible(true);
  }

  private getWeaponIcon(weaponType: string): string {
    switch(weaponType) {
      case 'SWORD': return '⚔️';
      case 'AXE': return '🪓';
      case 'LANCE': return '🛡️';
      default: return '';
    }
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
