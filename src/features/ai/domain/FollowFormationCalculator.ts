import { TileCoordinate } from '../../grid/domain/TileCoordinate';

export class FollowFormationCalculator {
  /**
   * Calculates the target tile coordinate for a companion to follow a leader.
   * Simply returns the leader's previous tile to form a cohesive 1-tile formation.
   */
  public calculate(leaderPreviousTile: TileCoordinate): TileCoordinate {
    return new TileCoordinate(leaderPreviousTile.x, leaderPreviousTile.y);
  }
}
