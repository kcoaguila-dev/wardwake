import { Trap, TrapType, TrapBlueprint } from './Trap';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import trapsData from '../../../data/traps.json';

const rawTraps: TrapBlueprint[] = (Array.isArray(trapsData)
  ? trapsData
  : (trapsData as any).default || []) as TrapBlueprint[];

export class TrapRepository {
  private static readonly blueprints: TrapBlueprint[] = rawTraps;

  public static getAll(): TrapBlueprint[] {
    return this.blueprints;
  }

  public static createRandomTrap(coord: TileCoordinate): Trap {
    const bp = this.blueprints[Math.floor(Math.random() * this.blueprints.length)] || {
      id: 'spike_trap',
      name: 'Spike Trap',
      type: 'DAMAGE',
      damage: 5,
      description: 'Hidden metal spikes'
    };

    let type = TrapType.DAMAGE;
    if (bp.type === 'WARP') type = TrapType.WARP;
    else if (bp.type === 'BELLY') type = TrapType.BELLY;

    return new Trap(bp.id, bp.name, type, coord, bp.damage, bp.bellyDrain || 0);
  }
}
