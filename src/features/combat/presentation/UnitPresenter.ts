import * as Phaser from 'phaser';
import { Unit } from '../domain/Unit';
import { WeaponType } from '../domain/WeaponType';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class UnitPresenter {
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

    this.sprite = this.scene.add.sprite(x, y, textureKey);
    this.sprite.setScale(2);
    this.sprite.setDepth(2);

    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3);
    this.healthBar.setPosition(x, y);
  }

  moveTo(coord: TileCoordinate): void {
    const targetX = coord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
    const targetY = coord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

    this.sprite.setVisible(true);

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Sine.easeInOut'
    });

    this.scene.tweens.add({
      targets: this.healthBar,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Sine.easeInOut'
    });
  }

  clear(): void {
    this.sprite.setVisible(false);
    this.healthBar.setVisible(false);
  }

  setTint(color: number): void {
    this.sprite.setTint(color);
  }

  updateHp(currentHp: number, maxHp: number): void {
    this.healthBar.clear();
    this.healthBar.setVisible(true);

    if (currentHp <= 0) {
      return;
    }

    const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));

    let color = 0x00ff00; // Green
    if (hpRatio <= 0.25) {
      color = 0xff0000; // Red
    } else if (hpRatio <= 0.5) {
      color = 0xffff00; // Yellow
    }

    const barWidth = 24;
    const barHeight = 3;
    const offsetX = -barWidth / 2;
    const offsetY = -20;

    // Draw background (black)
    this.healthBar.fillStyle(0x000000, 1);
    this.healthBar.fillRect(offsetX, offsetY, barWidth, barHeight);

    // Draw fill
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(offsetX, offsetY, barWidth * hpRatio, barHeight);
  }

  animateAttack(targetCoord: TileCoordinate): Promise<void> {
    return new Promise((resolve) => {
      const startX = this.sprite.x;
      const startY = this.sprite.y;

      const targetX = targetCoord.x * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;
      const targetY = targetCoord.y * GridPresenter.TILE_SIZE + GridPresenter.TILE_SIZE / 2;

      const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
      const lungeDistance = 8;

      const lungeX = startX + Math.cos(angle) * lungeDistance;
      const lungeY = startY + Math.sin(angle) * lungeDistance;

      this.scene.tweens.add({
        targets: this.sprite,
        x: lungeX,
        y: lungeY,
        duration: 80,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.sprite.setPosition(startX, startY);
          resolve();
        }
      });
    });
  }

  animateHit(): Promise<void> {
    return new Promise((resolve) => {
      const originalX = this.sprite.x;

      this.scene.tweens.add({
        targets: this.sprite,
        x: originalX + 2,
        duration: 20,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.sprite.setX(originalX);
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
