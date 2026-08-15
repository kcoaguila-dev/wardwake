import { SaveSlotId } from '../domain/SaveProfile';
import { LocalStorageProfileRepository } from '../infrastructure/LocalStorageProfileRepository';
export class DeleteProfileUseCase {
  public static execute(slotId: SaveSlotId): void {
    LocalStorageProfileRepository.deleteProfile(slotId);
  }
}
