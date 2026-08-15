import { SaveProfile } from '../domain/SaveProfile';
import { SaveSerializer } from '../domain/SaveSerializer';
export class ExportSaveUseCase {
  public static execute(profile: SaveProfile): string {
    return SaveSerializer.serialize(profile);
  }
}
