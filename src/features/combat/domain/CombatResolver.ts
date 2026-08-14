import { Unit } from './Unit';
import { WeaponType } from './WeaponType';
import { GameDatabase } from '../../../core/domain/GameDatabase';

export interface CombatResult {
  damageDealt: number;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  isHit: boolean;
  isCrit: boolean;
  hitChance: number;
  critChance: number;
  lifeStealAmount: number;
  doubleStrike: boolean;
}

export class CombatResolver {
  public static get ADVANTAGE_BONUS_DAMAGE(): number {
    return GameDatabase.combatRules?.weaponTriangleAdvantageBonus ?? 3;
  }

  public static get DISADVANTAGE_PENALTY_DAMAGE(): number {
    return -(GameDatabase.combatRules?.weaponTriangleDisadvantagePenalty ?? 3);
  }

  public static get BASE_HIT_RATE(): number {
    return GameDatabase.combatRules?.baseHitRate ?? 0.90;
  }

  public static get ADVANTAGE_ACCURACY_BONUS(): number {
    return GameDatabase.combatRules?.advantageAccuracyBonus ?? 0.10;
  }

  public static get DISADVANTAGE_ACCURACY_PENALTY(): number {
    return GameDatabase.combatRules?.disadvantageAccuracyPenalty ?? 0.15;
  }

  public static get BASE_CRIT_CHANCE(): number {
    return GameDatabase.combatRules?.baseCritChance ?? 0.10;
  }

  public static get ADVANTAGE_CRIT_BONUS(): number {
    return GameDatabase.combatRules?.advantageCritBonus ?? 0.10;
  }

  public static get CRIT_DAMAGE_MULTIPLIER(): number {
    return GameDatabase.combatRules?.critDamageMultiplier ?? 2.0;
  }

  public static hasAdvantage(attackerWeapon: WeaponType, defenderWeapon: WeaponType): boolean {
    if (attackerWeapon === WeaponType.SWORD && defenderWeapon === WeaponType.AXE) return true;
    if (attackerWeapon === WeaponType.AXE && defenderWeapon === WeaponType.LANCE) return true;
    if (attackerWeapon === WeaponType.LANCE && defenderWeapon === WeaponType.SWORD) return true;
    return false;
  }

  public static hasDisadvantage(attackerWeapon: WeaponType, defenderWeapon: WeaponType): boolean {
    return this.hasAdvantage(defenderWeapon, attackerWeapon);
  }

  public static calculateRates(attacker: Unit, defender: Unit): { hitChance: number; critChance: number; hasAdvantage: boolean; hasDisadvantage: boolean } {
    const advantage = this.hasAdvantage(attacker.weaponType, defender.weaponType);
    const disadvantage = this.hasDisadvantage(attacker.weaponType, defender.weaponType);

    let hitChance = this.BASE_HIT_RATE;
    if (advantage) {
      hitChance = Math.min(1.0, hitChance + this.ADVANTAGE_ACCURACY_BONUS);
    } else if (disadvantage) {
      hitChance = Math.max(0.1, hitChance - this.DISADVANTAGE_ACCURACY_PENALTY);
    }

    let critChance = this.BASE_CRIT_CHANCE;
    if (advantage) {
      critChance += this.ADVANTAGE_CRIT_BONUS;
    }

    // Add equipped relic weapon crit bonus
    if (attacker.equippedWeapon?.critBonus) {
      critChance += attacker.equippedWeapon.critBonus / 100;
    }

    return { hitChance, critChance, hasAdvantage: advantage, hasDisadvantage: disadvantage };
  }

  public static calculateDamage(attacker: Unit, defender: Unit, rollHit?: number, rollCrit?: number): CombatResult {
    const { hitChance, critChance, hasAdvantage, hasDisadvantage } = this.calculateRates(attacker, defender);

    const hitRoll = rollHit !== undefined ? rollHit : Math.random();
    const isHit = hitRoll <= hitChance;

    if (!isHit) {
      return {
        damageDealt: 0,
        hasAdvantage,
        hasDisadvantage,
        isHit: false,
        isCrit: false,
        hitChance,
        critChance,
        lifeStealAmount: 0,
        doubleStrike: false
      };
    }

    let bonusDamage = 0;
    if (hasAdvantage) {
      bonusDamage = this.ADVANTAGE_BONUS_DAMAGE;
    } else if (hasDisadvantage) {
      bonusDamage = this.DISADVANTAGE_PENALTY_DAMAGE;
    }

    const baseDamage = Math.max(GameDatabase.combatRules?.minDamage ?? 1, (attacker.attack + bonusDamage) - defender.defense);

    const critRoll = rollCrit !== undefined ? rollCrit : Math.random();
    const isCrit = critRoll <= critChance;

    const damageDealt = isCrit ? Math.round(baseDamage * this.CRIT_DAMAGE_MULTIPLIER) : baseDamage;

    // Relic Life Steal Calculation
    let lifeStealAmount = 0;
    if (attacker.equippedWeapon?.lifeStealPercent) {
      lifeStealAmount = Math.max(1, Math.round(damageDealt * (attacker.equippedWeapon.lifeStealPercent / 100)));
    }

    const doubleStrike = !!attacker.equippedWeapon?.doubleStrike;

    return {
      damageDealt,
      hasAdvantage,
      hasDisadvantage,
      isHit: true,
      isCrit,
      hitChance,
      critChance,
      lifeStealAmount,
      doubleStrike
    };
  }
}
