import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { GainExpUseCase } from '../../../src/features/combat/application/GainExpUseCase';
import { LevelUpUseCase } from '../../../src/features/combat/application/LevelUpUseCase';

describe('GainExpUseCase', () => {
  let unit: Unit;
  let levelUpUseCase: LevelUpUseCase;
  let useCase: GainExpUseCase;

  beforeEach(() => {
    unit = new Unit('u1', 'Hero', 10, 5, 5, WeaponType.SWORD);
    levelUpUseCase = new LevelUpUseCase();
    useCase = new GainExpUseCase(levelUpUseCase);
  });

  it('should increase EXP but not level up if under 100', () => {
    const result = useCase.execute(unit, 50);

    expect(unit.exp).toBe(50);
    expect(unit.level).toBe(1);
    expect(result.levelUps.length).toBe(0);
  });

  it('should trigger level up when EXP reaches 100', () => {
    jest.spyOn(levelUpUseCase, 'execute');

    const result = useCase.execute(unit, 100);

    expect(unit.exp).toBe(0); // Remainder
    expect(unit.level).toBe(2);
    expect(result.levelUps.length).toBe(1);
    expect(levelUpUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should handle remainder EXP after level up', () => {
    unit.exp = 80;
    const result = useCase.execute(unit, 50); // Total 130

    expect(unit.exp).toBe(30); // 130 - 100
    expect(unit.level).toBe(2);
    expect(result.levelUps.length).toBe(1);
  });

  it('should handle multiple level ups at once', () => {
    jest.spyOn(levelUpUseCase, 'execute');

    const result = useCase.execute(unit, 250); // 2 level ups, 50 remainder

    expect(unit.exp).toBe(50);
    expect(unit.level).toBe(3);
    expect(result.levelUps.length).toBe(2);
    expect(levelUpUseCase.execute).toHaveBeenCalledTimes(2);
  });
});
