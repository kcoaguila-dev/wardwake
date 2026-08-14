import { ThrowProjectileUseCase } from '../../../src/features/inventory/application/ThrowProjectileUseCase';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../src/features/inventory/domain/Item';

describe('ThrowProjectileUseCase', () => {
  let useCase: ThrowProjectileUseCase;
  let attacker: Unit;
  let target: Unit;

  beforeEach(() => {
    useCase = new ThrowProjectileUseCase();
    attacker = new Unit('u1', 'Attacker', 100, 10, 5, WeaponType.SWORD);
    target = new Unit('u2', 'Target', 100, 10, 5, WeaponType.SWORD);
  });

  it('should deal damage and decrement ammo', () => {
    const javelin = new Item('jav1', 'Throwing Javelin', ItemType.PROJECTILE, 12, 0, false, 0, undefined, undefined, 3, 3);
    attacker.addItem(javelin);

    const damage = useCase.execute(attacker, target, javelin);

    expect(damage).toBe(7); // 12 attack - 5 defense
    expect(target.currentHp).toBe(93);
    expect(javelin.ammo).toBe(2);
  });

  it('should throw an error if the item is not a projectile', () => {
    const healItem = new Item('heal1', 'Potion', ItemType.HEAL, 20);
    attacker.addItem(healItem);

    expect(() => useCase.execute(attacker, target, healItem)).toThrow(
      'Item Potion is not a projectile.'
    );
  });
});
