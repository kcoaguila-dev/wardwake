export enum ItemType {
  HEAL = 'HEAL',
  ATTACK_BUFF = 'ATTACK_BUFF'
}

export class Item {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ItemType,
    public readonly value: number
  ) {}
}
