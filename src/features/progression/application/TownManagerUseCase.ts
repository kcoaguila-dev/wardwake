import { TownData, TownUpgrades } from '../domain/TownData';

export class TownManagerUseCase {
  public static readonly MAX_STORAGE = 10;

  public static readonly UPGRADE_COSTS = {
    maxHp: 100, // Cost for +10 Max HP
    maxBelly: 50, // Cost for +20 Max Belly
    attack: 150 // Cost for +1 ATK
  };

  public static readonly UPGRADE_VALUES = {
    maxHp: 10,
    maxBelly: 20,
    attack: 1
  };

  constructor(private data: TownData) {}

  public getTownData(): TownData {
    return this.data;
  }

  public addGold(amount: number): void {
    if (amount > 0) {
      this.data.gold += amount;
    }
  }

  public buyUpgrade(type: keyof TownUpgrades): boolean {
    const cost = TownManagerUseCase.UPGRADE_COSTS[type];
    if (this.data.gold >= cost) {
      this.data.gold -= cost;
      this.data.upgrades[type] += TownManagerUseCase.UPGRADE_VALUES[type];
      return true;
    }
    return false;
  }

  public storeItem(itemId: string): boolean {
    if (this.data.storedItems.length < TownManagerUseCase.MAX_STORAGE) {
      this.data.storedItems.push(itemId);
      return true;
    }
    return false;
  }

  public withdrawItem(itemId: string): boolean {
    const index = this.data.storedItems.indexOf(itemId);
    if (index !== -1) {
      this.data.storedItems.splice(index, 1);
      return true;
    }
    return false;
  }
}
