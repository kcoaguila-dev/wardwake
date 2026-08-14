import { SaveGameRepository } from '../../../src/features/save/infrastructure/SaveGameRepository';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('SaveGameRepository', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    (global as any).localStorage = {
      getItem: jest.fn((key: string) => mockStorage[key] || null),
      setItem: jest.fn((key: string, val: string) => { mockStorage[key] = val; }),
      removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
      clear: jest.fn(() => { mockStorage = {}; }),
    };
  });

  it('Saves and loads run state correctly', () => {
    const hero1 = new Unit('hero_1', 'Sword Fighter', 20, 10, 5, WeaponType.SWORD);
    hero1.currentHp = 15;
    hero1.belly = 80;

    const hero2 = new Unit('hero_2', 'Lance Knight', 22, 9, 7, WeaponType.LANCE);

    SaveGameRepository.save(3, 45, 8, 2, [hero1, hero2], 0, 'TREASURE_VAULT');

    expect(SaveGameRepository.hasSave()).toBe(true);

    const loaded = SaveGameRepository.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.floorNumber).toBe(3);
    expect(loaded!.turnsTaken).toBe(45);
    expect(loaded!.monstersSlain).toBe(8);
    expect(loaded!.relicsFound).toBe(2);
    expect(loaded!.activeModifier).toBe('TREASURE_VAULT');
    expect(loaded!.playerSquad.length).toBe(2);
    expect(loaded!.playerSquad[0]?.currentHp).toBe(15);
    expect(loaded!.playerSquad[0]?.belly).toBe(80);
  });

  it('Clears save state correctly', () => {
    const hero = new Unit('hero_1', 'Hero', 20, 10, 5, WeaponType.SWORD);
    SaveGameRepository.save(1, 10, 1, 0, [hero], 0);

    expect(SaveGameRepository.hasSave()).toBe(true);

    SaveGameRepository.clear();

    expect(SaveGameRepository.hasSave()).toBe(false);
    expect(SaveGameRepository.load()).toBeNull();
  });
});
