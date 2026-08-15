import { SaveProfile } from '../domain/SaveProfile';
import { SaveSerializer } from '../domain/SaveSerializer';
export class ImportSaveUseCase {
  public static execute(payload: string): SaveProfile {
    return SaveSerializer.deserialize(payload);
  }
}
