export interface TownUpgrades {
  maxHp: number;
  maxBelly: number;
  attack: number;
}

export interface TownData {
  gold: number;
  upgrades: TownUpgrades;
  storedItems: string[];
}

export const INITIAL_TOWN_DATA: TownData = {
  gold: 0,
  upgrades: {
    maxHp: 0,
    maxBelly: 0,
    attack: 0
  },
  storedItems: []
};
