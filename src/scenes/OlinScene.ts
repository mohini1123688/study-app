import Phaser from 'phaser';

export class OlinScene extends Phaser.Scene {
  constructor() {
    super('OlinScene');
  }
  preload() {
    this.load.image('olin_interior', 'assets/olin_interior.jpg');
  }
  create() {
    const bg = this.add.image(400, 300, 'olin_interior')
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

    // Menu Bar (Home, Shop, Number of stars)
    const menu_bar = this.add.rectangle(0, 0, 800, 50, 0x000000, 0.5)
    menu_bar.setOrigin(0, 0);

    const home_button = this.add.text(20, 20, 'HOME', { color: '#fff' });
    home_button.setOrigin(0, 0);

    const shop_button = this.add.text(100, 20, 'SHOP', { color: '#fff' });
    shop_button.setOrigin(0, 0);

    const star_count = this.add.text(190, 20, 'STAR COUNT:', { color: '#fff' });
    star_count.setOrigin(0, 0);

    home_button.setInteractive({ useHandCursor: true });
    home_button.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    shop_button.setInteractive({ useHandCursor: true });
    shop_button.on('pointerdown', () => {
      this.scene.start('ShopScene');
    });

    // Start study session (Choose which task u should do 10 min timer - at end of timer say if u were productive / 

    const startButton = this.add.text(280, 500, 'Start Study Session', {
      color: '#fff',
      fontSize: '32px',
      backgroundColor: '#1F6B54',
      padding: { x: 20, y: 10 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      startButton.destroy();

      const write_button = this.add.text(520, 500, 'Are you going to write?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'pink',
        padding: { x: 20, y: 10 },
      });
      write_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'writing');
        code_button.destroy()
        write_button.destroy()
      });

      const code_button = this.add.text(400, 500, 'SAre you going to code?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'blue',
        padding: { x: 20, y: 10 },
      });
      code_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'coding');
        code_button.destroy()
        write_button.destroy()

      });
    });

    startButton.on('pointerdown', () => {
      startButton.destroy();

      const write_button = this.add.text(520, 500, 'Are you going to write?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'pink',
        padding: { x: 20, y: 10 },
      });
      write_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'writing');
      });

      const code_button = this.add.text(400, 500, 'SAre you going to code?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'blue',
        padding: { x: 20, y: 10 },
      });
      code_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'coding');

      });
    });
    // how many words u wrote, if u were, update task bar)
  }
}