import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }
  preload() {
    this.load.image('player4', 'assets/player4.webp');
    this.load.image('player5', 'assets/player5.jpg');
  }
  create() {
    // Menu Bar (Home, Shop, Number of stars)
    const menu_bar = this.add.rectangle(0, 0, 800, 50, 0x000000, 0.5);
    menu_bar.setOrigin(0, 0);

    const home_button = this.add.text(20, 20, 'HOME', { color: '#fff' });
    home_button.setOrigin(0, 0);
    home_button.setInteractive({ useHandCursor: true });
    home_button.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    const shop_button = this.add.text(100, 20, 'SHOP', { color: '#fff' });
    shop_button.setOrigin(0, 0);

    const star_count = this.add.text(190, 20, `STAR COUNT: ${this.registry.get('stars') ?? 0}`, { color: '#fff' });
    star_count.setOrigin(0, 0);

    this.add.text(230, 150, 'Buy a new character!', { color: '#000' });

    let feedbackText: Phaser.GameObjects.Text | null = null;

    const attemptPurchase = (characterKey: string, cost: number) => {
      const currentStars = this.registry.get('stars') ?? 0;

      // Clear any previous feedback message before showing a new one
      if (feedbackText) {
        feedbackText.destroy();
      }

      if (currentStars < cost) {
        feedbackText = this.add.text(230, 550, 'Not enough stars!', {
          color: '#ff4d4d',
          fontSize: '24px',
        });
        return;
      }

      // Deduct stars, save the new character choice
      const newTotal = currentStars - cost;
      this.registry.set('stars', newTotal);
      this.registry.set('selectedCharacter', characterKey);
      star_count.setText(`STAR COUNT: ${newTotal}`);

      feedbackText = this.add.text(230, 550, 'Great! You are now this character.', {
        color: '#1F6B54',
        fontSize: '24px',
      });

      // Give the player a moment to see the message, then send them back
      this.time.delayedCall(1200, () => {
        this.scene.start('OlinScene');
      });
    };

    const player4 = this.add.image(200, 320, 'player4');
    player4.setDisplaySize(200, 250);
    this.add.text(180, 460, 'YOSHI', { color: '#000' });
    this.add.text(130, 490, 'COST: 100 STARS', { color: '#000' });

    player4.setInteractive({ useHandCursor: true });
    player4.on('pointerdown', () => {
      attemptPurchase('player4', 100);
    });

    const player5 = this.add.image(500, 320, 'player5');
    player5.setDisplaySize(200, 250);
    this.add.text(470, 460, 'SNOOPY', { color: '#000' });
    this.add.text(430, 490, 'COST: 5 STARS', { color: '#000' });

    player5.setInteractive({ useHandCursor: true });
    player5.on('pointerdown', () => {
      attemptPurchase('player5', 5);
    });
  }
}