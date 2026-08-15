import { MonsterRepository } from '../../src/features/combat/domain/MonsterRepository';
import { ItemRepository } from '../../src/features/inventory/domain/ItemRepository';
import { EnemyFactory } from '../../src/features/combat/domain/EnemyFactory';
import { WeaponType } from '../../src/features/combat/domain/WeaponType';
import { ItemType } from '../../src/features/inventory/domain/Item';

describe('Data-Driven Repositories & Schemas', () => {
  describe('MonsterRepository', () => {
    test('loads all monster blueprints correctly from JSON', () => {
      const monsters = MonsterRepository.getAll();
      expect(monsters.length).toBeGreaterThanOrEqual(9);

      const goblin = MonsterRepository.getById('enemy_goblin_sword');
      expect(goblin).toBeDefined();
      expect(goblin?.name).toBe('Goblin Scout');
      expect(goblin?.floorTier).toBe(1);
      expect(goblin?.weaponType).toBe('SWORD');
    });

    test('retrieves monsters by tier properly', () => {
      const tier1 = MonsterRepository.getByTier(1);
      expect(tier1.length).toBe(4);

      const tier2 = MonsterRepository.getByTier(2);
      expect(tier2.length).toBe(4);

      const tier3 = MonsterRepository.getByTier(3);
      expect(tier3.length).toBe(3);
    });

    test('creates Unit instance with proper stat scaling', () => {
      const blueprint = MonsterRepository.getById('enemy_goblin_sword')!;
      const unit = MonsterRepository.createUnitFromBlueprint(blueprint, 'test_goblin', 3);

      expect(unit.id).toBe('test_goblin');
      expect(unit.name).toBe('Goblin Scout');
      expect(unit.weaponType).toBe(WeaponType.SWORD);
      expect(unit.maxHp).toBe(blueprint.baseHp + 3);
      expect(unit.attack).toBe(blueprint.baseAttack);
      expect(unit.defense).toBe(blueprint.baseDefense);
    });
  });

  describe('ItemRepository', () => {
    test('loads all item blueprints correctly from JSON', () => {
      const items = ItemRepository.getAll();
      expect(items.length).toBeGreaterThanOrEqual(5);

      const vulnerary = ItemRepository.getById('vulnerary');
      expect(vulnerary).toBeDefined();
      expect(vulnerary?.name).toBe('Vulnerary');
      expect(vulnerary?.value).toBe(10);
    });

    test('getRandomLootItem returns valid Item instances', () => {
      for (let i = 0; i < 20; i++) {
        const item = ItemRepository.getRandomLootItem();
        expect(item).toBeDefined();
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.value).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('EnemyFactory integration with MonsterRepository', () => {
    test('creates properly tiered and scaled enemies for floor 1', () => {
      const enemy = EnemyFactory.createEnemy(1, 0);
      expect(enemy.name).toBe('Goblin Scout');
      expect(enemy.weaponType).toBe(WeaponType.SWORD);
    });

    test('creates properly tiered and scaled enemies for floor 4', () => {
      const enemy = EnemyFactory.createEnemy(4, 0);
      expect(enemy.name).toBe('Hobgoblin Raider');
      expect(enemy.weaponType).toBe(WeaponType.SWORD);
    });

    test('creates properly tiered and scaled enemies for floor 8', () => {
      const enemy = EnemyFactory.createEnemy(8, 0);
      expect(enemy.name).toBe('Dread Knight');
      expect(enemy.weaponType).toBe(WeaponType.SWORD);
    });
  });
});
