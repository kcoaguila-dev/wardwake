import * as Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    parent: 'app',
    scene: [MainGameScene]
};

new Phaser.Game(config);
