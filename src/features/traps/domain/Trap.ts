import { TileCoordinate } from '../../grid/domain/TileCoordinate';

export enum TrapType {
  DAMAGE = 'DAMAGE',
  WARP = 'WARP',
  BELLY = 'BELLY'
}

export interface TrapBlueprint {
  id: string;
  name: string;
  type: string;
  damage: number;
  bellyDrain?: number;
  description: string;
}

export class Trap {
  public isRevealed: boolean = false;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: TrapType,
    public readonly coord: TileCoordinate,
    public readonly damage: number = 0,
    public readonly bellyDrain: number = 0
  ) {}

  public trigger(): void {
    this.isRevealed = true;
  }
}
