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
}
