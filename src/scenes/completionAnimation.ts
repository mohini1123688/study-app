import Phaser from 'phaser';

export function setupCompletionAnimation(scene: Phaser.Scene) {
  scene.anims.createFromAseprite('bear_says_yay');

  const bg = scene.add.image(131, 100, 'bear_says_yay_bg');
  const bear = scene.add.sprite(133, 106, 'bear_says_yay');
  bg.setVisible(false);
  bear.setVisible(false);

  const play = () => {
    bg.setVisible(true);
    bear.setVisible(true);
    bear.play({ key: 'bear_says_yay', repeat: 0 });

    bear.once('animationcomplete', () => {
      bg.setVisible(false);
      bear.setVisible(false);
    });
  };

  return { play };
}