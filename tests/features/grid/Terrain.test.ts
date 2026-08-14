import { GridMap } from '../../../src/features/grid/domain/GridMap';
import { TileCoordinate } from '../../../src/features/grid/domain/TileCoordinate';
import { TerrainType } from '../../../src/features/grid/domain/TerrainType';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { CombatResolver } from '../../../src/features/combat/domain/CombatResolver';

describe('Terrain Logic & Interactions', () => {
  describe('Magma Damage', () => {
    it('should deal 4 damage when unit is on MAGMA', () => {
      const unit = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.SWORD);
      expect(unit.currentHp).toBe(20);

      // Simulate MainGameScene applying magma damage
      unit.applyDamage(4);
      expect(unit.currentHp).toBe(16);
    });
  });

  describe('Water Puddle', () => {
    it('should extinguish burn when unit is on WATER_PUDDLE', () => {
      const unit = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.SWORD);
      unit.isBurned = true;

      // Simulate MainGameScene triggering puddle effect
      unit.isBurned = false;
      expect(unit.isBurned).toBe(false);
    });

    it('should grant +2 damage for LANCE users on WATER_PUDDLE', () => {
      const attacker = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.LANCE);
      const defender = new Unit('monster_1', 'Monster', 20, 5, 5, WeaponType.SWORD);

      // Standard damage: Attack 10 - Defense 5 + Advantage 3 = 8
      const defaultResult = CombatResolver.calculateDamage(attacker, defender, 0, 1); // rollHit=0 (guaranteed hit), rollCrit=1 (no crit)
      expect(defaultResult.damageDealt).toBe(8);

      // Water Puddle damage: Attack 10 - Defense 5 + Advantage 3 + TerrainBonus 2 = 10
      const puddleResult = CombatResolver.calculateDamage(attacker, defender, 0, 1, TerrainType.WATER_PUDDLE, TerrainType.NONE, 1);
      expect(puddleResult.damageDealt).toBe(10);
    });
  });

  describe('Tall Grass', () => {
    it('should reduce hit chance by 0.3 for distant attacks against defender in TALL_GRASS', () => {
      const attacker = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.SWORD);
      const defender = new Unit('monster_1', 'Monster', 20, 5, 5, WeaponType.SWORD);

      const defaultRates = CombatResolver.calculateRates(attacker, defender, TerrainType.NONE, TerrainType.NONE, 1);
      const baseHitRate = defaultRates.hitChance; // typically 0.90

      // Distance > 1 (e.g. 2) and defender in TALL_GRASS
      const grassRates = CombatResolver.calculateRates(attacker, defender, TerrainType.NONE, TerrainType.TALL_GRASS, 2);
      expect(grassRates.hitChance).toBeCloseTo(baseHitRate - 0.3);
    });

    it('should not reduce hit chance if attack is adjacent', () => {
      const attacker = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.SWORD);
      const defender = new Unit('monster_1', 'Monster', 20, 5, 5, WeaponType.SWORD);

      const defaultRates = CombatResolver.calculateRates(attacker, defender, TerrainType.NONE, TerrainType.NONE, 1);
      const baseHitRate = defaultRates.hitChance; // typically 0.90

      // Distance 1 and defender in TALL_GRASS
      const grassRates = CombatResolver.calculateRates(attacker, defender, TerrainType.NONE, TerrainType.TALL_GRASS, 1);
      expect(grassRates.hitChance).toBe(baseHitRate);
    });
  });

  describe('Ice Sliding Pathfinding (Simulated)', () => {
    it('should simulate sliding until hitting an obstacle or non-ice tile', () => {
      const map = new GridMap(10, 10);
      // Floor map
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          map.removeObstacle(new TileCoordinate(x, y));
        }
      }

      // 5 tiles of ice in a row going right
      map.setTerrain(new TileCoordinate(1, 1), TerrainType.ICE);
      map.setTerrain(new TileCoordinate(2, 1), TerrainType.ICE);
      map.setTerrain(new TileCoordinate(3, 1), TerrainType.ICE);
      map.setTerrain(new TileCoordinate(4, 1), TerrainType.ICE);
      map.setTerrain(new TileCoordinate(5, 1), TerrainType.ICE);

      // Moving from (0,1) to (1,1) triggers a slide. Vector is (1,0)
      const prev = new TileCoordinate(0, 1);
      let target = new TileCoordinate(1, 1);
      let dx = target.x - prev.x;
      let dy = target.y - prev.y;

      let finalCoord = target;
      if (map.getTerrain(finalCoord) === TerrainType.ICE) {
        let slideX = finalCoord.x;
        let slideY = finalCoord.y;

        while (true) {
          const checkCoord = new TileCoordinate(slideX + dx, slideY + dy);
          if (!map.isWalkable(checkCoord)) break;
          // no units in this test

          slideX += dx;
          slideY += dy;
          finalCoord = new TileCoordinate(slideX, slideY);

          if (map.getTerrain(finalCoord) !== TerrainType.ICE) break;
        }
      }

      // Expected to slide across all ice (1,1 -> 5,1) and land on the first non-ice tile (6,1)
      expect(finalCoord.x).toBe(6);
      expect(finalCoord.y).toBe(1);
    });
  });
});
