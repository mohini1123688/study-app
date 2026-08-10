import Phaser from 'phaser';

export class OlinScene extends Phaser.Scene {
  constructor() {
    super('OlinScene');
  }
  preload() {
    this.load.image('light', 'assets/light.png');
    this.load.image('chair', 'assets/chair.png');
    this.load.image('home_button','assets/home_button.png')
    this.load.image('olin_only_room', 'assets/olin_only_room.png');
    this.load.image('olin_table', 'assets/olin_table.png');
    this.load.image('start_study_button', 'assets/start_study_button.png')
    this.load.image('clock_button', 'assets/clock_button.png')
    this.load.aseprite('task_bar','assets/task_bar.png', 'assets/task_bar.json');
    this.load.aseprite('status_bar', 'assets/status_bar.png', 'assets/status_bar.json');
    this.load.aseprite('girl_player', 'assets/good_sprite_outline_girl.png', 'assets/good_sprite_outline_girl.json');
    this.load.aseprite('boy_player', 'assets/good_sprite_outline.png', 'assets/good_sprite_outline.json');
  }
  create() {
    const bg = this.add.image(104, 64, 'olin_only_room');
    bg.setOrigin(0.5);

    const home_button = this.add.image(5, 123, 'home_button');
    
    home_button.setInteractive({ useHandCursor: true });
    home_button.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    const status_bar = this.add.sprite(104,8,'status_bar')

    const task_bar = this.add.sprite(187, 78, 'task_bar')
    const start_study_button = this.add.image(181, 117, 'start_study_button')
    const clock_button = this.add.image(199, 117, 'clock_button')

    const chosenKey = this.registry.get('selectedCharacter') ?? 'girl_player';
    const player = this.add.sprite(64, 34, chosenKey);
    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    player.play({ key: animKey, repeat: -1 });

    const table = this.add.image(104, 50, 'olin_table');
    const light = this.add.image(104, 42, 'light');

    const table2 = this.add.image(104, 80, 'olin_table');
    const light2 = this.add.image(104, 72, 'light');

    const table3 = this.add.image(104, 110, 'olin_table');
    const light3 = this.add.image(104, 102, 'light');
    
  }
}