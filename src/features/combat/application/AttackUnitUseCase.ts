import { Unit } from '../domain/Unit';
import { CombatResolver } from '../domain/CombatResolver';
import { IAudioService } from './ports/IAudioService';

export interface CombatSummary {
  damageDealt: number;
  isFatal: boolean;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
}

export class AttackUnitUseCase {
  private audioService: IAudioService;

  constructor(audioService: IAudioService) {
    this.audioService = audioService;
  }

  public execute(attacker: Unit, defender: Unit): CombatSummary {
    const combatResult = CombatResolver.calculateDamage(attacker, defender);
    const isFatal = defender.applyDamage(combatResult.damageDealt);

    // Play sword slash sound as required by specs
    this.audioService.playSound('SWORD_SLASH');

    return {
      damageDealt: combatResult.damageDealt,
      isFatal,
      hasAdvantage: combatResult.hasAdvantage,
      hasDisadvantage: combatResult.hasDisadvantage,
    };
  }
}
