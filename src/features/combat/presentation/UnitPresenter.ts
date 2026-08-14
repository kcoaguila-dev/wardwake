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

  constructor(private scene: Phaser.Scene, unit: Unit, coord: TileCoordinate, isPlayer: boolean = true) {
    this.isPlayer = isPlayer;

    let textureKey = 'unit_sword';
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

    const x = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
    const y = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

    this.container = this.scene.add.container(x, y);
    this.container.setDepth(2);

    // 1. Under-Foot Faction Base Ring (Depth 1)
    this.factionRing = this.scene.add.graphics();
    this.drawFactionRing();

    // 2. Character Pixel Art Avatar (Depth 2)
    this.sprite = this.scene.add.sprite(0, -2, textureKey);
    this.sprite.setScale(2);

    // 3. Health Bar (Depth 3)
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3);

    this.container.add([this.factionRing, this.sprite, this.healthBar]);

    this.updateHp(unit.currentHp, unit.maxHp);
  }

  private drawFactionRing(): void {
    this.factionRing.clear();
    const ringColor = this.isPlayer ? 0x00d4ff : 0xff3b30;
    const borderColor = this.isPlayer ? 0x38bdf8 : 0xff5252;
    const alpha = this.isExhausted ? 0.25 : 0.65;

    // Draw soft glowing ellipse under the unit's feet
    this.factionRing.fillStyle(ringColor, alpha);
    this.factionRing.fillEllipse(0, 11, 20, 9);

    this.factionRing.lineStyle(1.5, borderColor, this.isExhausted ? 0.4 : 0.95);
    this.factionRing.strokeEllipse(0, 11, 20, 9);
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

  public moveTo(coord: TileCoordinate): Promise<void> {
    return new Promise((resolve) => {
      const targetX = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const targetY = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      this.container.setVisible(true);
      this.scene.tweens.killTweensOf(this.container);

      this.scene.tweens.add({
        targets: this.container,
        x: targetX,
        y: targetY,
        duration: 150,
        ease: 'Sine.easeInOut',
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
    if (hpRatio <= 0.25) {
      color = 0xff3b30; // Red
    } else if (hpRatio <= 0.5) {
      color = 0xffcc00; // Yellow
    }

    const barWidth = 24;
    const barHeight = 3;
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
      const lungeDistance = 8;

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
}
