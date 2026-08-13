import { PhaseManagerUseCase } from '../../../src/features/turn/application/PhaseManagerUseCase';
import { TurnState } from '../../../src/features/turn/domain/TurnState';

describe('PhaseManagerUseCase', () => {
  let phaseManager: PhaseManagerUseCase;

  beforeEach(() => {
    phaseManager = new PhaseManagerUseCase();
  });

  it('should start with PLAYER_PHASE and turnCount 1', () => {
    expect(phaseManager.state).toBe(TurnState.PLAYER_PHASE);
    expect(phaseManager.turnCount).toBe(1);
  });

  it('should transition from PLAYER_PHASE to ENEMY_PHASE without incrementing turnCount', () => {
    phaseManager.advancePhase();

    expect(phaseManager.state).toBe(TurnState.ENEMY_PHASE);
    expect(phaseManager.turnCount).toBe(1);
  });

  it('should transition from ENEMY_PHASE to PLAYER_PHASE and increment turnCount', () => {
    phaseManager.advancePhase(); // To ENEMY_PHASE
    phaseManager.advancePhase(); // Back to PLAYER_PHASE

    expect(phaseManager.state).toBe(TurnState.PLAYER_PHASE);
    expect(phaseManager.turnCount).toBe(2);
  });

  it('should loop phases correctly and increment turnCount appropriately', () => {
    phaseManager.advancePhase(); // Turn 1, Enemy
    phaseManager.advancePhase(); // Turn 2, Player
    phaseManager.advancePhase(); // Turn 2, Enemy
    phaseManager.advancePhase(); // Turn 3, Player

    expect(phaseManager.state).toBe(TurnState.PLAYER_PHASE);
    expect(phaseManager.turnCount).toBe(3);
  });

  it('should set state to GAME_OVER on endGame', () => {
    phaseManager.endGame();

    expect(phaseManager.state).toBe(TurnState.GAME_OVER);
  });

  it('should not advance phase if state is GAME_OVER', () => {
    phaseManager.endGame();
    phaseManager.advancePhase();

    expect(phaseManager.state).toBe(TurnState.GAME_OVER);
  });
});
