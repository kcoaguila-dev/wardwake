export enum ItemType {
  HEAL = 'HEAL',
  ATTACK_BUFF = 'ATTACK_BUFF',
  FOOD = 'FOOD',
  RELIC_WEAPON = 'RELIC_WEAPON',
  RELIC_ARMOR = 'RELIC_ARMOR'
}

export class Item {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ItemType,
    public readonly value: number,
    public readonly critBonus: number = 0,
    public readonly doubleStrike: boolean = false,
    public readonly lifeStealPercent: number = 0
  ) {}
}
