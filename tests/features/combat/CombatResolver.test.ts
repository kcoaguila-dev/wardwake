import { CombatResolver } from '../../../src/features/combat/domain/CombatResolver';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('CombatResolver', () => {
  it('Sword attacking Axe yields advantage bonus (+3 damage) and 100% accuracy', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.SWORD);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.AXE);

    // Damage Formula: max(1, (Attack + Bonus) - Defense) = (10 + 3) - 5 = 8
    const result = CombatResolver.calculateDamage(attacker, defender, 0.5, 0.99); // Normal hit, no crit

    expect(result.damageDealt).toBe(8);
    expect(result.hasAdvantage).toBe(true);
    expect(result.hasDisadvantage).toBe(false);
    expect(result.isHit).toBe(true);
    expect(result.isCrit).toBe(false);
    expect(result.hitChance).toBe(1.0);
    expect(result.critChance).toBe(0.20);
  });

  it('Axe attacking Sword yields disadvantage penalty (-3 damage)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.SWORD);

    // Damage Formula: max(1, (Attack + Penalty) - Defense) = (10 - 3) - 5 = 2
    const result = CombatResolver.calculateDamage(attacker, defender, 0.5, 0.99);

    expect(result.damageDealt).toBe(2);
    expect(result.hasAdvantage).toBe(false);
    expect(result.hasDisadvantage).toBe(true);
    expect(result.isHit).toBe(true);
    expect(result.hitChance).toBe(0.75);
  });

  it('Critical Hit deals 2x damage multiplier', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.SWORD);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.AXE);

    // Base damage = 8. Crit (2x) = 16
    const result = CombatResolver.calculateDamage(attacker, defender, 0.1, 0.05); // Hit + Crit

    expect(result.isHit).toBe(true);
    expect(result.isCrit).toBe(true);
    expect(result.damageDealt).toBe(16);
  });

  it('Missed attack deals 0 damage', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.SWORD);

    // Hit rate is 75%. Roll 0.90 -> MISS
    const result = CombatResolver.calculateDamage(attacker, defender, 0.90, 0.05);

    expect(result.isHit).toBe(false);
    expect(result.damageDealt).toBe(0);
  });

  it('Minimum damage floor is always at least 1 on successful hit', () => {
    const attacker = new Unit('1', 'Weak Attacker', 10, 1, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Strong Defender', 10, 10, 100, WeaponType.SWORD);

    const result = CombatResolver.calculateDamage(attacker, defender, 0.1, 0.99);

    expect(result.damageDealt).toBe(1);
    expect(result.hasDisadvantage).toBe(true);
    expect(result.isHit).toBe(true);
  });
});
