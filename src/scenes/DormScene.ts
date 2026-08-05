import Phaser from 'phaser';

export class DormScene extends Phaser.Scene {
  constructor() {
    super('DormScene');
  }
  create() {
    this.add.text(20, 20, 'Olin — coming soon', { color: '#000' });
  }
}