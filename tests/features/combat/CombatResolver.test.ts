import { CombatResolver } from '../../../src/features/combat/domain/CombatResolver';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('CombatResolver', () => {
  it('Sword attacking Axe yields advantage bonus (+3 damage)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.SWORD);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.AXE);

    // Damage Formula: max(1, (Attack + Bonus) - Defense)
    // = (10 + 3) - 5 = 8
    const result = CombatResolver.calculateDamage(attacker, defender);

    expect(result.damageDealt).toBe(8);
    expect(result.hasAdvantage).toBe(true);
    expect(result.hasDisadvantage).toBe(false);
  });

  it('Axe attacking Sword yields disadvantage penalty (-3 damage)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.SWORD);

    // Damage Formula: max(1, (Attack + Penalty) - Defense)
    // = (10 - 3) - 5 = 2
    const result = CombatResolver.calculateDamage(attacker, defender);

    expect(result.damageDealt).toBe(2);
    expect(result.hasAdvantage).toBe(false);
    expect(result.hasDisadvantage).toBe(true);
  });

  it('Non-triangle weapons (Bow vs Magic) calculate neutral damage', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.BOW);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.MAGIC);

    // Damage Formula: max(1, (Attack + 0) - Defense)
    // = 10 - 5 = 5
    const result = CombatResolver.calculateDamage(attacker, defender);

    expect(result.damageDealt).toBe(5);
    expect(result.hasAdvantage).toBe(false);
    expect(result.hasDisadvantage).toBe(false);
  });

  it('Minimum damage floor is always at least 1', () => {
    const attacker = new Unit('1', 'Weak Attacker', 10, 1, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Strong Defender', 10, 10, 100, WeaponType.SWORD); // Also disadvantage

    // Damage Formula: max(1, (1 - 3) - 100)
    // = max(1, -102) = 1
    const result = CombatResolver.calculateDamage(attacker, defender);

    expect(result.damageDealt).toBe(1);
    expect(result.hasDisadvantage).toBe(true);
  });
});
