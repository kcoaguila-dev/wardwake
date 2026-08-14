import { Unit } from '../domain/Unit';
import { CombatResolver } from '../domain/CombatResolver';
import { IAudioService } from './ports/IAudioService';
import { WeaponType } from '../domain/WeaponType';

export interface CombatSummary {
  damageDealt: number;
  isFatal: boolean;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  isHit: boolean;
  isCrit: boolean;
  lifeStealAmount: number;
  doubleStrike: boolean;
}

export class AttackUnitUseCase {
  private audioService: IAudioService;

  constructor(audioService: IAudioService) {
    this.audioService = audioService;
  }

  public execute(attacker: Unit, defender: Unit, rollHit?: number, rollCrit?: number): CombatSummary {
    const combatResult = CombatResolver.calculateDamage(attacker, defender, rollHit, rollCrit);
    const isFatal = defender.applyDamage(combatResult.damageDealt);

    if (isFatal) {
      if (defender.id.startsWith('enemy_') || defender.id.startsWith('boss_')) {
        try {
          if (typeof localStorage !== 'undefined') {
            let bestiary: string[] = [];
            const stored = localStorage.getItem('wardwake_bestiary');
            if (stored) {
              bestiary = JSON.parse(stored);
            }
            if (!bestiary.includes(defender.id)) {
              bestiary.push(defender.id);
              localStorage.setItem('wardwake_bestiary', JSON.stringify(bestiary));
            }
          }
        } catch (e) {
          // safe fallback if storage unavailable
        }
      }
    }

    if (combatResult.isHit) {
      let soundId = 'sword_slash';
      if (attacker.weaponType === WeaponType.AXE) {
        soundId = 'axe_smash';
      } else if (attacker.weaponType === WeaponType.LANCE) {
        soundId = 'lance_pierce';
      }
      this.audioService.playSound(soundId);

      // Apply Life Steal if weapon relic has it
      if (combatResult.lifeStealAmount > 0) {
        attacker.heal(combatResult.lifeStealAmount);
      }
    }

    return {
      damageDealt: combatResult.damageDealt,
      isFatal,
      hasAdvantage: combatResult.hasAdvantage,
      hasDisadvantage: combatResult.hasDisadvantage,
      isHit: combatResult.isHit,
      isCrit: combatResult.isCrit,
      lifeStealAmount: combatResult.lifeStealAmount,
      doubleStrike: combatResult.doubleStrike
    };
  }
}
