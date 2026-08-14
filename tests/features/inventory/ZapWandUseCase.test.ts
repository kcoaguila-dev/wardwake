import { ZapWandUseCase } from '../../../src/features/inventory/application/ZapWandUseCase';
import { Unit, StatusEffect } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../src/features/inventory/domain/Item';

describe('ZapWandUseCase', () => {
  let useCase: ZapWandUseCase;
  let attacker: Unit;
  let target: Unit;

  beforeEach(() => {
    useCase = new ZapWandUseCase();
    attacker = new Unit('u1', 'Attacker', 100, 10, 5, WeaponType.SWORD);
    target = new Unit('u2', 'Target', 100, 10, 5, WeaponType.SWORD);
  });

  it('should decrement wand charges and apply SLEEP status to the target', () => {
    const wand = new Item('wand1', 'Wand of Slumber', ItemType.WAND, 0, 0, false, 0, 4, 4);
    attacker.addItem(wand);

    useCase.execute(attacker, target, wand);

    expect(wand.charges).toBe(3);
    expect(target.statusEffect).toBe(StatusEffect.SLEEP);
    expect(target.statusTurns).toBe(3);
  });

  it('should throw an error if the attacker does not have the wand in inventory', () => {
    const wand = new Item('wand1', 'Wand of Slumber', ItemType.WAND, 0, 0, false, 0, 4, 4);

    expect(() => useCase.execute(attacker, target, wand)).toThrow(
      'Unit Attacker does not have wand Wand of Slumber in inventory.'
    );
  });

  it('should throw an error if the item is not a wand', () => {
    const healItem = new Item('heal1', 'Potion', ItemType.HEAL, 20);
    attacker.addItem(healItem);

    expect(() => useCase.execute(attacker, target, healItem)).toThrow(
      'Item Potion is not a wand.'
    );
  });

  it('should throw an error if the wand has no charges', () => {
    const wand = new Item('wand1', 'Wand of Slumber', ItemType.WAND, 0, 0, false, 0, 0, 4);
    attacker.addItem(wand);

    expect(() => useCase.execute(attacker, target, wand)).toThrow(
      'Wand Wand of Slumber has no charges left.'
    );
  });
});
