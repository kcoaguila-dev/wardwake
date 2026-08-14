import * as Phaser from 'phaser';
import { Unit } from '../domain/Unit';
import { WeaponType } from '../domain/WeaponType';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class UnitPresenter {
  private container: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene, unit: Unit, coord: TileCoordinate) {
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

    this.sprite = this.scene.add.sprite(0, 0, textureKey);
    this.sprite.setScale(2);

    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3);

    this.container.add([this.sprite, this.healthBar]);

    this.updateHp(unit.currentHp, unit.maxHp);
  }

  moveTo(coord: TileCoordinate): Promise<void> {
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

  clear(): void {
    this.container.setVisible(false);
  }

  setTint(color: number): void {
    this.sprite.setTint(color);
  }

  updateHp(currentHp: number, maxHp: number): void {
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

  animateAttack(targetCoord: TileCoordinate): Promise<void> {
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

  animateHit(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: 2,
        duration: 20,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.sprite.setPosition(0, 0);
          resolve();
        }
      });

      // Also flash red
      const originalTint = this.sprite.tintTopLeft;
      this.sprite.setTint(0xffffff);
      this.scene.time.delayedCall(50, () => {
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(50, () => {
          if (originalTint === 0xffffff) {
            this.sprite.clearTint();
          } else {
            this.sprite.setTint(originalTint);
          }
        });
      });
    });
  }
}
