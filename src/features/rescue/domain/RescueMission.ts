export type RescueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESCUED' | 'EXPIRED';

export interface RescueMission {
  id: string;
  requesterName: string;
  floorNumber: number;
  seed: number;
  rewardGold: number;
  status: RescueStatus;
  createdAt: number;
}
