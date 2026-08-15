import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import { WeaponType } from '../../combat/domain/WeaponType';
import { CombatResolver } from '../../combat/domain/CombatResolver';

export class EnemyInspectionPresenter {
  private container: Phaser.GameObjects.Container;
  private bgRect: Phaser.GameObjects.Rectangle;
  private headerText: Phaser.GameObjects.Text;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private counterText: Phaser.GameObjects.Text;
  private traitText: Phaser.GameObjects.Text;
  private closeHint: Phaser.GameObjects.Text;

  private visible: boolean = false;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(260);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const cardW = 200;
    const cardH = 100;

    // Dark slate background with crimson tactical stroke
    this.bgRect = this.scene.add.rectangle(0, 0, cardW, cardH, 0x0f172a, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0xef4444);

    this.headerText = this.scene.add.text(8, 7, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setOrigin(0, 0);

    // HP Bar
    this.hpBarBg = this.scene.add.rectangle(8, 24, 184, 8, 0x334155).setOrigin(0, 0);
    this.hpBarFill = this.scene.add.rectangle(8, 24, 184, 8, 0xef4444).setOrigin(0, 0);
    this.hpText = this.scene.add.text(100, 28, '', {
      fontSize: '8px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Stats
    this.statsText = this.scene.add.text(8, 36, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#cbd5e1'
    }).setOrigin(0, 0);

    // Counter & Triangle Advantage
    this.counterText = this.scene.add.text(8, 52, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0, 0);

    // Traits / Lore / Fuse
    this.traitText = this.scene.add.text(8, 68, '', {
      fontSize: '8.5px',
      fontFamily: 'monospace',
      color: '#fbbf24'
    }).setOrigin(0, 0);

    this.closeHint = this.scene.add.text(192, 86, '❌ (Click hero to cancel)', {
      fontSize: '7.5px',
      fontFamily: 'monospace',
      color: '#64748b'
    }).setOrigin(1, 0);

    this.container.add([
      this.bgRect,
      this.headerText,
      this.hpBarBg,
      this.hpBarFill,
      this.hpText,
      this.statsText,
      this.counterText,
      this.traitText,
      this.closeHint
    ]);
  }

  public show(enemy: Unit, playerHero?: Unit): void {
    this.visible = true;

    // Header
    const isElite = enemy.name.includes('💀') || enemy.name.includes('FOE') || (enemy as any).isElite;
    const isBoss = enemy.name.includes('BOSS') || (enemy as any).isBoss;
    this.headerText.setColor(isBoss ? '#f87171' : (isElite ? '#fbbf24' : '#fca5a5'));
    this.headerText.setText(enemy.name);

    // HP Bar
    const hpRatio = Math.max(0, Math.min(1, enemy.currentHp / enemy.maxHp));
    this.hpBarFill.width = 184 * hpRatio;
    this.hpText.setText(`HP ${enemy.currentHp}/${enemy.maxHp}`);

    // Stats
    const move = enemy.moveRange ?? 2;
    const rng = enemy.attackRange ?? 1;
    this.statsText.setText(`ATK: ${enemy.attack}  DEF: ${enemy.defense} | MOVE: ${move}  RNG: ${rng}`);

    // Counter & Triangle Advantage
    let counterInfo = '';
    let counterColor = '#cbd5e1';
    if (playerHero) {
      const hasAdvantage = CombatResolver.hasAdvantage(playerHero.weaponType, enemy.weaponType);
      const hasDisadvantage = CombatResolver.hasDisadvantage(playerHero.weaponType, enemy.weaponType);
      if (hasAdvantage) {
        counterInfo = '✨ Party Advantage (+3 DMG)';
        counterColor = '#4ade80';
      } else if (hasDisadvantage) {
        counterInfo = '⚠️ Party Disadvantage (-3 DMG)';
        counterColor = '#f87171';
      } else {
        if (enemy.weaponType === WeaponType.SWORD) counterInfo = 'Weak to LANCE 🔱';
        else if (enemy.weaponType === WeaponType.AXE) counterInfo = 'Weak to SWORD ⚔️';
        else if (enemy.weaponType === WeaponType.LANCE) counterInfo = 'Weak to AXE 🪓';
        else if (enemy.weaponType === WeaponType.BOW) counterInfo = 'Weak to Melee rush ⚔️';
        else if (enemy.weaponType === WeaponType.MAGIC) counterInfo = 'Weak to physical burst 🪓';
        counterColor = '#38bdf8';
      }
    } else {
      if (enemy.weaponType === WeaponType.SWORD) counterInfo = 'Weak to LANCE 🔱';
      else if (enemy.weaponType === WeaponType.AXE) counterInfo = 'Weak to SWORD ⚔️';
      else if (enemy.weaponType === WeaponType.LANCE) counterInfo = 'Weak to AXE 🪓';
      counterColor = '#38bdf8';
    }
    this.counterText.setColor(counterColor);
    this.counterText.setText(counterInfo);

    // Trait
    if (enemy.isExplosive || enemy.fuseActive) {
      this.traitText.setColor('#ef4444');
      this.traitText.setText('💣 VOLATILE: 3x3 Explosion on Detonation!');
    } else if (isElite) {
      this.traitText.setColor('#fbbf24');
      this.traitText.setText('💀 DREAD FOE: High ATK & Relentless Tracking');
    } else if (enemy.weaponType === WeaponType.BOW || enemy.weaponType === WeaponType.MAGIC) {
      this.traitText.setColor('#c084fc');
      this.traitText.setText('🏹 RANGED: Attacks over distance');
    } else {
      this.traitText.setColor('#94a3b8');
      this.traitText.setText('⚔️ Threat Level: Active Combatant');
    }

    // Anchor to top-right below the HUD
    this.container.setPosition(430, 36);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
