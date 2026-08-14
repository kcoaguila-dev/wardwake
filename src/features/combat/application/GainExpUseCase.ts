import { Unit } from '../domain/Unit';
import { LevelUpUseCase, LevelUpResult } from './LevelUpUseCase';

export interface GainExpResult {
  levelUps: LevelUpResult[];
}

export class GainExpUseCase {
  private levelUpUseCase: LevelUpUseCase;

  constructor(levelUpUseCase: LevelUpUseCase) {
    this.levelUpUseCase = levelUpUseCase;
  }

  public execute(unit: Unit, amount: number): GainExpResult {
    unit.exp += amount;

    const levelUps: LevelUpResult[] = [];

    while (unit.exp >= 100) {
      unit.exp -= 100;
      const result = this.levelUpUseCase.execute(unit);
      levelUps.push(result);
    }

    return {
      levelUps
    };
  }
}
