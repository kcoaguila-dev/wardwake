import { DataRegistry } from './DataRegistry';
import { MonsterBlueprint } from '../../features/combat/domain/MonsterRepository';
import { ItemBlueprint } from '../../features/inventory/domain/ItemRepository';
import { Unit } from '../../features/combat/domain/Unit';
import { WeaponType } from '../../features/combat/domain/WeaponType';

import monstersData from '../../data/monsters.json';
import itemsData from '../../data/items.json';
import heroesData from '../../data/heroes.json';
import combatRulesData from '../../data/combat_rules.json';

export interface HeroBlueprint {
  id: string;
  name: string;
  weaponType: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  startingInventory: string[];
}

export interface CombatRulesConfig {
  weaponTriangleAdvantageBonus: number;
  weaponTriangleDisadvantagePenalty: number;
  minDamage: number;
  baseHitRate: number;
  advantageAccuracyBonus: number;
  disadvantageAccuracyPenalty: number;
  baseCritChance: number;
  advantageCritBonus: number;
  critDamageMultiplier: number;
  expPerHit: number;
  expPerKill: number;
  expLevelUpThreshold: number;
}

function parseArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'default' in data && Array.isArray((data as any).default)) {
    return (data as any).default as T[];
  }
  return [];
}

function parseObject<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'default' in data) {
    return (data as any).default as T;
  }
  return data as T;
}

export class GameDatabase {
  public static readonly monsters = new DataRegistry<MonsterBlueprint>(parseArray<MonsterBlueprint>(monstersData));
  public static readonly items = new DataRegistry<ItemBlueprint>(parseArray<ItemBlueprint>(itemsData));
  public static readonly heroes = new DataRegistry<HeroBlueprint>(parseArray<HeroBlueprint>(heroesData));
  public static readonly combatRules: CombatRulesConfig = parseObject<CombatRulesConfig>(combatRulesData);

  public static createHeroUnit(blueprintId: string, customId?: string): Unit {
    const blueprint = this.heroes.getOrThrow(blueprintId);
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

    return new Unit(
      customId || blueprint.id,
      blueprint.name,
      blueprint.baseHp,
      blueprint.baseAttack,
      blueprint.baseDefense,
      weapon
    );
  }
}
