/** @jest-environment jsdom */
import { SeedGenerator } from '../../../src/features/trials/domain/SeedGenerator';

describe('SeedGenerator', () => {
  it('should generate identical sequences for the same seed string', () => {
    const seed = 'TEST_SEED_123';
    const gen1 = new SeedGenerator(seed);
    const gen2 = new SeedGenerator(seed);

    for (let i = 0; i < 100; i++) {
      expect(gen1.next()).toBe(gen2.next());
    }
  });

  it('should generate identical int sequences for the same seed number', () => {
    const seed = 42;
    const gen1 = new SeedGenerator(seed);
    const gen2 = new SeedGenerator(seed);

    for (let i = 0; i < 100; i++) {
      expect(gen1.nextInt(1, 10)).toBe(gen2.nextInt(1, 10));
    }
  });

  it('should generate different sequences for different seeds', () => {
    const gen1 = new SeedGenerator('A');
    const gen2 = new SeedGenerator('B');

    const seq1 = Array.from({ length: 10 }, () => gen1.next());
    const seq2 = Array.from({ length: 10 }, () => gen2.next());

    expect(seq1).not.toEqual(seq2);
  });
});
