import Phaser from 'phaser';

export class OlinScene extends Phaser.Scene {
  constructor() {
    super('OlinScene');
  }
  create() {
    this.add.text(20, 20, 'Olin — coming soon', { color: '#000' });
  }
}