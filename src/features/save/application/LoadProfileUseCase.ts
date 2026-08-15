import { SaveProfile, SaveSlotId } from '../domain/SaveProfile';
import { LocalStorageProfileRepository } from '../infrastructure/LocalStorageProfileRepository';
export class LoadProfileUseCase {
  public static execute(slotId: SaveSlotId): SaveProfile | null {
    return LocalStorageProfileRepository.loadProfile(slotId);
  }
}
