import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }
  preload() {
    this.load.image('player4', 'assets/player4.webp')
    this.load.image('player5', 'assets/player5.jpg')
  }
  create() {
    this.add.text(230, 20, 'Buy a new character!', { color: '#000' });

    const player4 = this.add.image(200,320,'player4');
    player4.setDisplaySize(200,250);
    this.add.text(180, 460, 'YOSHI', { color: '#000' });
    this.add.text(130, 490, 'COST: 100 STARS', { color: '#000' });

    player4.setInteractive({ useHandCursor: true });
    player4.on('pointerdown', () => {
        this.scene.start('OlinScene');
    });

    const player5 = this.add.image(500,320,'player5');
    player5.setDisplaySize(200,250);
    this.add.text(470, 460, 'SNOOPY', { color: '#000' });
    this.add.text(430, 490, 'COST: 5 STARS', { color: '#000' });

    player5.setInteractive({ useHandCursor: true });
    player5.on('pointerdown', () => {
        this.scene.start('BDScene');
    });

  }
}