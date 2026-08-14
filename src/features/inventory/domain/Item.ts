export enum ItemType {
  HEAL = 'HEAL',
  ATTACK_BUFF = 'ATTACK_BUFF',
  FOOD = 'FOOD',
  RELIC_WEAPON = 'RELIC_WEAPON',
  RELIC_ARMOR = 'RELIC_ARMOR',
  WAND = 'WAND',
  SCROLL = 'SCROLL',
  PROJECTILE = 'PROJECTILE'
}

export class Item {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ItemType,
    public readonly value: number,
    public readonly critBonus: number = 0,
    public readonly doubleStrike: boolean = false,
    public readonly lifeStealPercent: number = 0,
    public charges?: number,
    public readonly maxCharges?: number,
    public ammo?: number,
    public readonly maxAmmo?: number
  ) {}
}
