import { CompleteRescueUseCase } from '../../../src/features/rescue/application/CompleteRescueUseCase';
import { RescueRepository } from '../../../src/features/rescue/domain/RescueRepository';
import { RescueMission } from '../../../src/features/rescue/domain/RescueMission';
import { TownManagerUseCase } from '../../../src/features/progression/application/TownManagerUseCase';
import { TownData } from '../../../src/features/progression/domain/TownData';

class MockRescueRepository implements RescueRepository {
  public missions: RescueMission[] = [];
  getAllPendingMissions() { return this.missions; }
  getMissionById(id: string) { return this.missions.find(m => m.id === id) || null; }
  saveMission(mission: RescueMission) { this.missions.push(mission); }
  updateMission(mission: RescueMission) {}
  deleteMission(id: string) {}
}

describe('CompleteRescueUseCase', () => {
  it('should mark mission rescued and award town gold', () => {
    const repo = new MockRescueRepository();
    const initialTownData: TownData = { gold: 100, storage: [], unlockedClasses: [], compendium: [] };
    const townManager = new TownManagerUseCase(initialTownData);
    const useCase = new CompleteRescueUseCase(repo, townManager);

    const mission: RescueMission = {
      id: 'm1',
      requesterName: 'Bob',
      floorNumber: 3,
      seed: 111,
      rewardGold: 300,
      status: 'IN_PROGRESS',
      createdAt: 0
    };
    repo.saveMission(mission);

    const success = useCase.execute('m1');

    expect(success).toBe(true);
    expect(mission.status).toBe('RESCUED');
    expect(townManager.getTownData().gold).toBe(400); // 100 + 300
  });

  it('should gracefully handle object execution', () => {
     const repo = new MockRescueRepository();
     const initialTownData: TownData = { gold: 100, storage: [], unlockedClasses: [], compendium: [] };
     const townManager = new TownManagerUseCase(initialTownData);
     const useCase = new CompleteRescueUseCase(repo, townManager);

     const mission: RescueMission = {
       id: 'm2',
       requesterName: 'Alice',
       floorNumber: 5,
       seed: 222,
       rewardGold: 500,
       status: 'IN_PROGRESS',
       createdAt: 0
     };

     useCase.executeWithMissionObj(mission);

     expect(mission.status).toBe('RESCUED');
     expect(townManager.getTownData().gold).toBe(600);
  });
});
