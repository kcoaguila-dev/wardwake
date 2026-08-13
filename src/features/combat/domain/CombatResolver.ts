import { Unit } from './Unit';
import { WeaponType } from './WeaponType';

export interface CombatResult {
  damageDealt: number;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
}

export class CombatResolver {
  public static readonly ADVANTAGE_BONUS_DAMAGE = 3;
  // Advantage Bonus: +15% Accuracy. (Could be used if implementing accuracy later, not in requirements for current calculations but good for documentation)
  public static readonly ADVANTAGE_BONUS_ACCURACY = 0.15;

  public static readonly DISADVANTAGE_PENALTY_DAMAGE = -3;
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
    // Disadvantage is the inverse of advantage
    return this.hasAdvantage(defenderWeapon, attackerWeapon);
  }

  /**
   * Calculates the damage the attacker will deal to the defender,
   * factoring in weapon triangle advantage/disadvantage.
   * Damage Formula: Math.max(1, (Attacker.Attack + AdvantageBonus) - Defender.Defense)
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
    const damageDealt = Math.max(1, calculatedDamage);

    return {
      damageDealt,
      hasAdvantage: advantage,
      hasDisadvantage: disadvantage
    };
  }
}
