import { Unit } from '../../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../../src/features/inventory/domain/Item';

describe('Unit domain entity', () => {
  let unit: Unit;

  beforeEach(() => {
    unit = new Unit('u1', 'TestUnit', 100, 10, 5, WeaponType.SWORD);
  });

  describe('Inventory Management', () => {
    it('should add an item to the inventory', () => {
      const item = new Item('i1', 'Potion', ItemType.HEAL, 20);
      unit.addItem(item);
      expect(unit.inventory).toContainEqual(item);
      expect(unit.inventory.length).toBe(1);
    });

    it('should remove an item from the inventory by ID', () => {
      const item = new Item('i1', 'Potion', ItemType.HEAL, 20);
      const item2 = new Item('i2', 'Elixir', ItemType.HEAL, 50);
      unit.addItem(item);
      unit.addItem(item2);

      unit.removeItem('i1');
      expect(unit.inventory).not.toContainEqual(item);
      expect(unit.inventory).toContainEqual(item2);
      expect(unit.inventory.length).toBe(1);
    });
  });

  describe('Stat adjustments', () => {
    it('heal() should restore HP but not exceed maxHp', () => {
      unit.currentHp = 50;
      unit.heal(30);
      expect(unit.currentHp).toBe(80);

      unit.heal(50);
      expect(unit.currentHp).toBe(100);
    });

    it('heal() should ignore negative amounts', () => {
      unit.currentHp = 50;
      unit.heal(-10);
      expect(unit.currentHp).toBe(50);
    });

    it('buffAttack() should increase attack power', () => {
      unit.buffAttack(5);
      expect(unit.attack).toBe(15);
    });

    it('buffAttack() should ignore negative amounts', () => {
      unit.buffAttack(-5);
      expect(unit.attack).toBe(10);
    });
  });
});
