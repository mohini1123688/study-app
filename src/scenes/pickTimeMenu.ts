import Phaser from 'phaser';
import { setupPickedTimeDisplay } from './timerDisplay';

export function setupPickTimeMenu(scene: Phaser.Scene) {
  const time_pop_up = scene.add.image(104, 75, 'time_pop_up');
  const twenty_five_button = scene.add.sprite(104, 67, 'twenty_five_button');
  const sixty_min_button = scene.add.sprite(104, 83, 'sixty_min_button');
  const custom_min_button = scene.add.sprite(104, 99, 'custom_min_button');

  time_pop_up.setVisible(false);
  twenty_five_button.setVisible(false);
  sixty_min_button.setVisible(false);
  custom_min_button.setVisible(false);

  let pickTimeOpen = true;

  const pickedTimeDisplay = setupPickedTimeDisplay(scene, 155, 6);

  const hide = () => {
    time_pop_up.setVisible(false);
    twenty_five_button.setVisible(false);
    sixty_min_button.setVisible(false);
    custom_min_button.setVisible(false);
    pickTimeOpen = false;
  };

  const show = () => {
    time_pop_up.setVisible(true);
    twenty_five_button.setVisible(true);
    sixty_min_button.setVisible(true);
    custom_min_button.setVisible(true);
    pickTimeOpen = true;
  };

  twenty_five_button.setInteractive({ useHandCursor: true });
  sixty_min_button.setInteractive({ useHandCursor: true });
  custom_min_button.setInteractive({ useHandCursor: true });

  twenty_five_button.on('pointerover', () => twenty_five_button.setFrame(1));
  twenty_five_button.on('pointerout', () => twenty_five_button.setFrame(0));
  twenty_five_button.on('pointerdown', () => {
    pickedTimeDisplay.setNumber(25);
    pickedTimeDisplay.setVisible(true);
    scene.registry.set('timeSelected', 'twenty_five');
    hide();
  });

  sixty_min_button.on('pointerover', () => sixty_min_button.setFrame(1));
  sixty_min_button.on('pointerout', () => sixty_min_button.setFrame(0));
  sixty_min_button.on('pointerdown', () => {
    pickedTimeDisplay.setNumber(60);
    pickedTimeDisplay.setVisible(true);
    scene.registry.set('timeSelected', 'sixty_min');
    hide();
  });

  custom_min_button.on('pointerover', () => custom_min_button.setFrame(1));
  custom_min_button.on('pointerout', () => custom_min_button.setFrame(0));
  // no pointerdown for custom yet

  show(); // starts open, matching original behavior

  return {
    hide,
    show,
    isOpen: () => pickTimeOpen,
    pickedTimeDisplay,
    setVisible: (visible: boolean) => {
      time_pop_up.setVisible(visible && pickTimeOpen);
      twenty_five_button.setVisible(visible && pickTimeOpen);
      sixty_min_button.setVisible(visible && pickTimeOpen);
      custom_min_button.setVisible(visible && pickTimeOpen);
    },
  };
}