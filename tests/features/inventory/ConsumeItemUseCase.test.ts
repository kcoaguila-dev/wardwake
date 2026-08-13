import { ConsumeItemUseCase } from '../../../src/features/inventory/application/ConsumeItemUseCase';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../src/features/inventory/domain/Item';

describe('ConsumeItemUseCase', () => {
  let useCase: ConsumeItemUseCase;
  let unit: Unit;

  beforeEach(() => {
    useCase = new ConsumeItemUseCase();
    unit = new Unit('u1', 'TestUnit', 100, 10, 5, WeaponType.SWORD);
  });

  it('should restore HP and not exceed maxHp when consuming a HEAL item', () => {
    unit.currentHp = 80;
    const healItem = new Item('i1', 'Potion', ItemType.HEAL, 30);
    unit.addItem(healItem);

    useCase.execute(unit, healItem);

    expect(unit.currentHp).toBe(100);
    expect(unit.inventory).not.toContainEqual(healItem);
  });

  it('should restore correct amount of HP when not exceeding maxHp', () => {
    unit.currentHp = 50;
    const healItem = new Item('i1', 'Small Potion', ItemType.HEAL, 20);
    unit.addItem(healItem);

    useCase.execute(unit, healItem);

    expect(unit.currentHp).toBe(70);
    expect(unit.inventory).not.toContainEqual(healItem);
  });

  it('should temporarily increase attack power when consuming an ATTACK_BUFF item', () => {
    const buffItem = new Item('i2', 'Strength Potion', ItemType.ATTACK_BUFF, 5);
    unit.addItem(buffItem);

    useCase.execute(unit, buffItem);

    expect(unit.attack).toBe(15);
    expect(unit.inventory).not.toContainEqual(buffItem);
  });

  it('should remove the item from inventory upon successful consumption', () => {
    const healItem = new Item('i1', 'Potion', ItemType.HEAL, 20);
    unit.addItem(healItem);
    expect(unit.inventory.length).toBe(1);

    useCase.execute(unit, healItem);

    expect(unit.inventory.length).toBe(0);
  });

  it('should throw an error if the unit does not have the item in inventory', () => {
    const healItem = new Item('i1', 'Potion', ItemType.HEAL, 20);
    // Note: item is not added to the unit's inventory

    expect(() => useCase.execute(unit, healItem)).toThrow(
      'Unit TestUnit does not have item Potion in inventory.'
    );
  });
});
