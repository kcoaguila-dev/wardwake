import { TrialRecord } from '../domain/TrialRecord';

export class TrialRecordRepository {
  private static readonly STORAGE_KEY = 'wardwake_trial_records';

  public static save(record: TrialRecord): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const records = this.getAll();
      records.push(record);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save trial record:', e);
    }
  }

  public static getAll(): TrialRecord[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as TrialRecord[];
    } catch (e) {
      console.warn('Failed to load trial records:', e);
      return [];
    }
  }

  public static getTopRecords(limit: number = 10): TrialRecord[] {
    return this.getAll().sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
