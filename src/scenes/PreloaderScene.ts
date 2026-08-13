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
        // Transition to MainGameScene when loading is complete
        this.scene.start('MainGameScene');
    }
}
