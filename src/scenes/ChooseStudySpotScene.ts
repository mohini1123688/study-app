import Phaser from 'phaser';

export class ChooseStudySpotScene extends Phaser.Scene {
  constructor() {
    super('ChooseStudySpotScene');
  }
  preload() {
    this.load.image('olin', 'assets/olin.jpg')
    this.load.image('bd', 'assets/bd.jpg')
    this.load.image('dorm', 'assets/dorm.jpg')
  }
  create() {
    this.add.text(230, 20, 'Choose where you want to study!', { color: '#000' });
    const olin = this.add.image(150,320,'olin');
    olin.setDisplaySize(200,200);
    this.add.text(130, 430, 'OLIN', { color: '#000' });

    olin.setInteractive({ useHandCursor: true });
    olin.on('pointerdown', () => {
        this.scene.start('OlinScene');
    });

    const bd = this.add.image(370,320,'bd');
    bd.setDisplaySize(200,200);
    this.add.text(350, 430, 'BD', { color: '#000' });

    bd.setInteractive({ useHandCursor: true });
    bd.on('pointerdown', () => {
        this.scene.start('BDScene');
    });

    const dorm = this.add.image(590,320,'dorm');
    dorm.setDisplaySize(200,200);
    this.add.text(570, 430, 'DORM', { color: '#000' });

    dorm.setInteractive({ useHandCursor: true });
    dorm.on('pointerdown', () => {
        this.scene.start('DormScene');
    });
  }
}