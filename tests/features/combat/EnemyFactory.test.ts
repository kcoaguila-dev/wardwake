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
  });

  describe('createEnemy', () => {
    describe('Tier 1 (Floors 1-3)', () => {
      it('creates Goblin Scout for index 0 on Floor 1', () => {
        const enemy = EnemyFactory.createEnemy(1, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Goblin Scout');
        expect(enemy.maxHp).toBe(8 + 1);
        expect(enemy.attack).toBe(3);
        expect(enemy.defense).toBe(0);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });

      it('creates Forest Brigand for index 1 on Floor 2', () => {
        const enemy = EnemyFactory.createEnemy(2, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Forest Brigand');
        expect(enemy.maxHp).toBe(10 + 2);
        expect(enemy.attack).toBe(4);
        expect(enemy.defense).toBe(0);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });

      it('creates Bandit Trainee for index 2 on Floor 3', () => {
        const enemy = EnemyFactory.createEnemy(3, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Bandit Trainee');
        expect(enemy.maxHp).toBe(9 + 3);
        expect(enemy.attack).toBe(3);
        expect(enemy.defense).toBe(1);
        expect(enemy.weaponType).toBe(WeaponType.LANCE);
      });
    });

    describe('Tier 2 (Floors 4-6)', () => {
      it('creates Armored Guard for index 0 on Floor 4', () => {
        const enemy = EnemyFactory.createEnemy(4, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Armored Guard');
        expect(enemy.maxHp).toBe(16 + (4 * 2));
        expect(enemy.attack).toBe(6);
        expect(enemy.defense).toBe(2);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });

      it('creates Iron Knight for index 1 on Floor 5', () => {
        const enemy = EnemyFactory.createEnemy(5, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Iron Knight');
        expect(enemy.maxHp).toBe(18 + (5 * 2));
        expect(enemy.attack).toBe(6);
        expect(enemy.defense).toBe(3);
        expect(enemy.weaponType).toBe(WeaponType.LANCE);
      });

      it('creates Mercenary Blade for index 2 on Floor 6', () => {
        const enemy = EnemyFactory.createEnemy(6, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Mercenary Blade');
        expect(enemy.maxHp).toBe(15 + (6 * 2));
        expect(enemy.attack).toBe(7);
        expect(enemy.defense).toBe(1);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });
    });

    describe('Tier 3 (Floors 7+)', () => {
      it('creates Dread Champion for index 0 on Floor 7', () => {
        const enemy = EnemyFactory.createEnemy(7, 0);
        expect(enemy.id).toBe('e1');
        expect(enemy.name).toBe('Dread Champion');
        expect(enemy.maxHp).toBe(26 + (7 * 2));
        expect(enemy.attack).toBe(9);
        expect(enemy.defense).toBe(3);
        expect(enemy.weaponType).toBe(WeaponType.SWORD);
      });

      it('creates Warlord Vanguard for index 1 on Floor 8', () => {
        const enemy = EnemyFactory.createEnemy(8, 1);
        expect(enemy.id).toBe('e2');
        expect(enemy.name).toBe('Warlord Vanguard');
        expect(enemy.maxHp).toBe(32 + (8 * 2));
        expect(enemy.attack).toBe(10);
        expect(enemy.defense).toBe(4);
        expect(enemy.weaponType).toBe(WeaponType.AXE);
      });

      it('creates Shadow Halberdier for index 2 on Floor 10', () => {
        const enemy = EnemyFactory.createEnemy(10, 2);
        expect(enemy.id).toBe('e3');
        expect(enemy.name).toBe('Shadow Halberdier');
        expect(enemy.maxHp).toBe(28 + (10 * 2));
        expect(enemy.attack).toBe(9);
        expect(enemy.defense).toBe(4);
        expect(enemy.weaponType).toBe(WeaponType.LANCE);
      });
    });
  });
});
