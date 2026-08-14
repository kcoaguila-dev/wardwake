import { Unit, StatusEffect } from '../../combat/domain/Unit';
import { Item, ItemType } from '../domain/Item';

export class ZapWandUseCase {
  execute(attacker: Unit, target: Unit, wand: Item): void {
    const hasItem = attacker.inventory.some(i => i.id === wand.id);
    if (!hasItem) {
      throw new Error(`Unit ${attacker.name} does not have wand ${wand.name} in inventory.`);
    }

    if (wand.type !== ItemType.WAND) {
      throw new Error(`Item ${wand.name} is not a wand.`);
    }

    if (wand.charges === undefined || wand.charges <= 0) {
      throw new Error(`Wand ${wand.name} has no charges left.`);
    }

    wand.charges--;
    target.applyStatus(StatusEffect.SLEEP, 3);
  }
}
