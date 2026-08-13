import { TurnState } from '../domain/TurnState';

export class PhaseManagerUseCase {
  private currentState: TurnState;
  private currentTurnCount: number;

  constructor() {
    this.currentState = TurnState.PLAYER_PHASE;
    this.currentTurnCount = 1;
  }

  public get state(): TurnState {
    return this.currentState;
  }

  public getPhase(): TurnState {
    return this.currentState;
  }

  public get turnCount(): number {
    return this.currentTurnCount;
  }

  public advancePhase(): void {
    if (this.currentState === TurnState.GAME_OVER) {
      return;
    }

    if (this.currentState === TurnState.PLAYER_PHASE) {
      this.currentState = TurnState.ENEMY_PHASE;
    } else if (this.currentState === TurnState.ENEMY_PHASE) {
      this.currentState = TurnState.PLAYER_PHASE;
      this.currentTurnCount++;
    }
  }

  public endGame(): void {
    this.currentState = TurnState.GAME_OVER;
  }
}
