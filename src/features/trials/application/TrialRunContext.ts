import { SeedGenerator } from '../domain/SeedGenerator';

export class TrialRunContext {
  private static instance: TrialRunContext;

  private activeSeed: string | null = null;
  private rng: SeedGenerator | null = null;

  private constructor() {}

  public static getInstance(): TrialRunContext {
    if (!TrialRunContext.instance) {
      TrialRunContext.instance = new TrialRunContext();
    }
    return TrialRunContext.instance;
  }

  public startSeededRun(seed: string): void {
    this.activeSeed = seed;
    this.rng = new SeedGenerator(seed);
  }

  public clearRun(): void {
    this.activeSeed = null;
    this.rng = null;
  }

  public isSeededRun(): boolean {
    return this.activeSeed !== null;
  }

  public getActiveSeed(): string | null {
    return this.activeSeed;
  }

  public getRandomNumber(): number {
    if (this.rng) {
      return this.rng.next();
    }
    return Math.random();
  }

  public getRandomInt(min: number, max: number): number {
    if (this.rng) {
      return this.rng.nextInt(min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
