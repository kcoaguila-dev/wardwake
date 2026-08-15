import * as Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Load placeholder assets from public/assets directory
        this.load.image('tile_floor', 'assets/tile_floor.png');
        this.load.image('tile_wall', 'assets/tile_wall.png');
        this.load.image('unit_sword', 'assets/unit_sword.png');
        this.load.image('unit_lance', 'assets/unit_lance.png');
        this.load.image('unit_axe', 'assets/unit_axe.png');
    }

    create() {
        // 1. Generate procedural item_drop texture (Golden Treasure Chest)
        const gChest = this.make.graphics({ x: 0, y: 0 });
        gChest.fillStyle(0x8b5a2b, 1);
        gChest.fillRect(2, 4, 12, 10);
        gChest.fillStyle(0xffd700, 1);
        gChest.fillRect(1, 3, 14, 3);
        gChest.fillRect(6, 6, 4, 5);
        gChest.fillStyle(0xffea00, 1);
        gChest.fillRect(7, 7, 2, 3);
        gChest.generateTexture('item_drop', 16, 16);
        gChest.destroy();

        // 2. Generate Monster: Goblin Scout (Green skin, pointy ears, sword)
        const gGoblin = this.make.graphics({ x: 0, y: 0 });
        gGoblin.fillStyle(0x388e3c, 1); // Green Goblin Skin
        gGoblin.fillRect(5, 2, 6, 6);
        gGoblin.fillRect(3, 3, 2, 3); // Left Ear
        gGoblin.fillRect(11, 3, 2, 3); // Right Ear
        gGoblin.fillStyle(0xffeb3b, 1);
        gGoblin.fillRect(6, 4, 1, 1);
        gGoblin.fillRect(9, 4, 1, 1);
        gGoblin.fillStyle(0x5d4037, 1);
        gGoblin.fillRect(5, 8, 6, 5);
        gGoblin.fillStyle(0x3e2723, 1);
        gGoblin.fillRect(5, 13, 2, 3);
        gGoblin.fillRect(9, 13, 2, 3);
        gGoblin.fillStyle(0x90a4ae, 1);
        gGoblin.fillRect(12, 3, 2, 9);
        gGoblin.fillStyle(0x795548, 1);
        gGoblin.fillRect(11, 10, 4, 2);
        gGoblin.generateTexture('enemy_goblin_sword', 16, 16);
        gGoblin.destroy();

        // 3. Generate Monster: Horned Orc Marauder / Cleaver (Axe brute)
        const gOrc = this.make.graphics({ x: 0, y: 0 });
        gOrc.fillStyle(0xd7ccc8, 1);
        gOrc.fillRect(3, 0, 2, 3);
        gOrc.fillRect(11, 0, 2, 3);
        gOrc.fillStyle(0x2e7d32, 1);
        gOrc.fillRect(4, 2, 8, 6);
        gOrc.fillStyle(0xff1744, 1);
        gOrc.fillRect(5, 4, 2, 1);
        gOrc.fillRect(9, 4, 2, 1);
        gOrc.fillStyle(0xffffff, 1);
        gOrc.fillRect(5, 6, 1, 2);
        gOrc.fillRect(10, 6, 1, 2);
        gOrc.fillStyle(0x37474f, 1);
        gOrc.fillRect(4, 8, 8, 5);
        gOrc.fillStyle(0x263238, 1);
        gOrc.fillRect(4, 13, 3, 3);
        gOrc.fillRect(9, 13, 3, 3);
        gOrc.fillStyle(0x546e7a, 1);
        gOrc.fillRect(12, 1, 4, 6);
        gOrc.fillStyle(0x4e342e, 1);
        gOrc.fillRect(13, 2, 2, 13);
        gOrc.generateTexture('enemy_orc_axe', 16, 16);
        gOrc.destroy();

        // 4. Generate Monster: Skeleton Spearman (Lance / Bone undead)
        const gSkel = this.make.graphics({ x: 0, y: 0 });
        gSkel.fillStyle(0xeeeeee, 1);
        gSkel.fillRect(5, 1, 6, 6);
        gSkel.fillStyle(0x000000, 1);
        gSkel.fillRect(6, 3, 2, 2);
        gSkel.fillRect(9, 3, 2, 2);
        gSkel.fillStyle(0xff1744, 1);
        gSkel.fillRect(6, 4, 1, 1);
        gSkel.fillRect(9, 4, 1, 1);
        gSkel.fillStyle(0xcccccc, 1);
        gSkel.fillRect(6, 7, 4, 6);
        gSkel.fillRect(5, 13, 2, 3);
        gSkel.fillRect(9, 13, 2, 3);
        gSkel.fillStyle(0x78909c, 1);
        gSkel.fillRect(12, 0, 3, 4);
        gSkel.fillStyle(0x5d4037, 1);
        gSkel.fillRect(13, 4, 1, 12);
        gSkel.generateTexture('enemy_skeleton_lance', 16, 16);
        gSkel.destroy();

        // 5. Generate Monster: Goblin Archer (Bow / Pierce ranged specialist)
        const gArcher = this.make.graphics({ x: 0, y: 0 });
        gArcher.fillStyle(0x2e7d32, 1); // Darker Forest Green Skin
        gArcher.fillRect(5, 2, 6, 6);
        gArcher.fillRect(3, 4, 2, 2); // Left Ear
        gArcher.fillRect(11, 4, 2, 2); // Right Ear
        gArcher.fillStyle(0x4e342e, 1);
        gArcher.fillRect(4, 1, 8, 3);
        gArcher.fillRect(3, 8, 3, 5); // Quiver strap
        gArcher.fillStyle(0xffb300, 1);
        gArcher.fillRect(6, 4, 1, 1);
        gArcher.fillRect(9, 4, 1, 1);
        gArcher.fillStyle(0x33691e, 1);
        gArcher.fillRect(5, 8, 6, 5);
        gArcher.fillStyle(0x1b5e20, 1);
        gArcher.fillRect(5, 13, 2, 3);
        gArcher.fillRect(9, 13, 2, 3);
        gArcher.fillStyle(0x8d6e63, 1);
        gArcher.fillRect(12, 1, 2, 2);
        gArcher.fillRect(14, 3, 2, 8);
        gArcher.fillRect(12, 11, 2, 2);
        gArcher.fillStyle(0xffffff, 1); // Bowstring
        gArcher.fillRect(13, 3, 1, 8);
        gArcher.generateTexture('enemy_goblin_archer', 16, 16);
        gArcher.destroy();

        // 6. Generate Monster: Dark Cultist (Magic / Occult Spellcaster)
        const gCultist = this.make.graphics({ x: 0, y: 0 });
        gCultist.fillStyle(0x311b92, 1);
        gCultist.fillRect(4, 1, 8, 8);
        gCultist.fillStyle(0x0a0a0a, 1);
        gCultist.fillRect(5, 3, 6, 4);
        gCultist.fillStyle(0xe040fb, 1);
        gCultist.fillRect(6, 4, 1, 2);
        gCultist.fillRect(9, 4, 1, 2);
        gCultist.fillStyle(0x4a148c, 1);
        gCultist.fillRect(4, 8, 8, 8);
        gCultist.fillStyle(0x7b1fa2, 1);
        gCultist.fillRect(7, 8, 2, 8);
        gCultist.fillStyle(0x3e2723, 1);
        gCultist.fillRect(13, 3, 2, 13);
        gCultist.fillStyle(0xe040fb, 1);
        gCultist.fillRect(12, 0, 4, 3);
        gCultist.fillStyle(0xffffff, 1);
        gCultist.fillRect(13, 1, 2, 1);
        gCultist.generateTexture('enemy_dark_cultist', 16, 16);
        gCultist.destroy();

        // 7. Generate FOE Boss / Elite: Dread Minotaur (Huge horned beast, glowing crimson eyes & giant axe)
        const gMinotaur = this.make.graphics({ x: 0, y: 0 });
        gMinotaur.fillStyle(0xffe082, 1);
        gMinotaur.fillRect(1, 0, 3, 3);
        gMinotaur.fillRect(12, 0, 3, 3);
        gMinotaur.fillRect(2, 2, 2, 2);
        gMinotaur.fillRect(12, 2, 2, 2);
        gMinotaur.fillStyle(0x3e2723, 1);
        gMinotaur.fillRect(4, 2, 8, 7);
        gMinotaur.fillStyle(0xff0000, 1);
        gMinotaur.fillRect(5, 4, 2, 2);
        gMinotaur.fillRect(9, 4, 2, 2);
        gMinotaur.fillStyle(0x212121, 1);
        gMinotaur.fillRect(3, 8, 10, 6);
        gMinotaur.fillRect(3, 14, 4, 2);
        gMinotaur.fillRect(9, 14, 4, 2);
        gMinotaur.fillStyle(0x9c27b0, 1);
        gMinotaur.fillRect(12, 1, 4, 7);
        gMinotaur.fillStyle(0x212121, 1);
        gMinotaur.fillRect(13, 0, 2, 16);
        gMinotaur.generateTexture('enemy_dread_minotaur', 16, 16);
        gMinotaur.destroy();

        // 8. Generate Explosive Enemy: Cinder Imp (Volatile molten charcoal creature with fiery crown & glowing core)
        const gCinderImp = this.make.graphics({ x: 0, y: 0 });
        gCinderImp.fillStyle(0xff3d00, 1);
        gCinderImp.fillRect(3, 0, 3, 3);
        gCinderImp.fillRect(10, 0, 3, 3);
        gCinderImp.fillStyle(0xffeb3b, 1);
        gCinderImp.fillRect(4, 1, 1, 2);
        gCinderImp.fillRect(11, 1, 1, 2);
        gCinderImp.fillStyle(0x1c1917, 1);
        gCinderImp.fillRect(3, 3, 10, 10);
        gCinderImp.fillStyle(0xf97316, 1);
        gCinderImp.fillRect(5, 5, 6, 2);
        gCinderImp.fillRect(7, 7, 2, 4);
        gCinderImp.fillRect(4, 10, 8, 2);
        gCinderImp.fillStyle(0xffeb3b, 1);
        gCinderImp.fillRect(5, 4, 2, 2);
        gCinderImp.fillRect(9, 4, 2, 2);
        gCinderImp.fillStyle(0xef4444, 1);
        gCinderImp.fillRect(7, 0, 2, 2);
        gCinderImp.fillStyle(0xffffff, 1);
        gCinderImp.fillRect(7, 0, 1, 1);
        gCinderImp.generateTexture('enemy_cinder_imp', 16, 16);
        gCinderImp.destroy();

        // 9. Generate Elite FOE: Shadow Reaper (Scythe / Lance shadow assassin)
        const gReaper = this.make.graphics({ x: 0, y: 0 });
        gReaper.fillStyle(0x0f172a, 1);
        gReaper.fillRect(4, 1, 8, 14);
        gReaper.fillStyle(0x38bdf8, 1); // Glowing Cyan Eyes
        gReaper.fillRect(5, 4, 2, 1);
        gReaper.fillRect(9, 4, 2, 1);
        gReaper.fillStyle(0x64748b, 1); // Scythe Blade
        gReaper.fillRect(11, 0, 5, 3);
        gReaper.fillRect(10, 3, 2, 2);
        gReaper.fillStyle(0x334155, 1); // Staff shaft
        gReaper.fillRect(12, 3, 2, 13);
        gReaper.generateTexture('enemy_shadow_reaper', 16, 16);
        gReaper.destroy();

        // 10. Generate Elite FOE: Crimson Warlord (Heavy scarlet armor & dual bloodblades)
        const gWarlord = this.make.graphics({ x: 0, y: 0 });
        gWarlord.fillStyle(0x991b1b, 1); // Crimson Heavy Plate
        gWarlord.fillRect(3, 2, 10, 12);
        gWarlord.fillStyle(0xfef08a, 1); // Golden Crest
        gWarlord.fillRect(6, 0, 4, 3);
        gWarlord.fillStyle(0xffffff, 1); // Visor Slit
        gWarlord.fillRect(5, 4, 6, 1);
        gWarlord.fillStyle(0xef4444, 1); // Glowing Blood Sword
        gWarlord.fillRect(13, 1, 2, 14);
        gWarlord.fillRect(1, 1, 2, 14);
        gWarlord.generateTexture('enemy_crimson_warlord', 16, 16);
        gWarlord.destroy();

        // 11. Generate Boss: Dread Champion (Mid-tier Floor 5 Boss)
        const gDreadBoss = this.make.graphics({ x: 0, y: 0 });
        gDreadBoss.fillStyle(0x450a0a, 1);
        gDreadBoss.fillRect(2, 2, 12, 12);
        gDreadBoss.fillStyle(0xf59e0b, 1); // Golden Horns
        gDreadBoss.fillRect(1, 0, 3, 3);
        gDreadBoss.fillRect(12, 0, 3, 3);
        gDreadBoss.fillStyle(0xdc2626, 1); // Crimson Core
        gDreadBoss.fillRect(5, 5, 6, 6);
        gDreadBoss.fillStyle(0xffffff, 1);
        gDreadBoss.fillRect(6, 6, 4, 2);
        gDreadBoss.generateTexture('boss_dread_champion', 16, 16);
        gDreadBoss.destroy();

        // 12. Generate Final Boss: Shadow Sovereign (Floor 10 Arch-fiend)
        const gFinalBoss = this.make.graphics({ x: 0, y: 0 });
        gFinalBoss.fillStyle(0x18181b, 1);
        gFinalBoss.fillRect(2, 2, 12, 12);
        gFinalBoss.fillStyle(0xa855f7, 1); // Regal Void Crown
        gFinalBoss.fillRect(3, 0, 10, 3);
        gFinalBoss.fillRect(5, 3, 6, 2);
        gFinalBoss.fillStyle(0xec4899, 1); // Malevolent Magenta Eyes
        gFinalBoss.fillRect(4, 5, 2, 2);
        gFinalBoss.fillRect(10, 5, 2, 2);
        gFinalBoss.fillStyle(0xc084fc, 1); // Void Blade
        gFinalBoss.fillRect(13, 0, 3, 16);
        gFinalBoss.generateTexture('boss_shadow_sovereign', 16, 16);
        gFinalBoss.destroy();

        // Transition to TitleScene when loading is complete
        this.scene.start('TitleScene');
    }
}
