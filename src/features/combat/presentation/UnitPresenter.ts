import * as Phaser from 'phaser';
import { Unit } from '../domain/Unit';
import { WeaponType } from '../domain/WeaponType';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class UnitPresenter {
  private sprite: Phaser.GameObjects.Sprite;

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
  }

  clear(): void {
    this.sprite.setVisible(false);
  }

  setTint(color: number): void {
    this.sprite.setTint(color);
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
