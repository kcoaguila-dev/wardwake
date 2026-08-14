import { Unit } from '../../combat/domain/Unit';
import { Item, ItemType } from '../domain/Item';
import { CombatResolver } from '../../combat/domain/CombatResolver';

export class ThrowProjectileUseCase {
  execute(attacker: Unit, target: Unit, projectile: Item): number {
    const hasItem = attacker.inventory.some(i => i.id === projectile.id);
    if (!hasItem) {
      throw new Error(`Unit ${attacker.name} does not have projectile ${projectile.name} in inventory.`);
    }

    if (projectile.type !== ItemType.PROJECTILE) {
      throw new Error(`Item ${projectile.name} is not a projectile.`);
    }

    if (projectile.ammo === undefined || projectile.ammo <= 0) {
      throw new Error(`Projectile ${projectile.name} has no ammo left.`);
    }

    projectile.ammo--;

    // Simple physical damage resolution using the item's value as base attack
    const damage = Math.max(0, projectile.value - target.defense);
    target.applyDamage(damage);

    return damage;
  }
}
