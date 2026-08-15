import { SaveProfile, SaveSlotId } from '../domain/SaveProfile';

export class LocalStorageProfileRepository {
  private static getKey(slotId: SaveSlotId): string {
    return `wardwake_profile_${slotId}`;
  }
  public static getActiveSlotId(): SaveSlotId {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('wardwake_active_slot');
      if (stored === 'slot_1' || stored === 'slot_2' || stored === 'slot_3') return stored as SaveSlotId;
    }
    return 'slot_1';
  }
  public static setActiveSlotId(slotId: SaveSlotId): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem('wardwake_active_slot', slotId);
  }
  public static saveProfile(profile: SaveProfile): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(this.getKey(profile.profileId), JSON.stringify(profile)); } catch (e) { }
  }
  public static loadProfile(slotId: SaveSlotId): SaveProfile | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.getKey(slotId));
      if (!raw) return null;
      return JSON.parse(raw) as SaveProfile;
    } catch (e) { return null; }
  }
  public static deleteProfile(slotId: SaveSlotId): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.removeItem(this.getKey(slotId)); } catch (e) { }
  }
}
