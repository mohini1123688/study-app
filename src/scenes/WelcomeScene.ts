import Phaser from 'phaser';

export class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }
  create() {
    this.add.text(20, 20, 'Welcome — coming soon', { color: '#000' });
  }
}