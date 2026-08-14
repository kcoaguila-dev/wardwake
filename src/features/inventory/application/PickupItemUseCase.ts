import { Unit } from '../../combat/domain/Unit';
import { Item } from '../domain/Item';

export class PickupItemUseCase {
  execute(unit: Unit, item: Item): string {
    unit.addItem(item);
    return `+ Obtained ${item.name}!`;
  }
}
