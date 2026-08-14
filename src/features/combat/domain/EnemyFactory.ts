import { Unit } from './Unit';
import { MonsterRepository } from './MonsterRepository';

export class EnemyFactory {
  /**
   * Generates a tiered enemy count based on the current floor.
   */
  public static getEnemyCountForFloor(floorNumber: number): number {
    if (floorNumber <= 3) {
      return Math.floor(Math.random() * 2) + 2; // 2 to 3
    } else if (floorNumber <= 6) {
      return Math.floor(Math.random() * 2) + 3; // 3 to 4
    } else {
      return Math.floor(Math.random() * 2) + 4; // 4 to 5
    }
  }

  /**
   * Creates an enemy Unit from data-driven MonsterRepository blueprints.
   */
  public static createEnemy(floorNumber: number, index: number): Unit {
    const id = `e${index + 1}`;
    const tier = floorNumber <= 3 ? 1 : floorNumber <= 6 ? 2 : 3;
    const tierBlueprints = MonsterRepository.getByTier(tier);
    const blueprint = tierBlueprints[index % tierBlueprints.length]!;

    return MonsterRepository.createUnitFromBlueprint(blueprint, id, floorNumber);
  }
}
