import { SaveProfile } from './SaveProfile';

export class SaveSerializer {
  private static readonly MAGIC_PREFIX = 'WW_SAVE:';
  private static readonly CURRENT_SCHEMA_VERSION = 1;

  public static serialize(profile: SaveProfile): string {
    const json = JSON.stringify(profile);
    let checksum = 0;
    for (let i = 0; i < json.length; i++) {
      checksum = (checksum + json.charCodeAt(i)) % 65535;
    }
    const payload = JSON.stringify({ data: json, checksum });
    if (typeof btoa !== 'undefined') {
      return this.MAGIC_PREFIX + btoa(unescape(encodeURIComponent(payload)));
    } else {
      return this.MAGIC_PREFIX + Buffer.from(payload, 'utf8').toString('base64');
    }
  }

  public static deserialize(serializedStr: string): SaveProfile {
    if (!serializedStr.startsWith(this.MAGIC_PREFIX)) {
      throw new Error('Invalid save data format: missing magic prefix.');
    }
    const base64Payload = serializedStr.substring(this.MAGIC_PREFIX.length);
    let payloadStr: string;
    try {
      if (typeof atob !== 'undefined') {
        payloadStr = decodeURIComponent(escape(atob(base64Payload)));
      } else {
        payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
      }
    } catch (e) {
      throw new Error('Invalid save data format: corrupted base64 encoding.');
    }
    let payloadObj: { data: string; checksum: number };
    try {
      payloadObj = JSON.parse(payloadStr);
    } catch (e) {
      throw new Error('Invalid save data format: malformed payload.');
    }
    if (typeof payloadObj.data !== 'string' || typeof payloadObj.checksum !== 'number') {
      throw new Error('Invalid save data format: malformed structure.');
    }
    let calculatedChecksum = 0;
    for (let i = 0; i < payloadObj.data.length; i++) {
      calculatedChecksum = (calculatedChecksum + payloadObj.data.charCodeAt(i)) % 65535;
    }
    if (calculatedChecksum !== payloadObj.checksum) {
      throw new Error('Invalid save data: checksum validation failed. The save might be corrupted.');
    }
    let profile: SaveProfile;
    try {
      profile = JSON.parse(payloadObj.data) as SaveProfile;
    } catch (e) {
      throw new Error('Invalid save data: could not parse profile JSON.');
    }
    if (profile.schemaVersion > this.CURRENT_SCHEMA_VERSION) {
      throw new Error(`Unsupported save version. Expected <= ${this.CURRENT_SCHEMA_VERSION}, got ${profile.schemaVersion}.`);
    }
    return profile;
  }
}
