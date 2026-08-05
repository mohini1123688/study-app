import Phaser from 'phaser';
import { WelcomeScene } from './scenes/WelcomeScene';
import { CharacterCustomizeScene } from './scenes/CharacterCustomizeScene';
import { OlinScene } from './scenes/OlinScene';
import { BDScene } from './scenes/BDScene';
import { DormScene } from './scenes/DormScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#f4f1ea',
  scene: [
    WelcomeScene,
    CharacterCustomizeScene,
    OlinScene,
    BDScene,
    DormScene,
  ],
});