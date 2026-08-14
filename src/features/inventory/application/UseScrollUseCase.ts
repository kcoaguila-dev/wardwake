import { Unit, StatusEffect } from '../../combat/domain/Unit';
import { Item, ItemType } from '../domain/Item';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { Room } from '../../grid/domain/BspNode';

export class UseScrollUseCase {
  executePetrifyScroll(user: Unit, enemies: Unit[], scroll: Item): void {
    const hasItem = user.inventory.some(i => i.id === scroll.id);
    if (!hasItem) {
      throw new Error(`Unit ${user.name} does not have scroll ${scroll.name} in inventory.`);
    }

    if (scroll.type !== ItemType.SCROLL) {
      throw new Error(`Item ${scroll.name} is not a scroll.`);
    }

    // Apply PETRIFIED to all given enemies
    for (const enemy of enemies) {
      enemy.applyStatus(StatusEffect.PETRIFIED, 4);
    }

    user.removeItem(scroll.id);
  }

  executeWarpOrb(user: Unit, safeRooms: Room[], scroll: Item): TileCoordinate {
    const hasItem = user.inventory.some(i => i.id === scroll.id);
    if (!hasItem) {
      throw new Error(`Unit ${user.name} does not have scroll ${scroll.name} in inventory.`);
    }

    if (scroll.type !== ItemType.SCROLL) {
      throw new Error(`Item ${scroll.name} is not a scroll.`);
    }

    if (safeRooms.length === 0) {
      throw new Error("No safe rooms available to warp to.");
    }

    // Pick a random safe room
    const randomRoom = safeRooms[Math.floor(Math.random() * safeRooms.length)]!;

    // Pick a center point of the random safe room as the destination
    const destination = new TileCoordinate(
      Math.floor(randomRoom.x + randomRoom.width / 2),
      Math.floor(randomRoom.y + randomRoom.height / 2)
    );

    user.removeItem(scroll.id);
    return destination;
  }
}
