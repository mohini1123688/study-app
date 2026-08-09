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

  const player1 = this.add.image(104, 64,'girl_player');

    player1.setInteractive({ useHandCursor: true });
    player1.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'player1');
      this.scene.start('ChooseStudySpotScene');
    });

    const player2 = this.add.image(104, 64,'boy_player');

    player2.setInteractive({ useHandCursor: true });
    player2.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'player2');
      this.scene.start('ChooseStudySpotScene');
    });
}
}