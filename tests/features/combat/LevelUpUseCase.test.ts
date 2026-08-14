import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { LevelUpUseCase } from '../../../src/features/combat/application/LevelUpUseCase';

describe('LevelUpUseCase', () => {
  let unit: Unit;
  let useCase: LevelUpUseCase;

  beforeEach(() => {
    unit = new Unit('u1', 'Hero', 10, 5, 5, WeaponType.SWORD);
    useCase = new LevelUpUseCase();
  });

  it('should increment level by 1', () => {
    expect(unit.level).toBe(1);
    useCase.execute(unit);
    expect(unit.level).toBe(2);
  });

  it('should increase stats based on random rolls', () => {
    // Mock Math.random to return predictable values for guaranteed growths
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    // With 0.1, all checks (0.1 < 0.8, 0.1 < 0.6, 0.1 < 0.4) will pass.
    // Also hp check Math.random() < 0.5 will pass -> +1 HP

    const result = useCase.execute(unit);

    expect(result.hpIncrease).toBe(1);
    expect(result.attackIncrease).toBe(1);
    expect(result.defenseIncrease).toBe(1);

    expect(unit.maxHp).toBe(11); // 10 + 1
    expect(unit.currentHp).toBe(11); // 10 + 1
    expect(unit.attack).toBe(6); // 5 + 1
    expect(unit.defense).toBe(6); // 5 + 1

    jest.restoreAllMocks();
  });

  it('should correctly handle HP +2 growth', () => {
    // Math.random first call < 0.8 passes, second call > 0.5 triggers +2 HP
    let calls = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      calls++;
      if (calls === 1) return 0.1; // Passes hp growth chance
      if (calls === 2) return 0.9; // Fails +1 chance, gives +2 HP
      return 0.9; // Fails attack and defense
    });

    const result = useCase.execute(unit);

    expect(result.hpIncrease).toBe(2);
    expect(unit.maxHp).toBe(12);

    expect(result.attackIncrease).toBe(0);
    expect(result.defenseIncrease).toBe(0);

    jest.restoreAllMocks();
  });

  it('should not increase stats if rolls fail', () => {
    // Mock Math.random to always return 0.99 (guaranteed failure for all growths)
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = useCase.execute(unit);

    expect(result.hpIncrease).toBe(0);
    expect(result.attackIncrease).toBe(0);
    expect(result.defenseIncrease).toBe(0);

    expect(unit.maxHp).toBe(10);
    expect(unit.attack).toBe(5);
    expect(unit.defense).toBe(5);

    jest.restoreAllMocks();
  });
});
