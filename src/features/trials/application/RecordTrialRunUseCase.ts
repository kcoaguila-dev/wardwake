import { TrialScoreCalculator } from '../domain/TrialScoreCalculator';
import { TrialRecord } from '../domain/TrialRecord';
import { TrialRecordRepository } from '../infrastructure/TrialRecordRepository';
import { Unit } from '../../combat/domain/Unit';

export class RecordTrialRunUseCase {
  public execute(
    seed: string,
    floor: number,
    turnsTaken: number,
    monstersSlain: number,
    goldGathered: number,
    relicsFound: number,
    clearTimeMs: number,
    playerSquad: Unit[]
  ): TrialRecord {
    const score = TrialScoreCalculator.calculate(
      floor,
      turnsTaken,
      monstersSlain,
      goldGathered,
      relicsFound
    );

    const record: TrialRecord = {
      id: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      seed,
      score,
      floor,
      turnsTaken,
      monstersSlain,
      goldGathered,
      relicsFound,
      clearTimeMs,
      partyComposition: playerSquad.map(u => u.name),
      date: Date.now()
    };

    TrialRecordRepository.save(record);

    return record;
  }
}
