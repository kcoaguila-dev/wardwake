export class SeedGenerator {
  private state: number;

  constructor(seed: string | number) {
    if (typeof seed === 'string') {
      this.state = SeedGenerator.hashString(seed);
    } else {
      this.state = seed;
    }
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash >>> 0; // Ensure positive
  }

  public static generateRandomSeedString(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
