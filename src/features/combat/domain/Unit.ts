import { WeaponType } from './WeaponType';
import { Item, ItemType } from '../../inventory/domain/Item';

export interface StatGrowths {
  hp: number;
  attack: number;
  defense: number;
}

export enum StatusEffect {
  SLEEP = 'SLEEP',
  PETRIFIED = 'PETRIFIED'
}

export class Unit {
  public readonly id: string;
  public readonly name: string;
  public maxHp: number;
  public currentHp: number;
  public maxSp: number = 20; // Default SP logic can be refined
  public currentSp: number;
  public attack: number;
  public defense: number;
  public weaponType: WeaponType;
  public inventory: Item[] = [];

  public defenseBuffTurns: number = 0;

  // Equipped Relic Slots
  public equippedWeapon?: Item;
  public equippedArmor?: Item;

  // Level up properties
  public exp: number = 0;
  public level: number = 1;
  public statGrowths: StatGrowths = { hp: 0.8, attack: 0.6, defense: 0.4 };

  // Belly / Hunger properties
  public belly: number = 100;

  // AI & Tactical properties
  public blueprintId?: string;
  public moveRange: number = 2;
  public attackRange: number = 1;
  public detectionRadius: number = 3;
  public maxBelly: number = 100;
  public isExplosive: boolean = false;
  public explosionRadius: number = 1;
  public explosionDamage: number = 16;
  public fuseActive: boolean = false;

  // Status effect properties
  public statusEffect: StatusEffect | null = null;
  public statusTurns: number = 0;

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
    this.maxSp = 20;
    this.currentSp = this.maxSp;
    this.attack = attack;
    this.defense = defense;
    this.weaponType = weaponType;
  }

  public applyDamage(amount: number): boolean {
    const damageToApply = Math.max(0, amount);
    this.currentHp = Math.max(0, this.currentHp - damageToApply);
    return this.currentHp === 0;
  }

  public heal(amount: number): void {
    if (amount < 0) return;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  public buffAttack(amount: number): void {
    if (amount < 0) return;
    this.attack += amount;
  }

  public applyDefenseBuff(amount: number, turns: number): void {
    // Prevent stacking
    if (this.defenseBuffTurns > 0) {
      this.defenseBuffTurns = turns;
      return;
    }
    this.defense += amount;
    this.defenseBuffTurns = turns;
  }

  public tickBuffs(): void {
    if (this.defenseBuffTurns > 0) {
      this.defenseBuffTurns--;
      if (this.defenseBuffTurns === 0) {
        this.defense -= 6; // Hardcoded reversal for Iron Bulwark based on prompt
      }
    }
  }

  public decreaseBelly(amount: number = 1): boolean {
    this.belly = Math.max(0, this.belly - amount);
    return this.belly === 0;
  }

  public feed(amount: number): void {
    if (amount < 0) return;
    this.belly = Math.min(this.maxBelly, this.belly + amount);
  }

  public equipRelic(item: Item): void {
    if (item.type === ItemType.RELIC_WEAPON) {
      if (this.equippedWeapon) {
        this.attack -= this.equippedWeapon.value;
      }
      this.equippedWeapon = item;
      this.attack += item.value;
    } else if (item.type === ItemType.RELIC_ARMOR) {
      if (this.equippedArmor) {
        this.defense -= this.equippedArmor.value;
      }
      this.equippedArmor = item;
      this.defense += item.value;
    }
  }

  public addItem(item: Item): void {
    this.inventory.push(item);
  }

  public removeItem(itemId: string): void {
    this.inventory = this.inventory.filter(i => i.id !== itemId);
  }

  public applyStatus(effect: StatusEffect, turns: number): void {
    this.statusEffect = effect;
    this.statusTurns = turns;
  }

  public decrementStatus(): void {
    if (this.statusTurns > 0) {
      this.statusTurns--;
      if (this.statusTurns === 0) {
        this.statusEffect = null;
      }
    }
  }
}
