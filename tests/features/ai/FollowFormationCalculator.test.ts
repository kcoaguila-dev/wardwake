import { FollowFormationCalculator } from '../../../src/features/ai/domain/FollowFormationCalculator';
import { TileCoordinate } from '../../../src/features/grid/domain/TileCoordinate';

describe('FollowFormationCalculator', () => {
  let calculator: FollowFormationCalculator;

  beforeEach(() => {
    calculator = new FollowFormationCalculator();
  });

  it('should return the leader\'s previous tile', () => {
    const leaderPreviousTile = new TileCoordinate(5, 5);
    const targetTile = calculator.calculate(leaderPreviousTile);

    expect(targetTile.x).toBe(5);
    expect(targetTile.y).toBe(5);
    expect(targetTile).not.toBe(leaderPreviousTile); // should be a new instance
  });
});
