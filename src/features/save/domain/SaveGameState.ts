import { WeaponType } from '../../combat/domain/WeaponType';
import { Item } from '../../inventory/domain/Item';

export interface SerializedUnit {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  maxSp: number;
  currentSp: number;
  attack: number;
  defense: number;
  weaponType: WeaponType;
  exp: number;
  level: number;
  belly: number;
  maxBelly: number;
  inventory: Item[];
  equippedWeapon?: Item | undefined;
  equippedArmor?: Item | undefined;
}

export interface SaveGameState {
  version: number;
  floorNumber: number;
  turnsTaken: number;
  monstersSlain: number;
  relicsFound: number;
  playerSquad: SerializedUnit[];
  selectedPlayerIndex: number;
  activeModifier?: string | undefined;
  savedAt: number;
}
