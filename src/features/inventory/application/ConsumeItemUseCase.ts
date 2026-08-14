import { Unit } from '../../combat/domain/Unit';
import { Item, ItemType } from '../domain/Item';

export class ConsumeItemUseCase {
  execute(unit: Unit, item: Item): void {
    const hasItem = unit.inventory.some(i => i.id === item.id);
    if (!hasItem) {
      throw new Error(`Unit ${unit.name} does not have item ${item.name} in inventory.`);
    }

    if (item.type === ItemType.HEAL) {
      unit.heal(item.value);
    } else if (item.type === ItemType.ATTACK_BUFF) {
      unit.buffAttack(item.value);
    } else if (item.type === ItemType.FOOD) {
      unit.feed(item.value);
    }

    unit.removeItem(item.id);
  }
}
