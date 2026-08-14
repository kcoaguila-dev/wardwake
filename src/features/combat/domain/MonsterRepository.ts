import { Unit } from './Unit';
import { WeaponType } from './WeaponType';
import monstersData from '../../../data/monsters.json';

export interface MonsterBlueprint {
  id: string;
  name: string;
  tier?: number;
  floorTier?: number;
  weaponType: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  expYield: number;
  aiProfile?: string;
  isElite?: boolean;
  isBoss?: boolean;
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

  public static getByTier(tier: number, allowSpecial: boolean = false): MonsterBlueprint[] {
    const list = this.blueprints.filter(m => (m.tier === tier || m.floorTier === tier) && (allowSpecial ? true : (!m.isElite && !m.isBoss)));
    return list.length > 0 ? list : this.blueprints.filter(m => !m.isElite && !m.isBoss);
  }

  public static getEliteMonsters(): MonsterBlueprint[] {
    return this.blueprints.filter(m => m.isElite);
  }

  public static getBossMonster(floorNumber: number): MonsterBlueprint | undefined {
    if (floorNumber >= 10) {
      return this.blueprints.find(m => m.id === 'boss_shadow_sovereign') || this.blueprints.find(m => m.isBoss);
    }
    return this.blueprints.find(m => m.id === 'boss_dread_champion') || this.blueprints.find(m => m.isBoss);
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

    const tier = blueprint.tier || blueprint.floorTier || 1;
    const hpGrowth = blueprint.isBoss ? 0 : (tier === 1 ? floorNumber : floorNumber * 2);
    const finalHp = blueprint.baseHp + hpGrowth;
    const finalAtk = blueprint.baseAttack;
    const finalDef = blueprint.baseDefense;

    return new Unit(uniqueId, blueprint.name, finalHp, finalAtk, finalDef, weapon);
  }
}
