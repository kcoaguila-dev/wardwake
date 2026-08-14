import { Unit } from './Unit';
import { WeaponType } from './WeaponType';
import { GameDatabase } from '../../../core/domain/GameDatabase';

export interface CombatResult {
  damageDealt: number;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
}

export class CombatResolver {
  public static get ADVANTAGE_BONUS_DAMAGE(): number {
    return GameDatabase.combatRules?.weaponTriangleAdvantageBonus ?? 3;
  }

  public static get DISADVANTAGE_PENALTY_DAMAGE(): number {
    return -(GameDatabase.combatRules?.weaponTriangleDisadvantagePenalty ?? 3);
  }

  public static readonly ADVANTAGE_BONUS_ACCURACY = 0.15;
  public static readonly DISADVANTAGE_PENALTY_ACCURACY = -0.15;

  /**
   * Evaluates if the attacker has a weapon triangle advantage against the defender.
   * Triangles: SWORD > AXE, AXE > LANCE, LANCE > SWORD.
   */
  public static hasAdvantage(attackerWeapon: WeaponType, defenderWeapon: WeaponType): boolean {
    if (attackerWeapon === WeaponType.SWORD && defenderWeapon === WeaponType.AXE) return true;
    if (attackerWeapon === WeaponType.AXE && defenderWeapon === WeaponType.LANCE) return true;
    if (attackerWeapon === WeaponType.LANCE && defenderWeapon === WeaponType.SWORD) return true;
    return false;
  }

  /**
   * Evaluates if the attacker has a weapon triangle disadvantage against the defender.
   */
  public static hasDisadvantage(attackerWeapon: WeaponType, defenderWeapon: WeaponType): boolean {
    return this.hasAdvantage(defenderWeapon, attackerWeapon);
  }

  /**
   * Calculates the damage the attacker will deal to the defender,
   * factoring in data-driven weapon triangle rules.
   */
  public static calculateDamage(attacker: Unit, defender: Unit): CombatResult {
    const advantage = this.hasAdvantage(attacker.weaponType, defender.weaponType);
    const disadvantage = this.hasDisadvantage(attacker.weaponType, defender.weaponType);

    let bonusDamage = 0;
    if (advantage) {
      bonusDamage = this.ADVANTAGE_BONUS_DAMAGE;
    } else if (disadvantage) {
      bonusDamage = this.DISADVANTAGE_PENALTY_DAMAGE;
    }

    const calculatedDamage = (attacker.attack + bonusDamage) - defender.defense;
    const minDmg = GameDatabase.combatRules?.minDamage ?? 1;
    const damageDealt = Math.max(minDmg, calculatedDamage);

    return {
      damageDealt,
      hasAdvantage: advantage,
      hasDisadvantage: disadvantage
    };
  }
}
