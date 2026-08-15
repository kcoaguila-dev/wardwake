export class TrialScoreCalculator {
  public static calculate(
    floor: number,
    turnsTaken: number,
    monstersSlain: number,
    gold: number,
    relics: number
  ): number {
    return Math.max(
      0,
      floor * 1000 + monstersSlain * 50 + gold * 2 + relics * 500 - turnsTaken * 5
    );
  }
}
