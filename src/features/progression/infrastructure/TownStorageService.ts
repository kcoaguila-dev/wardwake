import { TownData, INITIAL_TOWN_DATA } from '../domain/TownData';

export class TownStorageService {
  private static readonly STORAGE_KEY = 'wardwake_town_meta';

  public static load(): TownData {
    try {
      const dataStr = localStorage.getItem(this.STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr) as TownData;
        return {
          gold: typeof parsed.gold === 'number' ? parsed.gold : INITIAL_TOWN_DATA.gold,
          upgrades: {
            maxHp: typeof parsed.upgrades?.maxHp === 'number' ? parsed.upgrades.maxHp : INITIAL_TOWN_DATA.upgrades.maxHp,
            maxBelly: typeof parsed.upgrades?.maxBelly === 'number' ? parsed.upgrades.maxBelly : INITIAL_TOWN_DATA.upgrades.maxBelly,
            attack: typeof parsed.upgrades?.attack === 'number' ? parsed.upgrades.attack : INITIAL_TOWN_DATA.upgrades.attack,
          },
          storedItems: Array.isArray(parsed.storedItems) ? parsed.storedItems : INITIAL_TOWN_DATA.storedItems,
        };
      }
    } catch (e) {
      console.error('Failed to load town meta-progression:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TOWN_DATA));
  }

  public static save(data: TownData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save town meta-progression:', e);
    }
  }

  public static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear town meta-progression:', e);
    }
  }
}
