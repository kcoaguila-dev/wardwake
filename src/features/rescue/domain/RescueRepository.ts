import { RescueMission } from './RescueMission';

export interface RescueRepository {
  getAllPendingMissions(): RescueMission[];
  getMissionById(id: string): RescueMission | null;
  saveMission(mission: RescueMission): void;
  updateMission(mission: RescueMission): void;
  deleteMission(id: string): void;
}
