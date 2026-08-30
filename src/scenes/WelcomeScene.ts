import Phaser from 'phaser';
import { supabase } from '../supabaseClient';
import { setupAuthOverlay } from './authOverlay';


export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }
  preload() {
    this.load.aseprite('washu', 'assets/welcom_page_no_button.png', 'assets/welcom_page_no_button.json');
    this.load.aseprite('start_btn', 'assets/start_button.png', 'assets/start_button.json');
    this.load.aseprite('log_in_menu', 'assets/log_in_menu.png', 'assets/log_in_menu.json');
    this.load.aseprite('log_in_submit_button.png', 'assets/log_in_submit_button.png', 'assets/log_in_submit_button.json');
    this.load.image('heatmap_calendar', 'assets/heatmap_calendar.png');
  }
  create() {

  const authOverlay = setupAuthOverlay(this, ({ isNewUser }) => {
  if (isNewUser) {
    this.scene.start('OnboardingScene'); // fresh signup -> collect username/major/year
  }
  });

  this.anims.createFromAseprite('washu');
  const bg = this.add.sprite(104, 64, 'washu');
  bg.setOrigin(0.5);

  bg.play({ key: 'intro', repeat: -1, frameRate: 6 });

  const startButton = this.add.sprite(104, 15, 'start_btn', 0); // 0 = starting frame index
  startButton.setInteractive({ useHandCursor: true });

  startButton.on('pointerover', () => {
    startButton.setFrame(1);
  });

  startButton.on('pointerout', () => {
    startButton.setFrame(0);
  });

  startButton.on('pointerdown', () => {
    this.scene.start('CharacterCustomizeScene');
  });

  const heatmap_calendar = this.add.image(22, 108, 'heatmap_calendar');

  this.events.once('shutdown', () => {
    authOverlay.destroy();
  });
}

}