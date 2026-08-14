import { WeaponType } from './WeaponType';
import { Item } from '../../inventory/domain/Item';

export interface StatGrowths {
  hp: number;
  attack: number;
  defense: number;
}

export class Unit {
  public readonly id: string;
  public readonly name: string;
  public maxHp: number; // Made mutable for level ups
  public currentHp: number;
  public attack: number;
  public defense: number;
  public weaponType: WeaponType;
  public inventory: Item[] = [];

  // Level up properties
  public exp: number = 0;
  public level: number = 1;
  public statGrowths: StatGrowths = { hp: 0.8, attack: 0.6, defense: 0.4 };

  // Belly / Hunger properties
  public belly: number = 100;
  public maxBelly: number = 100;

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
    const damageToApply = Math.max(0, amount);
    this.currentHp = Math.max(0, this.currentHp - damageToApply);
    return this.currentHp === 0;
  }

  /**
   * Restores HP to the unit, clamped to maxHp.
   * @param amount The amount to heal.
   */
  public heal(amount: number): void {
    if (amount < 0) return;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  /**
   * Increases the attack power of the unit.
   * @param amount The amount to increase attack by.
   */
  public buffAttack(amount: number): void {
    if (amount < 0) return;
    this.attack += amount;
  }

  /**
   * Decreases belly fullness per step.
   * @param amount The amount of belly to decrease.
   * @returns boolean true if the unit is starving (belly === 0).
   */
  public decreaseBelly(amount: number = 1): boolean {
    this.belly = Math.max(0, this.belly - amount);
    return this.belly === 0;
  }

  /**
   * Restores belly to the unit, clamped to maxBelly.
   * @param amount The amount of food restored.
   */
  public feed(amount: number): void {
    if (amount < 0) return;
    this.belly = Math.min(this.maxBelly, this.belly + amount);
  }

  /**
   * Adds an item to the unit's inventory.
   * @param item The item to add.
   */
  public addItem(item: Item): void {
    this.inventory.push(item);
  }

  /**
   * Removes an item from the unit's inventory by its ID.
   * @param itemId The ID of the item to remove.
   */
  public removeItem(itemId: string): void {
    this.inventory = this.inventory.filter(i => i.id !== itemId);
  }
}
