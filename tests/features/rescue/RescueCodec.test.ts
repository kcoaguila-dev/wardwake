import { RescueCodec } from '../../../src/features/rescue/domain/RescueCodec';
import { RescueMission } from '../../../src/features/rescue/domain/RescueMission';

describe('RescueCodec', () => {
  it('should correctly encode and decode a RescueMission to/from a base64 string', () => {
    const mission: RescueMission = {
      id: 'test-id',
      requesterName: 'Fallen Knight',
      floorNumber: 5,
      seed: 12345,
      rewardGold: 500,
      status: 'PENDING',
      createdAt: 1000
    };

    const encoded = RescueCodec.encode(mission);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = RescueCodec.decode(encoded);
    expect(decoded).toEqual(mission);
  });

  it('should return null for invalid base64 string', () => {
    const result = RescueCodec.decode('invalid-base64');
    expect(result).toBeNull();
  });

  it('should return null for malformed JSON payload', () => {
    const malformedPayload = Buffer.from('{ "invalid": true ').toString('base64');
    const result = RescueCodec.decode(malformedPayload);
    expect(result).toBeNull();
  });
});
