import { AttackUnitUseCase } from '../../../src/features/combat/application/AttackUnitUseCase';
import { IAudioService } from '../../../src/features/combat/application/ports/IAudioService';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('AttackUnitUseCase', () => {
  let mockAudioService: jest.Mocked<IAudioService>;
  let useCase: AttackUnitUseCase;

  beforeEach(() => {
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

  it('Verify defender HP decreases correctly after execute()', () => {
    const attacker = new Unit('1', 'Attacker', 10, 10, 5, WeaponType.BOW);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.MAGIC);

    expect(defender.currentHp).toBe(10);

    useCase.execute(attacker, defender, 0.1, 0.99);

    expect(defender.currentHp).toBe(5);
  });

  it('Verify isFatal returns true when defender HP reaches 0', () => {
    const attacker = new Unit('1', 'Attacker', 10, 20, 5, WeaponType.SWORD);
    const defender = new Unit('2', 'Defender', 10, 10, 5, WeaponType.AXE);

    // Damage = max(1, (20 + 3) - 5) = 18. Defender has 10 HP. Should be fatal.
    const summary = useCase.execute(attacker, defender, 0.1, 0.99);

    expect(summary.isFatal).toBe(true);
    expect(defender.currentHp).toBe(0);
  });
});
