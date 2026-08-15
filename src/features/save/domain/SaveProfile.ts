import { TownData } from '../../progression/domain/TownData';
import { BestiaryProgress } from '../../progression/domain/BestiaryProgress';
import { LifetimeStats } from '../../progression/domain/LifetimeStats';
import { SaveGameState } from './SaveGameState';

export type SaveSlotId = 'slot_1' | 'slot_2' | 'slot_3';

export interface SaveProfile {
  schemaVersion: number;
  profileId: SaveSlotId;
  lastPlayedAt: number;
  townData: TownData;
  activeRun: SaveGameState | null;
  compendium: BestiaryProgress;
  statistics: LifetimeStats;
}
