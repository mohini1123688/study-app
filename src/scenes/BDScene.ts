import Phaser from 'phaser';

export class BDScene extends Phaser.Scene {
  constructor() {
    super('BDScene');
  }
  create() {
    this.add.text(20, 20, 'Olin — coming soon', { color: '#000' });
  }
}