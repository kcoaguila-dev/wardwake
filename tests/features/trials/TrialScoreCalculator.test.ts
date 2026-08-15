import { TrialScoreCalculator } from '../../../src/features/trials/domain/TrialScoreCalculator';

describe('TrialScoreCalculator', () => {
  it('should calculate the score correctly', () => {
    // Score = (Floor * 1000) + (MonstersSlain * 50) + (Gold * 2) + (Relics * 500) - (TurnsTaken * 5)
    // Floor = 10 (10000)
    // TurnsTaken = 100 (-500)
    // MonstersSlain = 20 (1000)
    // Gold = 50 (100)
    // Relics = 2 (1000)
    // Expected: 10000 - 500 + 1000 + 100 + 1000 = 11600

    const score = TrialScoreCalculator.calculate(10, 100, 20, 50, 2);
    expect(score).toBe(11600);
  });

  it('should never return a negative score', () => {
    const score = TrialScoreCalculator.calculate(1, 1000, 0, 0, 0); // 1000 - 5000 = -4000
    expect(score).toBe(0);
  });
});
