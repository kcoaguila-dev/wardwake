import { ExecuteEnemyTurnUseCase } from './ExecuteEnemyTurnUseCase';
import { GridMap } from '../../grid/domain/GridMap';
import { Pathfinder } from '../../grid/domain/Pathfinder';
import { TileCoordinate } from '../../grid/domain/TileCoordinate';
import { Unit } from '../../combat/domain/Unit';
import { WeaponType } from '../../combat/domain/WeaponType';
import { StatusEffect } from '../../combat/domain/Unit';

describe('ExecuteEnemyTurnUseCase', () => {
  let grid: GridMap;
  let pathfinder: Pathfinder;
  let enemyUnit: Unit;

  beforeEach(() => {
    grid = new GridMap(10, 10);
    pathfinder = new Pathfinder();
    enemyUnit = new Unit('enemy-1', 'Goblin', 10, 2, 1, WeaponType.SWORD);
  });

  it('should not move and return no target if there are no players', () => {
    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, []);
    const enemyCoord = new TileCoordinate(2, 2);

    const result = useCase.execute(enemyUnit, enemyCoord);

    expect(result.targetCoordinate.equals(new TileCoordinate(2, 2))).toBe(true);
    expect(result.targetToAttack).toBeNull();
  });

  it('should find closest player, move towards them, and not attack if not adjacent', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const player2 = new Unit('player-2', 'Hero2', 20, 5, 2, WeaponType.BOW);
    const players = [
      { unit: player1, coord: new TileCoordinate(8, 8) }, // distance = 12
      { unit: player2, coord: new TileCoordinate(5, 5) }  // distance = 6 (closest)
    ];

    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);
    const enemyCoord = new TileCoordinate(2, 2);

    const result = useCase.execute(enemyUnit, enemyCoord);

    // Should move towards (5, 5). Movement range is 3.
    // From (2, 2) it can move to (2, 5) or (5, 2) etc.
    // As long as manhattan distance from start is 3 and towards the target.
    // (5,5) - (2,2) means 3 steps in X and 3 steps in Y.
    // The total distance covered is 3.
    // The remaining distance to (5,5) should be 3.
    const distToPlayer = Math.abs(result.targetCoordinate.x - 5) + Math.abs(result.targetCoordinate.y - 5);
    expect(distToPlayer).toBe(6);
    expect(result.targetToAttack).toBeNull();
  });

  it('should attack the player immediately if already adjacent', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [
      { unit: player1, coord: new TileCoordinate(2, 3) }
    ];

    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);
    const enemyCoord = new TileCoordinate(2, 2);

    const result = useCase.execute(enemyUnit, enemyCoord);

    // Should not move
    expect(result.targetCoordinate.equals(new TileCoordinate(2, 2))).toBe(true);
    // Should attack player1
    expect(result.targetToAttack).toBe(player1);
  });

  it('should move towards the player and attack if it ends up adjacent', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [
      { unit: player1, coord: new TileCoordinate(4, 2) } // distance = 2
    ];

    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);
    const enemyCoord = new TileCoordinate(2, 2);

    const result = useCase.execute(enemyUnit, enemyCoord);

    // Since movement range is 3, enemy can move to (3, 2), adjacent to (4, 2)
    // Actually, path is (2,2) -> (3,2) -> (4,2).
    // Target coordinate will be (3, 2).
    expect(result.targetCoordinate.equals(new TileCoordinate(3, 2))).toBe(true);
    // Should attack player1
    expect(result.targetToAttack).toBe(player1);
  });

  it('should navigate around simple obstacles to find the player', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [
      { unit: player1, coord: new TileCoordinate(4, 2) }
    ];

    // Obstacle at (3, 2) blocks the direct path
    grid.addObstacle(new TileCoordinate(3, 2));

    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);
    const enemyCoord = new TileCoordinate(2, 2);
    enemyUnit.moveRange = 3;

    const result = useCase.execute(enemyUnit, enemyCoord);

    expect(result.targetCoordinate.equals(new TileCoordinate(4, 1))).toBe(true);
    expect(result.targetToAttack).toBe(player1);
  });

  it('should respect distinct moveRange for different monster archetypes', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [{ unit: player1, coord: new TileCoordinate(6, 2) }];
    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);

    // Slow Iron Golem (Move 1)
    const golem = new Unit('golem-1', 'Iron Golem', 30, 8, 5, WeaponType.AXE);
    golem.detectionRadius = 6;
    golem.moveRange = 1;
    const golemResult = useCase.execute(golem, new TileCoordinate(2, 2));
    expect(golemResult.targetCoordinate.equals(new TileCoordinate(3, 2))).toBe(true);

    // Fast Scout (Move 3)
    const scout = new Unit('scout-1', 'Goblin Scout', 10, 5, 1, WeaponType.SWORD);
    scout.detectionRadius = 6;
    scout.moveRange = 3;
    const scoutResult = useCase.execute(scout, new TileCoordinate(2, 2));
    expect(scoutResult.targetCoordinate.equals(new TileCoordinate(5, 2))).toBe(true);
  });

  it('should allow ranged archers/spearmen to attack from afar if within attackRange', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [{ unit: player1, coord: new TileCoordinate(5, 2) }]; // distance = 3
    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);

    const archer = new Unit('archer-1', 'Goblin Archer', 8, 4, 1, WeaponType.BOW);
    archer.detectionRadius = 5;
    archer.attackRange = 3;

    const result = useCase.execute(archer, new TileCoordinate(2, 2));
    expect(result.targetCoordinate.equals(new TileCoordinate(2, 2))).toBe(true);
    expect(result.targetToAttack).toBe(player1);
  });

  it('should handle explosive Cinder Imp: ignites fuse when adjacent, detonates on subsequent turn', () => {
    const player1 = new Unit('player-1', 'Hero1', 20, 5, 2, WeaponType.SWORD);
    const players = [{ unit: player1, coord: new TileCoordinate(3, 2) }];
    const useCase = new ExecuteEnemyTurnUseCase(grid, pathfinder, players);

    const cinderImp = new Unit('imp-1', 'Cinder Imp', 8, 3, 0, WeaponType.MAGIC);
    cinderImp.isExplosive = true;
    cinderImp.moveRange = 2;
    cinderImp.explosionDamage = 16;
    cinderImp.explosionRadius = 1;

    // Turn 1: Advance to adjacent tile (2, 2) -> ignite fuse
    const turn1 = useCase.execute(cinderImp, new TileCoordinate(1, 2));
    expect(turn1.targetCoordinate.equals(new TileCoordinate(2, 2))).toBe(true);
    expect(turn1.fuseIgnited).toBe(true);
    expect(cinderImp.fuseActive).toBe(true);

    // Turn 2: Primed explosive detonates in 3x3 AoE!
    const turn2 = useCase.execute(cinderImp, new TileCoordinate(2, 2));
    expect(turn2.isExploding).toBe(true);
    expect(turn2.explosionDamage).toBe(16);
    expect(turn2.explosionRadius).toBe(1);
  });
});
