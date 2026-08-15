import { SaveProfile } from '../domain/SaveProfile';
import { LocalStorageProfileRepository } from '../infrastructure/LocalStorageProfileRepository';
export class SaveProfileUseCase {
  public static execute(profile: SaveProfile): void {
    profile.lastPlayedAt = Date.now();
    LocalStorageProfileRepository.saveProfile(profile);
  }
}
