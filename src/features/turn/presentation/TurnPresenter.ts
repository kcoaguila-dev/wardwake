import { PhaseManagerUseCase } from '../application/PhaseManagerUseCase';
import { TurnState } from '../domain/TurnState';

export class TurnPresenter {
  private phaseManager: PhaseManagerUseCase;

  constructor(phaseManager: PhaseManagerUseCase) {
    this.phaseManager = phaseManager;
  }

  public advancePhase(): void {
    const prevState = this.phaseManager.state;
    this.phaseManager.advancePhase();
    const newState = this.phaseManager.state;

    if (prevState !== newState) {
      this.onPhaseChanged(newState, this.phaseManager.turnCount);
    }
  }

  public endGame(): void {
    const prevState = this.phaseManager.state;
    this.phaseManager.endGame();
    const newState = this.phaseManager.state;

    if (prevState !== newState) {
      this.onPhaseChanged(newState, this.phaseManager.turnCount);
    }
  }

  /**
   * Hook for presentation layer to listen to phase changes.
   * In a real implementation, this could emit an event (e.g. Phaser event or CustomEvent).
   */
  public onPhaseChanged(newState: TurnState, turnCount: number): void {
    // Implement event emitting logic here as needed by the front-end
  }
}
