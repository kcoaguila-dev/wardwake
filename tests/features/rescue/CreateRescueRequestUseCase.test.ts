import { CreateRescueRequestUseCase } from '../../../src/features/rescue/application/CreateRescueRequestUseCase';
import { RescueRepository } from '../../../src/features/rescue/domain/RescueRepository';
import { RescueMission } from '../../../src/features/rescue/domain/RescueMission';

class MockRescueRepository implements RescueRepository {
  public missions: RescueMission[] = [];
  getAllPendingMissions() { return this.missions; }
  getMissionById(id: string) { return this.missions.find(m => m.id === id) || null; }
  saveMission(mission: RescueMission) { this.missions.push(mission); }
  updateMission(mission: RescueMission) {}
  deleteMission(id: string) {}
}

describe('CreateRescueRequestUseCase', () => {
  it('should create a valid SOS mission scaled to depth and save it', () => {
    const repo = new MockRescueRepository();
    const useCase = new CreateRescueRequestUseCase(repo);

    const result = useCase.execute(4, 999);

    expect(result.id).toContain('sos-');
    expect(result.floorNumber).toBe(4);
    expect(result.seed).toBe(999);
    expect(result.rewardGold).toBe(400); // 4 * 100
    expect(result.status).toBe('PENDING');

    expect(repo.missions.length).toBe(1);
    expect(repo.missions[0]).toEqual(result);
  });
});
