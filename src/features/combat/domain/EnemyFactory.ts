import { Unit } from './Unit';
import { MonsterRepository } from './MonsterRepository';

export class EnemyFactory {
  public static getEnemyCountForFloor(floorNumber: number): number {
    if (floorNumber === 5 || floorNumber === 10) return 1; // Boss only arena!
    if (floorNumber <= 3) {
      return Math.floor(Math.random() * 2) + 2; // 2 to 3
    } else if (floorNumber <= 6) {
      return Math.floor(Math.random() * 2) + 3; // 3 to 4
    } else {
      return Math.floor(Math.random() * 2) + 4; // 4 to 5
    }
  }

  public static createBoss(floorNumber: number): Unit {
    const blueprint = MonsterRepository.getBossMonster(floorNumber);
    if (blueprint) {
      return MonsterRepository.createUnitFromBlueprint(blueprint, 'boss_1', floorNumber);
    }
    return this.createEnemy(floorNumber, 0, true);
  }

  public static createEnemy(floorNumber: number, index: number, isElite: boolean = false): Unit {
    const id = `e${index + 1}`;
    if (isElite) {
      const eliteBlueprints = MonsterRepository.getEliteMonsters();
      if (eliteBlueprints.length > 0) {
        const bp = eliteBlueprints[index % eliteBlueprints.length]!;
        return MonsterRepository.createUnitFromBlueprint(bp, id, floorNumber);
      }
    }

    const tier = floorNumber <= 3 ? 1 : floorNumber <= 6 ? 2 : 3;
    const tierBlueprints = MonsterRepository.getByTier(tier, false);
    const blueprint = tierBlueprints[index % tierBlueprints.length]!;

    return MonsterRepository.createUnitFromBlueprint(blueprint, id, floorNumber);
  }
}
