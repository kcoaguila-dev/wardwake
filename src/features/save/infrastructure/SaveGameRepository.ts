import { SaveGameState, SerializedUnit } from '../domain/SaveGameState';
import { Unit } from '../../combat/domain/Unit';

export class SaveGameRepository {
  private static readonly STORAGE_KEY = 'wardwake_run_save';

  public static save(
    floorNumber: number,
    turnsTaken: number,
    monstersSlain: number,
    relicsFound: number,
    players: Unit[],
    selectedPlayerIndex: number,
    activeModifier?: string
  ): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const serializedSquad: SerializedUnit[] = players.map(p => ({
        id: p.id,
        name: p.name,
        maxHp: p.maxHp,
        currentHp: p.currentHp,
        maxSp: p.maxSp,
        currentSp: p.currentSp,
        attack: p.attack,
        defense: p.defense,
        weaponType: p.weaponType,
        exp: p.exp,
        level: p.level,
        belly: p.belly,
        maxBelly: p.maxBelly,
        inventory: p.inventory,
        equippedWeapon: p.equippedWeapon,
        equippedArmor: p.equippedArmor
      }));

      const state: SaveGameState = {
        version: 1,
        floorNumber,
        turnsTaken,
        monstersSlain,
        relicsFound,
        playerSquad: serializedSquad,
        selectedPlayerIndex,
        activeModifier,
        savedAt: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  public static load(): SaveGameState | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveGameState;
    } catch (e) {
      console.warn('Failed to load game state:', e);
      return null;
    }
  }

  public static hasSave(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      return !!localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      return false;
    }
  }

  public static clear(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
}
