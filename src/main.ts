import * as Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { TitleScene } from './scenes/TitleScene';
import { TownScene } from './scenes/TownScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 360
    },
    render: {
        pixelArt: true,
        roundPixels: true,
        antialias: false
    },
    backgroundColor: '#0a0e17',
    parent: 'app',
    scene: [PreloaderScene, TitleScene, TownScene, MainGameScene]
};

const game = new Phaser.Game(config);
(window as any).game = game;
