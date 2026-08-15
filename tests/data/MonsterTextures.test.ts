import monstersData from '../../src/data/monsters.json';
import { WeaponType } from '../../src/features/combat/domain/WeaponType';

describe('Monster Data and Texture Integrity', () => {
  const definedTextureKeys = [
    'enemy_goblin_sword',
    'enemy_orc_axe',
    'enemy_skeleton_lance',
    'enemy_goblin_archer',
    'enemy_dark_cultist',
    'enemy_dread_minotaur',
    'enemy_cinder_imp'
  ];

  it('all monsters in monsters.json have valid supported weapon types', () => {
    const validWeapons: string[] = [WeaponType.SWORD, WeaponType.LANCE, WeaponType.AXE, WeaponType.BOW, WeaponType.MAGIC];
    
    (monstersData as Array<any>).forEach(m => {
      expect(validWeapons).toContain(m.weaponType);
    });
  });

  it('all standard monster weapon types map to defined texture keys in PreloaderScene', () => {
    const weaponTypeToTexture: Record<string, string> = {
      [WeaponType.SWORD]: 'enemy_goblin_sword',
      [WeaponType.AXE]: 'enemy_orc_axe',
      [WeaponType.LANCE]: 'enemy_skeleton_lance',
      [WeaponType.BOW]: 'enemy_goblin_archer',
      [WeaponType.MAGIC]: 'enemy_dark_cultist'
    };

    (monstersData as Array<any>).forEach(m => {
      const expectedKey = m.name.includes('💀') || m.name.includes('FOE') || m.name.includes('Dread')
        ? 'enemy_dread_minotaur'
        : m.isExplosive || m.name.includes('Cinder Imp')
        ? 'enemy_cinder_imp'
        : weaponTypeToTexture[m.weaponType];

      expect(expectedKey).toBeDefined();
      expect(definedTextureKeys).toContain(expectedKey);
    });
  });
});
