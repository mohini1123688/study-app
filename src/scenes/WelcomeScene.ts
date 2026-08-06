import Phaser from 'phaser';

export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }
  preload(){
    this.load.image('washu', 'assets/WashU-Law-Campus-04-small.webp');
  }
  create() {
    const bg = this.add.image(400, 300, 'washu');
    bg.setDisplaySize(800, 600);
    this.add.text(280, 20, 'STUDY AT WASHU!', {
        color: '#fff',
        fontSize: '28px',
        stroke: '#000',
        strokeThickness: 4,
    });
    const startButton = this.add.text(400, 500, 'Start', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: '#1F6B54',
        padding: { x: 20, y: 10 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
        this.scene.start('CharacterCustomizeScene');
  });
  }
}