import Phaser from 'phaser';

export class CharacterCustomizeScene extends Phaser.Scene {
  constructor() {
    super('CharacterCustomizeScene');
  }
  create() {
    this.add.text(20, 20, 'Olin — coming soon', { color: '#000' });
  }
}