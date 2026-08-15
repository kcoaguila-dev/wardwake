import { RescueMission } from '../domain/RescueMission';
import { RescueRepository } from '../domain/RescueRepository';

export class CreateRescueRequestUseCase {
  constructor(private readonly rescueRepo: RescueRepository) {}

  public execute(floorNumber: number, seed: number, requesterName: string = 'Fallen Explorer'): RescueMission {
    const mission: RescueMission = {
      id: `sos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requesterName,
      floorNumber,
      seed,
      rewardGold: floorNumber * 100,
      status: 'PENDING',
      createdAt: Date.now()
    };
    this.rescueRepo.saveMission(mission);
    return mission;
  }
}
