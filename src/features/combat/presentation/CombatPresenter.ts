import { CombatSummary } from '../application/AttackUnitUseCase';
import { Unit } from '../domain/Unit';

export class CombatPresenter {
  /**
   * Called to render the outcome of an attack on the UI.
   * This class acts as a translator between domain output and UI render events.
   * Being pure TypeScript, actual Phaser calls would be delegated or this would format data.
   */
  public renderAttackOutcome(attacker: Unit, defender: Unit, summary: CombatSummary): void {
    // In a full implementation, this might emit events or call a Phaser-specific view interface.
    // For now, it simply documents the boundary.
    console.log(`Combat Result: ${attacker.name} attacked ${defender.name}.`);
    console.log(`Damage dealt: ${summary.damageDealt}`);
    if (summary.hasAdvantage) {
      console.log('Attacker had weapon advantage!');
    } else if (summary.hasDisadvantage) {
      console.log('Attacker had weapon disadvantage!');
    }

    if (summary.isFatal) {
      console.log(`${defender.name} was defeated!`);
    } else {
      console.log(`${defender.name} has ${defender.currentHp} HP remaining.`);
    }
  }
}
