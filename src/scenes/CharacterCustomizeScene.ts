import Phaser from 'phaser';

export class CharacterCustomizeScene extends Phaser.Scene {
  constructor() {
    super('CharacterCustomizeScene');
  }
  preload() {
    this.load.aseprite('girl_player', 'assets/good_sprite_outline_girl.png', 'assets/good_sprite_outline_girl.json');
    this.load.aseprite('boy_player', 'assets/good_sprite_outline.png', 'assets/good_sprite_outline.json');
    this.load.image('customize_background', 'assets/choose_your_character.png');
  }
  create() {
    const bg = this.add.image(104, 64, 'customize_background');
    bg.setOrigin(0.5);

    this.anims.createFromAseprite('girl_player');
    this.anims.createFromAseprite('boy_player');

    const player1 = this.add.sprite(90, 64, 'girl_player');
    player1.play({ key: 'pick_me', repeat: -1 });

    player1.setInteractive({ useHandCursor: true });
    player1.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'girl_player');
      this.scene.start('ChooseStudySpotScene');
    });

    const player2 = this.add.sprite(110, 64, 'boy_player');
    player2.play({ key: 'pick_me_boy', repeat: -1 });

    player2.setInteractive({ useHandCursor: true });
    player2.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'boy_player');
      this.scene.start('ChooseStudySpotScene');
    });
  }
}