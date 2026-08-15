import * as Phaser from 'phaser';
import { Unit } from '../domain/Unit';
import { WeaponType } from '../domain/WeaponType';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class UnitPresenter {
  private container: Phaser.GameObjects.Container;
  private factionRing: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: Phaser.GameObjects.Graphics;
  private isExhausted: boolean = false;
  private isPlayer: boolean;
  private isLeader: boolean = false;
  private isSelected: boolean = false;
  private isElite: boolean = false;

  constructor(private scene: Phaser.Scene, unit: Unit, coord: TileCoordinate, isPlayer: boolean = true, isLeader: boolean = false) {
    this.isPlayer = isPlayer;
    this.isLeader = isLeader;
    this.isElite = !isPlayer && (unit.name.includes('💀') || unit.name.includes('FOE') || unit.name.includes('Dread'));

    let textureKey = 'unit_sword';
    if (this.isPlayer) {
      switch (unit.weaponType) {
        case WeaponType.SWORD:
          textureKey = 'unit_sword';
          break;
        case WeaponType.LANCE:
          textureKey = 'unit_lance';
          break;
        case WeaponType.AXE:
          textureKey = 'unit_axe';
          break;
      }
    } else {
      if (this.isElite) {
        textureKey = 'enemy_dread_minotaur';
      } else {
        switch (unit.weaponType) {
          case WeaponType.SWORD:
            textureKey = 'enemy_goblin_sword';
            break;
          case WeaponType.AXE:
            textureKey = 'enemy_orc_axe';
            break;
          case WeaponType.LANCE:
            textureKey = 'enemy_skeleton_lance';
            break;
          case WeaponType.BOW:
            textureKey = 'enemy_goblin_archer';
            break;
          case WeaponType.MAGIC:
            textureKey = 'enemy_dark_cultist';
            break;
        }
      }
    }

    const x = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
    const y = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

    this.container = this.scene.add.container(x, y);
    this.container.setDepth(2);

    // 1. Under-Foot Faction Base Ring (Depth 1)
    this.factionRing = this.scene.add.graphics();
    this.drawFactionRing();

    // 2. Character Pixel Art Avatar (Depth 2)
    this.sprite = this.scene.add.sprite(0, -2, textureKey);
    this.sprite.setScale(this.isElite ? 2.4 : 2);

    // 3. Health Bar (Depth 3)
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3);

    this.container.add([this.factionRing, this.sprite, this.healthBar]);

    this.updateHp(unit.currentHp, unit.maxHp);
  }

  public setLeader(isLeader: boolean): void {
    this.isLeader = isLeader;
    this.drawFactionRing();
  }

  private drawFactionRing(): void {
    this.factionRing.clear();

    let ringColor = 0xff3b30; // Enemy Crimson
    let borderColor = 0xff5252;

    if (this.isPlayer) {
      if (this.isLeader) {
        ringColor = 0xffd700; // Radiant Gold Leader
        borderColor = 0xfff080;
      } else {
        ringColor = 0x00d4ff; // Celestial Cyan Ally
        borderColor = 0x38bdf8;
      }
    } else if (this.isElite) {
      ringColor = 0x9333ea; // Ominous Deep Purple
      borderColor = 0xc084fc;
    }

    const alpha = this.isExhausted ? 0.25 : (this.isElite ? 0.85 : 0.65);

    // Draw soft glowing ellipse under the unit's feet
    this.factionRing.fillStyle(ringColor, alpha);
    this.factionRing.fillEllipse(0, 11, this.isElite ? 24 : 20, this.isElite ? 11 : 9);

    const activeBorderColor = this.isSelected ? 0xffffff : borderColor;
    const borderThickness = this.isSelected ? 2.5 : (this.isElite ? 2.0 : 1.5);

    this.factionRing.lineStyle(borderThickness, activeBorderColor, this.isExhausted ? 0.4 : 0.95);
    this.factionRing.strokeEllipse(0, 11, this.isElite ? 24 : 20, this.isElite ? 11 : 9);
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.drawFactionRing();
  }

  public setExhausted(exhausted: boolean): void {
    this.isExhausted = exhausted;
    this.drawFactionRing();

    if (exhausted) {
      // Darken / grayscale when turn is finished
      this.sprite.setTint(0x777777);
    } else {
      // Restore vibrant natural pixel art colors
      this.sprite.clearTint();
    }
  }

  public moveTo(coord: TileCoordinate, fast: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      const targetX = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const targetY = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      this.container.setVisible(true);
      this.scene.tweens.killTweensOf(this.container);

      const duration = fast ? 35 : 120;
      const ease = fast ? 'Linear' : 'Sine.easeInOut';

      this.scene.tweens.add({
        targets: this.container,
        x: targetX,
        y: targetY,
        duration,
        ease,
        onComplete: () => {
          this.container.setPosition(targetX, targetY);
          resolve();
        }
      });
    });
  }

  public clear(): void {
    this.container.setVisible(false);
  }

  public setTint(color: number): void {
    this.sprite.setTint(color);
  }

  public clearTint(): void {
    if (this.isExhausted) {
      this.sprite.setTint(0x777777);
    } else {
      this.sprite.clearTint();
    }
  }

  public updateHp(currentHp: number, maxHp: number): void {
    this.healthBar.clear();
    if (currentHp <= 0) {
      this.healthBar.setVisible(false);
      return;
    }

    this.healthBar.setVisible(true);
    const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));

    let color = 0x00ff00; // Green
    if (this.isElite) {
      color = 0xec4899; // Magenta for Dread Boss
    } else if (hpRatio <= 0.25) {
      color = 0xff3b30; // Red
    } else if (hpRatio <= 0.5) {
      color = 0xffcc00; // Yellow
    }

    const barWidth = this.isElite ? 28 : 24;
    const barHeight = this.isElite ? 4 : 3;
    const offsetX = -barWidth / 2;
    const offsetY = -20;

    // Draw background border & fill
    this.healthBar.fillStyle(0x000000, 0.85);
    this.healthBar.fillRect(offsetX - 1, offsetY - 1, barWidth + 2, barHeight + 2);

    // Draw fill
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(offsetX, offsetY, barWidth * hpRatio, barHeight);
  }

  public animateAttack(targetCoord: TileCoordinate): Promise<void> {
    return new Promise((resolve) => {
      const originX = this.container.x;
      const originY = this.container.y;

      const targetWorldX = targetCoord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const targetWorldY = targetCoord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      const angle = Phaser.Math.Angle.Between(originX, originY, targetWorldX, targetWorldY);
      const lungeDistance = this.isElite ? 12 : 8;

      const lungeX = originX + Math.cos(angle) * lungeDistance;
      const lungeY = originY + Math.sin(angle) * lungeDistance;

      this.scene.tweens.add({
        targets: this.container,
        x: lungeX,
        y: lungeY,
        duration: 80,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.container.setPosition(originX, originY);
          resolve();
        }
      });
    });
  }

  public animateProjectile(targetCoord: TileCoordinate, textureKey: string): Promise<void> {
    return new Promise((resolve) => {
      const originX = this.container.x;
      const originY = this.container.y;

      const targetWorldX = targetCoord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const targetWorldY = targetCoord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      // Calculate angle for rotation
      const angle = Phaser.Math.Angle.Between(originX, originY, targetWorldX, targetWorldY);

      // Create a temporary projectile sprite at the unit's origin
      const projectileSprite = this.scene.add.sprite(originX, originY, textureKey);
      projectileSprite.setDepth(4);
      projectileSprite.setRotation(angle);

      // Animate to target
      this.scene.tweens.add({
        targets: projectileSprite,
        x: targetWorldX,
        y: targetWorldY,
        duration: 150, // Keep snappy as per memory constraints
        ease: 'Linear',
        onComplete: () => {
          projectileSprite.destroy();
          resolve();
        }
      });
    });
  }

  public animateHit(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: 2,
        duration: 20,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.sprite.setPosition(0, -2);
          resolve();
        }
      });

      // Flash white then red on damage
      this.sprite.setTint(0xffffff);
      this.scene.time.delayedCall(60, () => {
        this.sprite.setTint(0xff3b30);
        this.scene.time.delayedCall(80, () => {
          this.clearTint();
        });
      });
    });
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
}
