import { RescueMission } from './RescueMission';

export class RescueCodec {
  public static encode(mission: RescueMission): string {
    const json = JSON.stringify(mission);
    if (typeof btoa !== 'undefined') {
      return btoa(json);
    }
    return Buffer.from(json).toString('base64');
  }

  public static decode(payload: string): RescueMission | null {
    try {
      let json = '';
      if (typeof atob !== 'undefined') {
        json = atob(payload);
      } else {
        json = Buffer.from(payload, 'base64').toString('utf8');
      }
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object' || !data.id || typeof data.floorNumber !== 'number') {
        return null;
      }
      return data as RescueMission;
    } catch {
      return null;
    }
  }
}
