import * as Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';
import { PreloaderScene } from './scenes/PreloaderScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 360
    },
    render: {
        pixelArt: true,
        roundPixels: true,
        antialias: false
    },
    backgroundColor: '#0a0e17',
    parent: 'app',
    scene: [PreloaderScene, MainGameScene]
};

new Phaser.Game(config);
