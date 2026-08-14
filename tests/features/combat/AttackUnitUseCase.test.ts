import { AttackUnitUseCase } from '../../../src/features/combat/application/AttackUnitUseCase';
import { IAudioService } from '../../../src/features/combat/application/ports/IAudioService';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';
import { Item, ItemType } from '../../../src/features/inventory/domain/Item';

describe('AttackUnitUseCase', () => {
  let mockAudioService: jest.Mocked<IAudioService>;
  let useCase: AttackUnitUseCase;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    (global as any).localStorage = {
      getItem: jest.fn((key: string) => mockStorage[key] || null),
      setItem: jest.fn((key: string, val: string) => { mockStorage[key] = val; }),
      removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
      clear: jest.fn(() => { mockStorage = {}; }),
    };

    mockAudioService = {
      isMuted: false,
      toggleMute: jest.fn(),
      playSound: jest.fn(),
    };
    useCase = new AttackUnitUseCase(mockAudioService);
  });

  it('Mock IAudioService and verify playSound is called on attack (sword)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.SWORD);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.AXE);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(mockAudioService.playSound).toHaveBeenCalledWith('sword_slash');
    expect(mockAudioService.playSound).toHaveBeenCalledTimes(1);
  });

  it('Mock IAudioService and verify playSound is called on attack (axe)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.LANCE);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(mockAudioService.playSound).toHaveBeenCalledWith('axe_smash');
    expect(mockAudioService.playSound).toHaveBeenCalledTimes(1);
  });

  it('Mock IAudioService and verify playSound is called on attack (lance)', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.LANCE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.SWORD);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(mockAudioService.playSound).toHaveBeenCalledWith('lance_pierce');
    expect(mockAudioService.playSound).toHaveBeenCalledTimes(1);
  });

  it('Verify playSound is NOT called on missed attack', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.AXE);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.SWORD);

    // Axe vs Sword has 75% accuracy (0.75), so 0.90 is a MISS
    useCase.execute(attacker, defender, 0.90, 0.99);

    expect(mockAudioService.playSound).not.toHaveBeenCalled();
  });

  it('Verify life steal heals attacker when relic has lifeSteal > 0', () => {
    const attacker = new Unit('1', 'Attacker', 30, 10, 5, WeaponType.SWORD);
    attacker.currentHp = 5;
    attacker.equipRelic(new Item('vampire_blade', 'Vampire Blade', ItemType.RELIC_WEAPON, 2, 0, false, 50));
    const defender = new Unit('2', 'Defender', 20, 5, 0, WeaponType.AXE);

    const summary = useCase.execute(attacker, defender, 0.1, 0.99);

    expect(summary.damageDealt).toBeGreaterThan(0);
    expect(summary.lifeStealAmount).toBeGreaterThan(0);
    expect(attacker.currentHp).toBe(5 + summary.lifeStealAmount);
  });

  it('Verify defeated enemy monster is added to localStorage bestiary', () => {
    const attacker = new Unit('player_1', 'Attacker', 10, 20, 5, WeaponType.SWORD);
    const defender = new Unit('enemy_goblin_sword', 'Defender', 5, 5, 0, WeaponType.AXE);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(localStorage.getItem).toHaveBeenCalledWith('wardwake_bestiary');
    expect(localStorage.setItem).toHaveBeenCalledWith('wardwake_bestiary', JSON.stringify(['enemy_goblin_sword']));
  });

  it('Verify defeated player is NOT added to localStorage bestiary', () => {
    const attacker = new Unit('enemy_goblin_sword', 'Attacker', 10, 20, 5, WeaponType.SWORD);
    const defender = new Unit('player_1', 'Defender', 10, 10, 5, WeaponType.AXE);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
