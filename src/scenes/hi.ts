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

    const star_count = this.add.text(190, 20, `STAR COUNT: ${this.registry.get('stars') ?? 0}`, { color: '#fff' });
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

    const startButton = this.add.text(420, 500, 'Start Study Session', {
      color: '#fff',
      fontSize: '32px',
      backgroundColor: '#1F6B54',
      padding: { x: 20, y: 10 },
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      startButton.destroy();

      const write_button = this.add.text(300, 400, 'Are you going to write?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'pink',
        padding: { x: 20, y: 10 },
      });
      write_button.setInteractive({ useHandCursor: true });
      write_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'writing');
        code_button.destroy()
        write_button.destroy()
        pickTime()
      });

      const code_button = this.add.text(300, 500, 'Are you going to code?', {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'blue',
        padding: { x: 20, y: 10 },
      });
      code_button.setInteractive({ useHandCursor: true });
      code_button.on('pointerdown', () => {
        this.registry.set('taskSelected', 'coding');
        code_button.destroy()
        write_button.destroy()
        pickTime()
      });
      const pickTime = () => {
        const twenty_five_min_button = this.add.text(300, 400, 'Study for 25 min', {
          color: '#fff',
          fontSize: '32px',
          backgroundColor: 'pink',
          padding: { x: 20, y: 10 },
        });
        twenty_five_min_button.setInteractive({ useHandCursor: true });
        twenty_five_min_button.on('pointerdown', () => {
          this.registry.set('timeSelected', 'twenty_five');
          twenty_five_min_button.destroy()
          one_hour_button.destroy()
          startTask()
        });
        const one_hour_button = this.add.text(300, 500, 'Study for one hour', {
          color: '#fff',
          fontSize: '32px',
          backgroundColor: 'blue',
          padding: { x: 20, y: 10 },
        });
        one_hour_button.setInteractive({ useHandCursor: true });
        one_hour_button.on('pointerdown', () => {
          this.registry.set('timeSelected', 'sixty_min');
          twenty_five_min_button.destroy()
          one_hour_button.destroy()
          startTask()
        });
      };
    });
    // as time passes update task bar
    const startTask = () => {
      const task = this.registry.get('taskSelected');
      const label = task === 'writing' ? 'Writing...' : 'Coding...';

      const task_animation = this.add.text(110, 180, label, {
        color: '#fff',
        fontSize: '32px',
        backgroundColor: 'pink',
        padding: { x: 20, y: 10 },
      });
      task_animation.setOrigin(0, 0);
      //Create a task bar
      const barX = 450, barY = 20, barWidth = 400, barHeight = 30;

      const barBackground = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333);
      barBackground.setOrigin(0, 0.5);

      const barFill = this.add.rectangle(barX, barY, barWidth, barHeight, 0x1F6B54);
      barFill.setOrigin(0, 0.5);
      barFill.scaleX = 0; // starts empty

      const timeSelected = this.registry.get('timeSelected');
      const durationMs = timeSelected === 'twenty_five' ? 5000 : 10000;

      this.tweens.add({
        targets: barFill,
        scaleX: 1,
        duration: durationMs,
        ease: 'Linear',
        onComplete: () => {
          finishSession(timeSelected, task_animation, barBackground, barFill);
        },
      });

      const finishSession = (
        timeSelected: string,
        task_animation: Phaser.GameObjects.Text,
        barBackground: Phaser.GameObjects.Rectangle,
        barFill: Phaser.GameObjects.Rectangle
      ) => {
        task_animation.destroy();
        barBackground.destroy();
        barFill.destroy();

        const starsEarned = timeSelected === 'twenty_five' ? 100 : 7;
        const currentStars = this.registry.get('stars') ?? 0;
        const newTotal = currentStars + starsEarned;
        this.registry.set('stars', newTotal);

        star_count.setText(`STAR COUNT: ${newTotal}`);

        const doneText = this.add.text(190, 400, `Nice work! +${starsEarned} stars`, {
          color: 'black',
          fontSize: '28px',
          backgroundColor: 'yellow',
          padding: { x: 20, y: 10 },
        });
        doneText.setOrigin(0, 0);
      };
    }
  }
}