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
}
