import { Unit } from '../domain/Unit';
import { CombatResolver } from '../domain/CombatResolver';
import { IAudioService } from './ports/IAudioService';
import { WeaponType } from '../domain/WeaponType';

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

    let soundId = 'sword_slash';
    if (attacker.weaponType === WeaponType.AXE) {
      soundId = 'axe_smash';
    } else if (attacker.weaponType === WeaponType.LANCE) {
      soundId = 'lance_pierce';
    }

    this.audioService.playSound(soundId);

    return {
      damageDealt: combatResult.damageDealt,
      isFatal,
      hasAdvantage: combatResult.hasAdvantage,
      hasDisadvantage: combatResult.hasDisadvantage,
    };
  }
}
