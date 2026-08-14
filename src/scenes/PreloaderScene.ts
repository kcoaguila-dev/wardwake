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
        // Generate procedural item_drop texture (Golden Treasure Chest)
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0x8b5a2b, 1);
        g.fillRect(2, 4, 12, 10);
        g.fillStyle(0xffd700, 1);
        g.fillRect(1, 3, 14, 3);
        g.fillRect(6, 6, 4, 5);
        g.fillStyle(0xffea00, 1);
        g.fillRect(7, 7, 2, 3);
        g.generateTexture('item_drop', 16, 16);
        g.destroy();

        // Transition to MainGameScene when loading is complete
        this.scene.start('MainGameScene');
    }
}
