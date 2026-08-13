import { WeaponType } from './WeaponType';

export class Unit {
  public readonly id: string;
  public readonly name: string;
  public readonly maxHp: number;
  public currentHp: number;
  public attack: number;
  public defense: number;
  public weaponType: WeaponType;

  constructor(
    id: string,
    name: string,
    maxHp: number,
    attack: number,
    defense: number,
    weaponType: WeaponType
  ) {
    this.id = id;
    this.name = name;
    this.maxHp = maxHp;
    this.currentHp = maxHp;
    this.attack = attack;
    this.defense = defense;
    this.weaponType = weaponType;
  }

  /**
   * Applies damage to the unit.
   * @param amount The amount of damage to apply.
   * @returns boolean true if the unit dies as a result of this damage, false otherwise.
   */
  public applyDamage(amount: number): boolean {
    // Ensure amount is at least 0 (no negative damage)
    const damageToApply = Math.max(0, amount);
    this.currentHp = Math.max(0, this.currentHp - damageToApply);

    return this.currentHp === 0;
  }
}
