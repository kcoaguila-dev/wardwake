import { TrialRunContext } from './TrialRunContext';

export class StartSeededRunUseCase {
  public execute(seed: string): void {
    TrialRunContext.getInstance().startSeededRun(seed);
  }
}
