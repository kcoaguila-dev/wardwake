import { Unit } from './Unit';
import { WeaponType } from './WeaponType';
import monstersData from '../../../data/monsters.json';

export interface MonsterBlueprint {
  id: string;
  name: string;
  tier: number;
  weaponType: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  expYield: number;
  aiProfile: string;
}

const rawBlueprints: MonsterBlueprint[] = (Array.isArray(monstersData)
  ? monstersData
  : (monstersData as any).default || []) as MonsterBlueprint[];

export class MonsterRepository {
  private static readonly blueprints: MonsterBlueprint[] = rawBlueprints;

  public static getAll(): MonsterBlueprint[] {
    return this.blueprints;
  }

  public static getById(id: string): MonsterBlueprint | undefined {
    return this.blueprints.find(m => m.id === id);
  }

  public static getByTier(tier: number): MonsterBlueprint[] {
    const list = this.blueprints.filter(m => m.tier === tier);
    return list.length > 0 ? list : this.blueprints.filter(m => m.tier === 1);
  }

  public static createUnitFromBlueprint(blueprint: MonsterBlueprint, uniqueId: string, floorNumber: number): Unit {
    let weapon: WeaponType;
    switch (blueprint.weaponType.toUpperCase()) {
      case 'SWORD':
        weapon = WeaponType.SWORD;
        break;
      case 'LANCE':
        weapon = WeaponType.LANCE;
        break;
      case 'AXE':
        weapon = WeaponType.AXE;
        break;
      default:
        weapon = WeaponType.SWORD;
    }

    const hpGrowth = blueprint.tier === 1 ? floorNumber : floorNumber * 2;
    const finalHp = blueprint.baseHp + hpGrowth;
    const finalAtk = blueprint.baseAttack;
    const finalDef = blueprint.baseDefense;

    return new Unit(uniqueId, blueprint.name, finalHp, finalAtk, finalDef, weapon);
  }
}
