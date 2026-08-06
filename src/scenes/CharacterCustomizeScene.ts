import Phaser from 'phaser';

export class CharacterCustomizeScene extends Phaser.Scene {
  constructor() {
    super('CharacterCustomizeScene');
  }
  preload(){
    this.load.image('player1','assets/player1.webp');
    this.load.image('player2','assets/player2.webp');
    this.load.image('player3','assets/player3.png');
  }
  create() {
    this.add.text(290, 20, 'Choose your character!', { color: '#000' });
    const player1 = this.add.image(150, 320,'player1');
    player1.setDisplaySize(200,200);
    this.add.text(80, 440, 'RED SHY GUY', { color: '#000' });

    player1.setInteractive({ useHandCursor: true });
    player1.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'player1');
      this.registry.set('selectedCharacterLabel', 'RED SHY GUY');
      this.scene.start('ChooseStudySpotScene');
    });

    const player2 = this.add.image(370,320,'player2');
    player2.setDisplaySize(200,200);
    this.add.text(290, 440, 'BLACK SHY GUY', { color: '#000' });

    player2.setInteractive({ useHandCursor: true });
    player2.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'player2');
      this.registry.set('selectedCharacterLabel', 'BLACK SHY GUY');
      this.scene.start('ChooseStudySpotScene');
    });

    const player3 = this.add.image(590,330,'player3');
    player3.setDisplaySize(200,200);
    this.add.text(520, 440, 'BLUE SHY GUY', { color: '#000' });

    player3.setInteractive({ useHandCursor: true });
    player3.on('pointerdown', () => {
      this.registry.set('selectedCharacter', 'player3');
      this.registry.set('selectedCharacterLabel', 'BLUE SHY GUY');
      this.scene.start('ChooseStudySpotScene');
    });

  }
}