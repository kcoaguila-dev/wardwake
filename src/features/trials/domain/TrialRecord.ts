export interface TrialRecord {
  id: string;
  seed: string;
  score: number;
  floor: number;
  turnsTaken: number;
  monstersSlain: number;
  relicsFound: number;
  goldGathered: number;
  clearTimeMs: number;
  partyComposition: string[]; // e.g. names or classes of units
  date: number;
}
