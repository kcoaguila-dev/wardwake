import { Item, ItemType } from './Item';
import itemsData from '../../../data/items.json';

export interface ItemBlueprint {
  id: string;
  name: string;
  type: string;
  value: number;
  description: string;
  rarity: string;
  dropWeight: number;
}

const rawItemBlueprints: ItemBlueprint[] = (Array.isArray(itemsData)
  ? itemsData
  : (itemsData as any).default || []) as ItemBlueprint[];

export class ItemRepository {
  private static readonly blueprints: ItemBlueprint[] = rawItemBlueprints;

  public static getAll(): ItemBlueprint[] {
    return this.blueprints;
  }

  public static getById(id: string): ItemBlueprint | undefined {
    return this.blueprints.find(item => item.id === id);
  }

  public static createItemFromBlueprint(blueprint: ItemBlueprint, uniqueId?: string): Item {
    const id = uniqueId || `item_${blueprint.id}_${Math.random().toString(36).substring(2, 7)}`;
    const type = blueprint.type.toUpperCase() === 'ATTACK_BUFF' ? ItemType.ATTACK_BUFF : ItemType.HEAL;
    return new Item(id, blueprint.name, type, blueprint.value);
  }

  public static getRandomLootItem(): Item {
    const totalWeight = this.blueprints.reduce((sum, item) => sum + (item.dropWeight || 10), 0);
    let rand = Math.random() * totalWeight;

    for (const blueprint of this.blueprints) {
      rand -= blueprint.dropWeight || 10;
      if (rand <= 0) {
        return this.createItemFromBlueprint(blueprint);
      }
    }

    return this.createItemFromBlueprint(this.blueprints[0]!);
  }
}
