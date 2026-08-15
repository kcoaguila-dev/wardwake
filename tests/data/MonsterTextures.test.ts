import * as fs from 'fs';
import * as path from 'path';
import monstersData from '../../src/data/monsters.json';
import { WeaponType } from '../../src/features/combat/domain/WeaponType';

describe('Monster Data and Texture Integrity', () => {
  const preloaderPath = path.resolve(__dirname, '../../src/scenes/PreloaderScene.ts');
  const preloaderContent = fs.readFileSync(preloaderPath, 'utf8');

  // Extract all texture keys generated via .generateTexture('key', ...)
  const generatedTextures: string[] = [];
  const regex = /generateTexture\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(preloaderContent)) !== null) {
    generatedTextures.push(match[1]!);
  }

  it('all monsters in monsters.json have valid supported weapon types', () => {
    const validWeapons: string[] = [WeaponType.SWORD, WeaponType.LANCE, WeaponType.AXE, WeaponType.BOW, WeaponType.MAGIC];
    
    (monstersData as Array<any>).forEach(m => {
      expect(validWeapons).toContain(m.weaponType);
    });
  });

  it('verifies enemy_dread_minotaur and all core monster textures are generated in PreloaderScene', () => {
    const expectedCoreTextures = [
      'enemy_goblin_sword',
      'enemy_orc_axe',
      'enemy_skeleton_lance',
      'enemy_goblin_archer',
      'enemy_dark_cultist',
      'enemy_dread_minotaur',
      'enemy_cinder_imp',
      'enemy_shadow_reaper',
      'enemy_crimson_warlord',
      'boss_dread_champion',
      'boss_shadow_sovereign'
    ];

    expectedCoreTextures.forEach(texKey => {
      expect(generatedTextures).toContain(texKey);
    });
  });

  it('all monster blueprints in monsters.json map to an existing generated texture in PreloaderScene', () => {
    const weaponTypeToTexture: Record<string, string> = {
      [WeaponType.SWORD]: 'enemy_goblin_sword',
      [WeaponType.AXE]: 'enemy_orc_axe',
      [WeaponType.LANCE]: 'enemy_skeleton_lance',
      [WeaponType.BOW]: 'enemy_goblin_archer',
      [WeaponType.MAGIC]: 'enemy_dark_cultist'
    };

    (monstersData as Array<any>).forEach(m => {
      let resolvedKey = '';
      if (generatedTextures.includes(m.id)) {
        resolvedKey = m.id;
      } else if (m.name.includes('💀') || m.name.includes('FOE') || m.name.includes('Dread')) {
        resolvedKey = 'enemy_dread_minotaur';
      } else if (m.isExplosive || m.name.includes('Cinder Imp')) {
        resolvedKey = 'enemy_cinder_imp';
      } else {
        resolvedKey = weaponTypeToTexture[m.weaponType]!;
      }

      expect(resolvedKey).toBeDefined();
      expect(generatedTextures).toContain(resolvedKey);
    });
  });
});
