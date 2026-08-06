import Phaser from 'phaser';

export class DormScene extends Phaser.Scene {
  constructor() {
    super('DormScene');
  }
  preload() {
    this.load.image('dorm_interior','assets/dorm.jpg');
  }
  create() {
    const bg = this.add.image(400,300,'dorm_interior')
    bg.setOrigin(0.5)
    bg.setDisplaySize(800, 600);

    const chosenKey = this.registry.get('selectedCharacter');
    const player = this.add.image(220, 300, chosenKey);
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