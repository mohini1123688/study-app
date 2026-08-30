import Phaser from 'phaser';
import { WelcomeScene } from './scenes/WelcomeScene';
import { CharacterCustomizeScene } from './scenes/CharacterCustomizeScene';
import { OlinScene } from './scenes/OlinScene';
import { BDScene } from './scenes/BDScene';
import { DormScene } from './scenes/DormScene';
import { ChooseStudySpotScene } from './scenes/ChooseStudySpotScene';
import { ShopScene } from './scenes/ShopScene';
import { OnboardingScene } from './scenes/OnboardingScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 208,
  height: 128,
  zoom: 3,
  pixelArt: true,
  parent: 'app',
  backgroundColor: '#f4f1ea',
  scene: [
    WelcomeScene,
    OnboardingScene,
    CharacterCustomizeScene,
    ChooseStudySpotScene,
    OlinScene,
    BDScene,
    DormScene,
    ShopScene,
  ],
});