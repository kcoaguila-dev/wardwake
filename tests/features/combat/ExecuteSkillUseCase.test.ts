import { ExecuteSkillUseCase } from '../../../src/features/combat/application/ExecuteSkillUseCase';
import { AttackUnitUseCase } from '../../../src/features/combat/application/AttackUnitUseCase';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { TileCoordinate } from '../../../src/features/grid/domain/TileCoordinate';
import { GridMap } from '../../../src/features/grid/domain/GridMap';

class MockAudioService {
  playSound() {}
  startBgm() {}
  stopBgm() {}
  toggleMute() {}
}

describe('ExecuteSkillUseCase', () => {
  let useCase: ExecuteSkillUseCase;
  let attackUnitUseCase: AttackUnitUseCase;
  let audioService: MockAudioService;
  let attacker: Unit;
  let enemies: { unit: Unit; coord: TileCoordinate }[];
  let gridMap: GridMap;

  beforeEach(() => {
    audioService = new MockAudioService();
    attackUnitUseCase = new AttackUnitUseCase(audioService as any);
    useCase = new ExecuteSkillUseCase(attackUnitUseCase, audioService as any);

    attacker = new Unit('u1', 'Hero', 20, 10, 5, WeaponType.SWORD);
    attacker.currentSp = 20;

    const enemy1 = new Unit('e1', 'Enemy 1', 10, 5, 2, WeaponType.AXE);
    const enemy2 = new Unit('e2', 'Enemy 2', 10, 5, 2, WeaponType.LANCE);

    enemies = [
      { unit: enemy1, coord: new TileCoordinate(2, 1) },
      { unit: enemy2, coord: new TileCoordinate(1, 2) }
    ];

    gridMap = new GridMap(5, 5);
  });

  it('fails if not enough SP', () => {
    attacker.currentSp = 2;
    const result = useCase.execute(attacker, new TileCoordinate(1, 1), 'spin_slash', gridMap, enemies);
    expect(result.success).toBe(false);
    expect(attacker.currentSp).toBe(2);
  });

  it('executes Spin Slash and damages adjacent enemies', () => {
    const startSp = attacker.currentSp;
    const result = useCase.execute(attacker, new TileCoordinate(1, 1), 'spin_slash', gridMap, enemies);

    expect(result.success).toBe(true);
    expect(attacker.currentSp).toBe(startSp - 6);
    expect(result.targetsAffected.length).toBe(2);
  });

  it('executes Iron Bulwark and buffs defense', () => {
    const startSp = attacker.currentSp;
    const startDef = attacker.defense;
    const result = useCase.execute(attacker, new TileCoordinate(1, 1), 'iron_bulwark', gridMap, enemies);

    expect(result.success).toBe(true);
    expect(attacker.currentSp).toBe(startSp - 10);
    expect(result.buffApplied).toBe(true);
    expect(attacker.defense).toBe(startDef + 6);
  });

  it('executes Blade Dash and damages enemies in path', () => {
    const startSp = attacker.currentSp;
    const targetCoord = new TileCoordinate(3, 1);

    const result = useCase.execute(attacker, new TileCoordinate(1, 1), 'blade_dash', gridMap, enemies, targetCoord);

    expect(result.success).toBe(true);
    expect(attacker.currentSp).toBe(startSp - 8);
    expect(result.targetsAffected.length).toBe(1);
    expect(result.targetsAffected[0]!.unit.id).toBe('e1');
    expect(result.newPlayerCoord).toBeDefined();
    expect(result.newPlayerCoord?.x).toBe(3);
    expect(result.newPlayerCoord?.y).toBe(1);
  });

  it('executes Pierce Thrust and damages enemies in line', () => {
    const startSp = attacker.currentSp;
    const targetCoord = new TileCoordinate(1, 3);

    const result = useCase.execute(attacker, new TileCoordinate(1, 1), 'pierce_thrust', gridMap, enemies, targetCoord);

    expect(result.success).toBe(true);
    expect(attacker.currentSp).toBe(startSp - 5);
    expect(result.targetsAffected.length).toBe(1);
    expect(result.targetsAffected[0]!.unit.id).toBe('e2');
  });
});
