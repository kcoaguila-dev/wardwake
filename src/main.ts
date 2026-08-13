import * as Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    scene: {
        preload: preload,
        create: create
    }
};

new Phaser.Game(config);

function preload(this: Phaser.Scene) {
    // Preload assets here
}

function create(this: Phaser.Scene) {
    this.add.text(100, 100, 'Wardwake Initialized', { color: '#0f0' });
}
