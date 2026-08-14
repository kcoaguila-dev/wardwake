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
        // Head & Pointy Ears
        gGoblin.fillStyle(0x388e3c, 1); // Green Goblin Skin
        gGoblin.fillRect(5, 2, 6, 6);
        gGoblin.fillRect(3, 3, 2, 3); // Left Ear
        gGoblin.fillRect(11, 3, 2, 3); // Right Ear
        // Piercing Red/Yellow Eyes
        gGoblin.fillStyle(0xffeb3b, 1);
        gGoblin.fillRect(6, 4, 1, 1);
        gGoblin.fillRect(9, 4, 1, 1);
        // Leather Tunic Body
        gGoblin.fillStyle(0x5d4037, 1);
        gGoblin.fillRect(5, 8, 6, 5);
        // Legs
        gGoblin.fillStyle(0x3e2723, 1);
        gGoblin.fillRect(5, 13, 2, 3);
        gGoblin.fillRect(9, 13, 2, 3);
        // Rusty Blade
        gGoblin.fillStyle(0x90a4ae, 1);
        gGoblin.fillRect(12, 3, 2, 9);
        gGoblin.fillStyle(0x795548, 1);
        gGoblin.fillRect(11, 10, 4, 2);
        gGoblin.generateTexture('enemy_goblin_sword', 16, 16);
        gGoblin.destroy();

        // 3. Generate Monster: Horned Orc Marauder (Axe brute)
        const gOrc = this.make.graphics({ x: 0, y: 0 });
        // Horns
        gOrc.fillStyle(0xd7ccc8, 1);
        gOrc.fillRect(3, 0, 2, 3);
        gOrc.fillRect(11, 0, 2, 3);
        // Head
        gOrc.fillStyle(0x2e7d32, 1);
        gOrc.fillRect(4, 2, 8, 6);
        // Fierce Red Eyes & Tusks
        gOrc.fillStyle(0xff1744, 1);
        gOrc.fillRect(5, 4, 2, 1);
        gOrc.fillRect(9, 4, 2, 1);
        gOrc.fillStyle(0xffffff, 1);
        gOrc.fillRect(5, 6, 1, 2);
        gOrc.fillRect(10, 6, 1, 2);
        // Spiked Iron Armor
        gOrc.fillStyle(0x37474f, 1);
        gOrc.fillRect(4, 8, 8, 5);
        gOrc.fillStyle(0x263238, 1);
        gOrc.fillRect(4, 13, 3, 3);
        gOrc.fillRect(9, 13, 3, 3);
        // Heavy Cleaver Battleaxe
        gOrc.fillStyle(0x546e7a, 1);
        gOrc.fillRect(12, 1, 4, 6);
        gOrc.fillStyle(0x4e342e, 1);
        gOrc.fillRect(13, 2, 2, 13);
        gOrc.generateTexture('enemy_orc_axe', 16, 16);
        gOrc.destroy();

        // 4. Generate Monster: Skeleton Spearman (Lance / Bone undead)
        const gSkel = this.make.graphics({ x: 0, y: 0 });
        // Skull
        gSkel.fillStyle(0xeeeeee, 1);
        gSkel.fillRect(5, 1, 6, 6);
        // Black Eye Sockets with Red Glow
        gSkel.fillStyle(0x000000, 1);
        gSkel.fillRect(6, 3, 2, 2);
        gSkel.fillRect(9, 3, 2, 2);
        gSkel.fillStyle(0xff1744, 1);
        gSkel.fillRect(6, 4, 1, 1);
        gSkel.fillRect(9, 4, 1, 1);
        // Rib Cage & Spine
        gSkel.fillStyle(0xcccccc, 1);
        gSkel.fillRect(6, 7, 4, 6);
        gSkel.fillRect(5, 13, 2, 3);
        gSkel.fillRect(9, 13, 2, 3);
        // Long Lance / Spear
        gSkel.fillStyle(0x78909c, 1);
        gSkel.fillRect(12, 0, 3, 4); // Spearhead
        gSkel.fillStyle(0x5d4037, 1);
        gSkel.fillRect(13, 4, 1, 12); // Shaft
        gSkel.generateTexture('enemy_skeleton_lance', 16, 16);
        gSkel.destroy();

        // Transition to MainGameScene when loading is complete
        this.scene.start('MainGameScene');
    }
}
