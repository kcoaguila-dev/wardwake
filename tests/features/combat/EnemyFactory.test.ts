import { EnemyFactory } from '../../../src/features/combat/domain/EnemyFactory';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('EnemyFactory', () => {
  describe('getEnemyCountForFloor', () => {
    it('returns a count between 2 and 3 for Floor 1 (Tier 1)', () => {
      const count = EnemyFactory.getEnemyCountForFloor(1);
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(3);
    });

    it('returns a count between 3 and 4 for Floor 4 (Tier 2)', () => {
      const count = EnemyFactory.getEnemyCountForFloor(4);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(4);
    });

    it('returns a count between 4 and 5 for Floor 8 (Tier 3)', () => {
      const count = EnemyFactory.getEnemyCountForFloor(8);
      expect(count).toBeGreaterThanOrEqual(4);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('returns 1 for Boss Floors 5 and 10', () => {
      expect(EnemyFactory.getEnemyCountForFloor(5)).toBe(1);
      expect(EnemyFactory.getEnemyCountForFloor(10)).toBe(1);
    });
  });

  describe('createEnemy', () => {
    describe('Tier 1 (Floors 1-3)', () => {
      it('creates Goblin Scout for index 0 on Floor 1', () => {
        const enemy = EnemyFactory.createEnemy(1, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Goblin Scout');
        expect(enemy.maxHp).toBe(10 + 1);
        expect(enemy.attack).toBe(5);
        expect(enemy.defense).toBe(1);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });

      it('creates Orc Cleaver for index 1 on Floor 2', () => {
        const enemy = EnemyFactory.createEnemy(2, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Orc Cleaver');
        expect(enemy.maxHp).toBe(12 + 2);
        expect(enemy.attack).toBe(6);
        expect(enemy.defense).toBe(2);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });

      it('creates Skeleton Spearman for index 2 on Floor 3', () => {
        const enemy = EnemyFactory.createEnemy(3, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Skeleton Spearman');
        expect(enemy.maxHp).toBe(10 + 3);
        expect(enemy.attack).toBe(5);
        expect(enemy.defense).toBe(1);
        expect(enemy.weaponType).toBe(WeaponType.LANCE);
      });
    });

    describe('Tier 2 (Floors 4-6)', () => {
      it('creates Hobgoblin Raider for index 0 on Floor 4', () => {
        const enemy = EnemyFactory.createEnemy(4, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Hobgoblin Raider');
        expect(enemy.maxHp).toBe(18 + (4 * 2));
        expect(enemy.attack).toBe(8);
        expect(enemy.defense).toBe(3);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });

      it('creates Dark Cultist for index 1 on Floor 5', () => {
        const enemy = EnemyFactory.createEnemy(5, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Dark Cultist');
        expect(enemy.maxHp).toBe(12 + (5 * 2));
        expect(enemy.attack).toBe(7);
        expect(enemy.defense).toBe(1);
        expect(enemy.weaponType).toBe(WeaponType.MAGIC);
      });

      it('creates Orc Berserker for index 2 on Floor 6', () => {
        const enemy = EnemyFactory.createEnemy(6, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Orc Berserker');
        expect(enemy.maxHp).toBe(22 + (6 * 2));
        expect(enemy.attack).toBe(10);
        expect(enemy.defense).toBe(3);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });
    });

    describe('Tier 3 (Floors 7+)', () => {
      it('creates Dread Knight for index 0 on Floor 7', () => {
        const enemy = EnemyFactory.createEnemy(7, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Dread Knight');
        expect(enemy.maxHp).toBe(28 + (7 * 2));
        expect(enemy.attack).toBe(12);
        expect(enemy.defense).toBe(5);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });

      it('creates Iron Golem for index 1 on Floor 8', () => {
        const enemy = EnemyFactory.createEnemy(8, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Iron Golem');
        expect(enemy.maxHp).toBe(35 + (8 * 2));
        expect(enemy.attack).toBe(14);
        expect(enemy.defense).toBe(7);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });

      it('creates Phantom Halberdier for index 2 on Floor 10', () => {
        const enemy = EnemyFactory.createEnemy(10, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Phantom Halberdier');
        expect(enemy.maxHp).toBe(26 + (10 * 2));
        expect(enemy.attack).toBe(13);
        expect(enemy.defense).toBe(4);
        expect(enemy.weaponType).toBe(WeaponType.LANCE);
      });
    });
  });
});
