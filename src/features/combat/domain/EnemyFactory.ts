import { Unit } from './Unit';
import { WeaponType } from './WeaponType';

export class EnemyFactory {
  /**
   * Generates a tiered enemy count based on the current floor.
   * Tier 1 (Floors 1-3): 2-3 enemies
   * Tier 2 (Floors 4-6): 3-4 enemies
   * Tier 3 (Floors 7+): 4-5 enemies
   */
  public static getEnemyCountForFloor(floorNumber: number): number {
    if (floorNumber <= 3) {
      // Tier 1
      return Math.floor(Math.random() * 2) + 2; // 2 to 3
    } else if (floorNumber <= 6) {
      // Tier 2
      return Math.floor(Math.random() * 2) + 3; // 3 to 4
    } else {
      // Tier 3
      return Math.floor(Math.random() * 2) + 4; // 4 to 5
    }
  }

  /**
   * Creates an enemy Unit scaled by the current floor tier.
   */
  public static createEnemy(floorNumber: number, index: number): Unit {
    const id = `e${index + 1}`;

    // Use index to cycle through the 3 enemy types per tier
    const typeIndex = index % 3;

    if (floorNumber <= 3) {
      // Tier 1: Floors 1-3
      if (typeIndex === 0) {
        return new Unit(id, 'Goblin Scout', 8 + (floorNumber * 1), 3, 0, WeaponType.SWORD);
      } else if (typeIndex === 1) {
        return new Unit(id, 'Forest Brigand', 10 + (floorNumber * 1), 4, 0, WeaponType.AXE);
      } else {
        return new Unit(id, 'Bandit Trainee', 9 + (floorNumber * 1), 3, 1, WeaponType.LANCE);
      }
    } else if (floorNumber <= 6) {
      // Tier 2: Floors 4-6
      if (typeIndex === 0) {
        return new Unit(id, 'Armored Guard', 16 + (floorNumber * 2), 6, 2, WeaponType.AXE);
      } else if (typeIndex === 1) {
        return new Unit(id, 'Iron Knight', 18 + (floorNumber * 2), 6, 3, WeaponType.LANCE);
      } else {
        return new Unit(id, 'Mercenary Blade', 15 + (floorNumber * 2), 7, 1, WeaponType.SWORD);
      }
    } else {
      // Tier 3: Floors 7+
      if (typeIndex === 0) {
        return new Unit(id, 'Dread Champion', 26 + (floorNumber * 2), 9, 3, WeaponType.SWORD);
      } else if (typeIndex === 1) {
        return new Unit(id, 'Warlord Vanguard', 32 + (floorNumber * 2), 10, 4, WeaponType.AXE);
      } else {
        return new Unit(id, 'Shadow Halberdier', 28 + (floorNumber * 2), 9, 4, WeaponType.LANCE);
      }
    }
  }
}
