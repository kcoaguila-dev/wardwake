import { DataRegistry } from '../../src/core/domain/DataRegistry';
import { GameDatabase } from '../../src/core/domain/GameDatabase';
import { WeaponType } from '../../src/features/combat/domain/WeaponType';

describe('Generic DataRegistry & GameDatabase', () => {
  describe('DataRegistry<T>', () => {
    interface TestItem {
      id: string;
      name: string;
      value: number;
    }

    test('registers and retrieves items correctly', () => {
      const registry = new DataRegistry<TestItem>();
      registry.register({ id: 'item_1', name: 'Potion', value: 10 });
      registry.register({ id: 'item_2', name: 'Mega Potion', value: 50 });

      expect(registry.count()).toBe(2);
      expect(registry.get('item_1')?.name).toBe('Potion');
      expect(registry.getOrThrow('item_2').value).toBe(50);
    });

    test('throws when getOrThrow is called for non-existent item', () => {
      const registry = new DataRegistry<TestItem>();
      expect(() => registry.getOrThrow('invalid_id')).toThrow("Entity with ID 'invalid_id' not found in registry.");
    });

    test('queries items by custom predicate filter', () => {
      const registry = new DataRegistry<TestItem>([
        { id: '1', name: 'Bronze', value: 10 },
        { id: '2', name: 'Silver', value: 50 },
        { id: '3', name: 'Gold', value: 100 },
      ]);

      const valuable = registry.query(i => i.value >= 50);
      expect(valuable.length).toBe(2);
      expect(valuable.map(i => i.name)).toEqual(['Silver', 'Gold']);
    });
  });

  describe('GameDatabase', () => {
    test('initializes all core game registries from JSON blueprints', () => {
      expect(GameDatabase.monsters.count()).toBeGreaterThanOrEqual(9);
      expect(GameDatabase.items.count()).toBeGreaterThanOrEqual(3);
      expect(GameDatabase.heroes.count()).toBeGreaterThanOrEqual(2);
      expect(GameDatabase.combatRules.weaponTriangleAdvantageBonus).toBe(3);
      expect(GameDatabase.combatRules.weaponTriangleDisadvantagePenalty).toBe(3);
    });

    test('creates Hero Unit from blueprint correctly', () => {
      const hero = GameDatabase.createHeroUnit('hero_sword_fighter', 'player_1');
      expect(hero.id).toBe('player_1');
      expect(hero.name).toBe('Sword Fighter');
      expect(hero.maxHp).toBe(20);
      expect(hero.attack).toBe(5);
      expect(hero.defense).toBe(2);
      expect(hero.weaponType).toBe(WeaponType.SWORD);
    });
  });
});
