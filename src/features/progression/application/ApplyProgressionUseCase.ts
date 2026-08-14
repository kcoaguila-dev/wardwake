import { Unit } from '../../combat/domain/Unit';
import { TownData } from '../domain/TownData';

export class ApplyProgressionUseCase {
  public static execute(unit: Unit, townData: TownData): void {
    if (townData.upgrades.maxHp > 0) {
      unit.maxHp += townData.upgrades.maxHp;
      unit.currentHp += townData.upgrades.maxHp; // Heal to full bonus
    }

    if (townData.upgrades.maxBelly > 0) {
      unit.maxBelly += townData.upgrades.maxBelly;
      unit.belly += townData.upgrades.maxBelly; // Feed to full bonus
    }

    if (townData.upgrades.attack > 0) {
      unit.attack += townData.upgrades.attack;
    }
  }
}
