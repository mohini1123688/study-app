import Phaser from 'phaser';

export class BDScene extends Phaser.Scene {
  constructor() {
    super('BDScene');
  }
  preload() {
    this.load.image('bd_interior','assets/bd_interior.jpg');
  }
  create() {
    const bg = this.add.image(400,300,'bd_interior')
    bg.setOrigin(0.5)
    bg.setDisplaySize(800, 600);

    const chosenKey = this.registry.get('selectedCharacter');
    const player = this.add.image(250, 450, chosenKey);
    player.setDisplaySize(100, 100);

    this.tweens.add({
      targets: player,
      y: player.y - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}