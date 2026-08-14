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

      const goblin = MonsterRepository.getById('goblin_scout');
      expect(goblin).toBeDefined();
      expect(goblin?.name).toBe('Goblin Scout');
      expect(goblin?.tier).toBe(1);
      expect(goblin?.weaponType).toBe('SWORD');
    });

    test('retrieves monsters by tier properly', () => {
      const tier1 = MonsterRepository.getByTier(1);
      expect(tier1.length).toBe(3);
      tier1.forEach(m => expect(m.tier).toBe(1));

      const tier2 = MonsterRepository.getByTier(2);
      expect(tier2.length).toBe(3);
      tier2.forEach(m => expect(m.tier).toBe(2));

      const tier3 = MonsterRepository.getByTier(3);
      expect(tier3.length).toBe(3);
      tier3.forEach(m => expect(m.tier).toBe(3));
    });

    test('creates Unit instance with proper stat scaling', () => {
      const blueprint = MonsterRepository.getById('goblin_scout')!;
      const unit = MonsterRepository.createUnitFromBlueprint(blueprint, 'test_goblin', 3);

      expect(unit.id).toBe('test_goblin');
      expect(unit.name).toBe('Goblin Scout');
      expect(unit.weaponType).toBe(WeaponType.SWORD);
      expect(unit.maxHp).toBe(blueprint.baseHp + 3); // 8 + 3 = 11
      expect(unit.attack).toBe(blueprint.baseAttack);
      expect(unit.defense).toBe(blueprint.baseDefense);
    });
  });

  describe('ItemRepository', () => {
    test('loads all item blueprints correctly from JSON', () => {
      const items = ItemRepository.getAll();
      expect(items.length).toBeGreaterThanOrEqual(3);

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
        expect([ItemType.HEAL, ItemType.ATTACK_BUFF]).toContain(item.type);
        expect(item.value).toBeGreaterThan(0);
      }
    });
  });

  describe('EnemyFactory integration with MonsterRepository', () => {
    test('creates properly tiered and scaled enemies for floor 1', () => {
      const enemy = EnemyFactory.createEnemy(1, 0);
      expect(enemy.name).toBe('Goblin Scout');
      expect(enemy.weaponType).toBe(WeaponType.SWORD);
    });

    test('creates properly tiered and scaled enemies for floor 5', () => {
      const enemy = EnemyFactory.createEnemy(5, 0);
      expect(enemy.name).toBe('Armored Guard');
      expect(enemy.weaponType).toBe(WeaponType.AXE);
    });

    test('creates properly tiered and scaled enemies for floor 8', () => {
      const enemy = EnemyFactory.createEnemy(8, 0);
      expect(enemy.name).toBe('Dread Champion');
      expect(enemy.weaponType).toBe(WeaponType.SWORD);
    });
  });
});
