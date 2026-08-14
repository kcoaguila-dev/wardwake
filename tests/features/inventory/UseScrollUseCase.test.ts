import { UseScrollUseCase } from '../../../src/features/inventory/application/UseScrollUseCase';
import { Unit, StatusEffect } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../src/features/inventory/domain/Item';
import { Room } from '../../../src/features/grid/domain/BspNode';

describe('UseScrollUseCase', () => {
  let useCase: UseScrollUseCase;
  let user: Unit;

  beforeEach(() => {
    useCase = new UseScrollUseCase();
    user = new Unit('u1', 'User', 100, 10, 5, WeaponType.SWORD);
  });

  describe('executePetrifyScroll', () => {
    it('should apply PETRIFIED status to all enemies and remove the scroll', () => {
      const scroll = new Item('scroll1', 'Scroll of Petrify', ItemType.SCROLL, 0);
      user.addItem(scroll);

      const enemy1 = new Unit('e1', 'Enemy1', 100, 10, 5, WeaponType.SWORD);
      const enemy2 = new Unit('e2', 'Enemy2', 100, 10, 5, WeaponType.SWORD);

      useCase.executePetrifyScroll(user, [enemy1, enemy2], scroll);

      expect(enemy1.statusEffect).toBe(StatusEffect.PETRIFIED);
      expect(enemy1.statusTurns).toBe(4);
      expect(enemy2.statusEffect).toBe(StatusEffect.PETRIFIED);
      expect(enemy2.statusTurns).toBe(4);
      expect(user.inventory.length).toBe(0);
    });

    it('should throw an error if the item is not a scroll', () => {
      const sword = new Item('sword', 'Sword', ItemType.RELIC_WEAPON, 5);
      user.addItem(sword);

      expect(() => useCase.executePetrifyScroll(user, [], sword)).toThrow(
        'Item Sword is not a scroll.'
      );
    });
  });

  describe('executeWarpOrb', () => {
    it('should return a coordinate within the safe room and remove the scroll', () => {
      const orb = new Item('orb1', 'Warp Orb', ItemType.SCROLL, 0);
      user.addItem(orb);

      const safeRooms = [new Room(10, 10, 6, 6)];

      const destination = useCase.executeWarpOrb(user, safeRooms, orb);

      // The safe room center calculation: x + width / 2 => 10 + 3 = 13, y + height / 2 => 10 + 3 = 13
      expect(destination.x).toBe(13);
      expect(destination.y).toBe(13);
      expect(user.inventory.length).toBe(0);
    });

    it('should randomly pick a room if multiple safe rooms exist', () => {
      const orb = new Item('orb1', 'Warp Orb', ItemType.SCROLL, 0);
      user.addItem(orb);

      const safeRooms = [new Room(0, 0, 4, 4), new Room(20, 20, 4, 4)];

      const destination = useCase.executeWarpOrb(user, safeRooms, orb);

      expect(user.inventory.length).toBe(0);
      const validXs = [2, 22]; // Centers of the rooms
      const validYs = [2, 22];

      expect(validXs).toContain(destination.x);
      expect(validYs).toContain(destination.y);
    });

    it('should throw an error if no safe rooms are available', () => {
      const orb = new Item('orb1', 'Warp Orb', ItemType.SCROLL, 0);
      user.addItem(orb);

      expect(() => useCase.executeWarpOrb(user, [], orb)).toThrow(
        'No safe rooms available to warp to.'
      );
    });
  });
});
