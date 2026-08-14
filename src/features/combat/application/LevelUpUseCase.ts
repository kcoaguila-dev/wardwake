export interface LevelUpResult {
  hpIncrease: number;
  attackIncrease: number;
  defenseIncrease: number;
}

import { Unit } from '../domain/Unit';

export class LevelUpUseCase {
  public execute(unit: Unit): LevelUpResult {
    unit.level += 1;

    let hpIncrease = 0;
    let attackIncrease = 0;
    let defenseIncrease = 0;

    // HP Growth: +1 to +2, 80% chance
    if (Math.random() < unit.statGrowths.hp) {
      hpIncrease = Math.random() < 0.5 ? 1 : 2; // +1 or +2
      unit.maxHp += hpIncrease;
      unit.currentHp += hpIncrease; // Heal by the increased amount
    }

    // Attack Growth: +1, 60% chance
    if (Math.random() < unit.statGrowths.attack) {
      attackIncrease = 1;
      unit.attack += attackIncrease;
    }

    // Defense Growth: +1, 40% chance
    if (Math.random() < unit.statGrowths.defense) {
      defenseIncrease = 1;
      unit.defense += defenseIncrease;
    }

    return {
      hpIncrease,
      attackIncrease,
      defenseIncrease
    };
  }
}
