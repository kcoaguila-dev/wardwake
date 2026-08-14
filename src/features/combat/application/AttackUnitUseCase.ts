import { Unit } from '../domain/Unit';
import { CombatResolver } from '../domain/CombatResolver';
import { IAudioService } from './ports/IAudioService';
import { WeaponType } from '../domain/WeaponType';
import { TerrainType } from '../../grid/domain/TerrainType';

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

  public execute(
    attacker: Unit,
    defender: Unit,
    rollHit?: number,
    rollCrit?: number,
    attackerTerrain: TerrainType = TerrainType.NONE,
    defenderTerrain: TerrainType = TerrainType.NONE,
    distance: number = 1
  ): CombatSummary {
    const combatResult = CombatResolver.calculateDamage(attacker, defender, rollHit, rollCrit, attackerTerrain, defenderTerrain, distance);
    const isFatal = defender.applyDamage(combatResult.damageDealt);

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
