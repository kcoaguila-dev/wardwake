import { Unit } from '../domain/Unit';
import { IAudioService } from './ports/IAudioService';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { GridMap } from '../../grid/domain/GridMap';
import { CombatSummary, AttackUnitUseCase } from './AttackUnitUseCase';

export interface SkillTargetResult {
  unit: Unit;
  coord: TileCoordinate;
  summary?: CombatSummary;
}

export interface SkillExecutionResult {
  skillId: string;
  success: boolean;
  targetsAffected: SkillTargetResult[];
  newPlayerCoord?: TileCoordinate; // For movement skills like Dash
  buffApplied?: boolean;
}

export class ExecuteSkillUseCase {
  constructor(
    private attackUnitUseCase: AttackUnitUseCase,
    private audioService: IAudioService
  ) {}

  public execute(
    attacker: Unit,
    attackerCoord: TileCoordinate,
    skillId: string,
    gridMap: GridMap,
    enemies: { unit: Unit; coord: TileCoordinate }[],
    targetCoord?: TileCoordinate
  ): SkillExecutionResult {
    let cost = 0;

    if (skillId === 'spin_slash') cost = 6;
    else if (skillId === 'blade_dash') cost = 8;
    else if (skillId === 'pierce_thrust') cost = 5;
    else if (skillId === 'iron_bulwark') cost = 10;

    if (attacker.currentSp < cost) {
      return { skillId, success: false, targetsAffected: [] };
    }

    attacker.currentSp -= cost;
    const result: SkillExecutionResult = { skillId, success: true, targetsAffected: [] };

    switch (skillId) {
      case 'spin_slash':
        this.executeSpinSlash(attacker, attackerCoord, enemies, result);
        this.audioService.playSound('sword_slash'); // Consider unique SFX
        break;
      case 'blade_dash':
        if (targetCoord) {
          this.executeBladeDash(attacker, attackerCoord, targetCoord, gridMap, enemies, result);
        } else {
          result.success = false;
        }
        break;
      case 'pierce_thrust':
        if (targetCoord) {
          this.executePierceThrust(attacker, attackerCoord, targetCoord, enemies, result);
          this.audioService.playSound('lance_pierce');
        } else {
          result.success = false;
        }
        break;
      case 'iron_bulwark':
        this.executeIronBulwark(attacker, result);
        this.audioService.playSound('item_pickup'); // Consider unique SFX
        break;
    }

    return result;
  }

  private executeSpinSlash(
    attacker: Unit,
    attackerCoord: TileCoordinate,
    enemies: { unit: Unit; coord: TileCoordinate }[],
    result: SkillExecutionResult
  ) {
    const adjacentCoords = [
      new TileCoordinate(attackerCoord.x + 1, attackerCoord.y),
      new TileCoordinate(attackerCoord.x - 1, attackerCoord.y),
      new TileCoordinate(attackerCoord.x, attackerCoord.y + 1),
      new TileCoordinate(attackerCoord.x, attackerCoord.y - 1)
    ];

    for (const enemy of enemies) {
      if (enemy.unit.currentHp > 0 && adjacentCoords.some(c => c.equals(enemy.coord))) {
        // Apply damage directly or via AttackUnitUseCase. Let's use AttackUnitUseCase for consistency
        // But with guaranteed hit? The requirements don't mention hit rate changes.
        const summary = this.attackUnitUseCase.execute(attacker, enemy.unit);
        result.targetsAffected.push({ unit: enemy.unit, coord: enemy.coord, summary });
      }
    }
  }

  private executeBladeDash(
    attacker: Unit,
    attackerCoord: TileCoordinate,
    targetCoord: TileCoordinate,
    gridMap: GridMap,
    enemies: { unit: Unit; coord: TileCoordinate }[],
    result: SkillExecutionResult
  ) {
    // Dash 2 tiles forward in the direction of targetCoord
    const dx = Math.sign(targetCoord.x - attackerCoord.x);
    const dy = Math.sign(targetCoord.y - attackerCoord.y);

    const tile1 = new TileCoordinate(attackerCoord.x + dx, attackerCoord.y + dy);
    const tile2 = new TileCoordinate(attackerCoord.x + dx * 2, attackerCoord.y + dy * 2);

    let finalCoord = attackerCoord;

    // We can dash through enemies, damage them in path
    const pathCoords = [tile1, tile2];

    for (const coord of pathCoords) {
      // Check for enemies
      const enemy = enemies.find(e => e.unit.currentHp > 0 && e.coord.equals(coord));
      if (enemy) {
        const summary = this.attackUnitUseCase.execute(attacker, enemy.unit);
        result.targetsAffected.push({ unit: enemy.unit, coord: enemy.coord, summary });
      }

      // We can only end up on a walkable tile. Wait, Blade Dash implies dashing "2 tiles forward".
      // What if tile2 is not walkable? We stop at tile1. What if tile1 is not walkable?
      if (gridMap.isWalkable(coord)) {
        // Assuming we stop on the furthest walkable tile that isn't occupied?
        // Wait, the requirement says "Dashes 2 tiles forward and strikes the enemy in path".
        // It implies we dash and strike.
      }
    }

    // Determine where we land
    if (gridMap.isWalkable(tile2) && !enemies.some(e => e.unit.currentHp > 0 && e.coord.equals(tile2))) {
      finalCoord = tile2;
    } else if (gridMap.isWalkable(tile1) && !enemies.some(e => e.unit.currentHp > 0 && e.coord.equals(tile1))) {
      finalCoord = tile1;
    }

    result.newPlayerCoord = finalCoord;
    this.audioService.playSound('sword_slash');
  }

  private executePierceThrust(
    attacker: Unit,
    attackerCoord: TileCoordinate,
    targetCoord: TileCoordinate,
    enemies: { unit: Unit; coord: TileCoordinate }[],
    result: SkillExecutionResult
  ) {
    const dx = Math.sign(targetCoord.x - attackerCoord.x);
    const dy = Math.sign(targetCoord.y - attackerCoord.y);

    const tile1 = new TileCoordinate(attackerCoord.x + dx, attackerCoord.y + dy);
    const tile2 = new TileCoordinate(attackerCoord.x + dx * 2, attackerCoord.y + dy * 2);

    for (const enemy of enemies) {
      if (enemy.unit.currentHp > 0 && (enemy.coord.equals(tile1) || enemy.coord.equals(tile2))) {
        const summary = this.attackUnitUseCase.execute(attacker, enemy.unit);
        result.targetsAffected.push({ unit: enemy.unit, coord: enemy.coord, summary });
      }
    }
  }

  private executeIronBulwark(attacker: Unit, result: SkillExecutionResult) {
    attacker.applyDefenseBuff(6, 3);
    result.buffApplied = true;
  }
}
