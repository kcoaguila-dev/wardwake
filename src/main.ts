import * as Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';
import { PreloaderScene } from './scenes/PreloaderScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    parent: 'app',
    scene: [PreloaderScene, MainGameScene]
};

new Phaser.Game(config);
