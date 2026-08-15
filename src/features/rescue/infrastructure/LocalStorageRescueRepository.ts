import { RescueMission } from '../domain/RescueMission';
import { RescueRepository } from '../domain/RescueRepository';

const STORAGE_KEY = 'wardwake_rescue_missions';

export class LocalStorageRescueRepository implements RescueRepository {
  public getAllPendingMissions(): RescueMission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const missions: RescueMission[] = JSON.parse(data);
      return missions.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS');
    } catch {
      return [];
    }
  }

  public getMissionById(id: string): RescueMission | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const missions: RescueMission[] = JSON.parse(data);
      return missions.find(m => m.id === id) || null;
    } catch {
      return null;
    }
  }

  public saveMission(mission: RescueMission): void {
    try {
      const missions = this.loadAll();
      const idx = missions.findIndex(m => m.id === mission.id);
      if (idx >= 0) {
        missions[idx] = mission;
      } else {
        missions.push(mission);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    } catch {}
  }

  public updateMission(mission: RescueMission): void {
    this.saveMission(mission);
  }

  public deleteMission(id: string): void {
    try {
      const missions = this.loadAll().filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    } catch {}
  }

  private loadAll(): RescueMission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
