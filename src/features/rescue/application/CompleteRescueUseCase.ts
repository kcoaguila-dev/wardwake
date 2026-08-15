import { RescueMission } from '../domain/RescueMission';
import { RescueRepository } from '../domain/RescueRepository';
import { TownManagerUseCase } from '../../progression/application/TownManagerUseCase';

export class CompleteRescueUseCase {
  constructor(
    private readonly rescueRepo: RescueRepository,
    private readonly townManager: TownManagerUseCase
  ) {}

  public execute(missionId: string): boolean {
    const mission = this.rescueRepo.getMissionById(missionId);
    if (!mission) return false;
    return this.executeWithMissionObj(mission);
  }

  public executeWithMissionObj(mission: RescueMission): boolean {
    mission.status = 'RESCUED';
    this.rescueRepo.updateMission(mission);
    this.townManager.addGold(mission.rewardGold);
    return true;
  }
}
