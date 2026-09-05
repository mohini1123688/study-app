import Phaser from 'phaser';
import { setupTaskBar } from './taskBar';
import { setupMultiplayer } from './multiplayer';
import { setupTimerDisplay } from './timerDisplay';
import { setupPickTimeMenu } from './pickTimeMenu';
import { setupCompletedSession } from './completedSession';
import { setupCompletionAnimation } from './completionAnimation';
import { setupOwnUsernameLabel } from './usernameLabel';
import { supabase } from '../supabaseClient';

export class OlinScene extends Phaser.Scene {
  constructor() {
    super('OlinScene');
  }
  preload() {
    this.load.image('light', 'assets/light.png');
    this.load.image('chair', 'assets/chair.png');
    this.load.image('paper_and_pencil', 'assets/paper_and_pencil.png')
    this.load.image('laptop', 'assets/laptop.png')
    this.load.image('book', 'assets/book.png')
    this.load.image('home_button', 'assets/home_button.png')
    this.load.image('olin_only_room', 'assets/olin_only_room.png');
    this.load.image('olin_table', 'assets/olin_table.png');
    this.load.image('delete_button', 'assets/delete_button.png')
    this.load.aseprite('start_study_button', 'assets/start_study_button.png', 'assets/start_study_button.json');
    this.load.image('clock_button', 'assets/clock_button.png')
    this.load.image('pick_time', 'assets/pick_time.png')
    this.load.aseprite('task_bar', 'assets/new_taskbar.png', 'assets/new_taskbar.json');
    this.load.aseprite('status_bar', 'assets/status_bar.png', 'assets/status_bar.json');
    this.load.aseprite('girl_player', 'assets/good_sprite_outline_girl.png', 'assets/good_sprite_outline_girl.json');
    this.load.aseprite('boy_player', 'assets/good_sprite_outline.png', 'assets/good_sprite_outline.json');

    this.load.image('time_pop_up', 'assets/time_pop_up.png');
    this.load.aseprite('twenty_five_button', 'assets/twenty_five_button.png', 'assets/twenty_five_button.json');
    this.load.aseprite('sixty_min_button', 'assets/sixty_min_button.png', 'assets/sixty_min_button.json');
    this.load.aseprite('custom_min_button', 'assets/custom_min_button.png', 'assets/custom_min_button.json');
    this.load.aseprite('time_picked', 'assets/time_picked.png', 'assets/time_picked.json');

    this.load.image('completed_session', 'assets/completed_session.png')
    this.load.image('complete_session_delete_button', 'assets/complete_session_delete_button.png')

    this.load.aseprite('numbers', 'assets/numbers.png', 'assets/numbers.json');

    this.load.aseprite('bear_says_yay', 'assets/bear_says_yay.png', 'assets/bear_says_yay.json');
    this.load.image('bear_says_yay_bg', 'assets/bear_saya_yay_bg.png')

    this.load.image('menu_button', 'assets/menu_button.png')
  }
  create() {
    const bg = this.add.image(104, 64, 'olin_only_room');
    bg.setOrigin(0.5);

    const home_button = this.add.image(5, 123, 'home_button');
    home_button.setInteractive({ useHandCursor: true });
    home_button.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    const status_bar = this.add.sprite(104, 8, 'status_bar');
    const task_bar = this.add.sprite(213, 80, 'task_bar');
    const start_study_button = this.add.sprite(178, 117, 'start_study_button');
    const clock_button = this.add.image(199, 117, 'clock_button');

    const table = this.add.image(104, 50, 'olin_table');
    const light = this.add.image(104, 42, 'light');
    const table2 = this.add.image(104, 80, 'olin_table');
    const light2 = this.add.image(104, 72, 'light');
    const table3 = this.add.image(104, 110, 'olin_table');
    const light3 = this.add.image(104, 102, 'light');

    // --- PLAYER ---
    const chosenKey = this.registry.get('selectedCharacter') ?? 'girl_player';
    const player = this.add.sprite(64, 35, chosenKey); // temp position, moved once desk is assigned
    const usernameLabel = setupOwnUsernameLabel(this, player);

    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    const typingKey = chosenKey === 'girl_player' ? 'typing' : 'typing_boy';
    const danceKey = chosenKey === 'girl_player' ? 'dance' : 'dancing_boy';
    player.play({ key: animKey, repeat: -1 });

    // --- MULTIPLAYER ---
    let multiplayer: { destroy: () => void } | null = null;

    const getUsername = async (): Promise<string> => {
      const cached = this.registry.get('username');
      if (cached) return cached;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return '???';

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profile) {
        this.registry.set('username', profile.username);
        return profile.username;
      }
      return '???';
    };

    getUsername().then((username) => {
      multiplayer = setupMultiplayer(this, chosenKey, username, player);
    });

    // --- MENU TOGGLE ---
    const menu_button = this.add.image(202, 6, 'menu_button');
    menu_button.setInteractive({ useHandCursor: true });
    let menuOpen = true;

    menu_button.on('pointerdown', () => {
      menuOpen = !menuOpen;
      task_bar.setVisible(menuOpen);
      start_study_button.setVisible(menuOpen);
      clock_button.setVisible(menuOpen);
      taskBar.setVisible(menuOpen);
    });

    // --- PICK-TIME MENU (extracted) ---
    const pickTime = setupPickTimeMenu(this);

    clock_button.setInteractive({ useHandCursor: true });
    clock_button.on('pointerdown', () => {
      if (!studyRunning) {
        if (pickTime.isOpen()) {
          pickTime.hide();
        } else {
          pickTime.show();
        }
      }
    });

    // --- TIMER DISPLAY (full MM:SS countdown, shown during a session) ---
    const timerDisplay = setupTimerDisplay(this, 155, 6);

    // --- COMPLETION ANIMATION (extracted) ---
    const completionAnimation = setupCompletionAnimation(this);

    // --- TASK BAR ---
    const taskBar = setupTaskBar(this, task_bar, completionAnimation.play, () => pickTime.isOpen());

    // --- COMPLETED SESSION SCREEN (extracted) ---
    const completedSession = setupCompletedSession(this);

    // --- STUDY SESSION ---
    let statusTween: Phaser.Tweens.Tween | null = null;
    let studyRunning = false;

    const paper_and_pencil = this.add.image(65, 45, 'paper_and_pencil');
    const laptop = this.add.image(64, 46, 'laptop');
    const book = this.add.image(64, 46, 'book');
    paper_and_pencil.setVisible(false);
    laptop.setVisible(false);
    book.setVisible(false);

    const studyItems = [paper_and_pencil, laptop, book];

    const hideAllStudyItems = () => {
      studyItems.forEach(item => item.setVisible(false));
    };

    const showRandomStudyItem = () => {
      hideAllStudyItems();
      const randomItem = Phaser.Utils.Array.GetRandom(studyItems);
      randomItem.setVisible(true);
    };

    const startStudySession = () => {
      const timeSelected = this.registry.get('timeSelected') ?? 'twenty_five';
      const totalSeconds = timeSelected === 'sixty_min' ? 60 * 60 : 25 * 60;
      const durationMs = 15000;

      studyRunning = true;
      start_study_button.setFrame(1);
      status_bar.setFrame(0);

      pickTime.pickedTimeDisplay.setVisible(false);
      timerDisplay.setVisible(true);
      timerDisplay.updateDigits(totalSeconds);

      showRandomStudyItem();
      player.play({ key: typingKey, repeat: -1 });

      const progress = { frame: 0 };
      statusTween = this.tweens.add({
        targets: progress,
        frame: 30,
        duration: durationMs,
        ease: 'Linear',
        onUpdate: () => {
          status_bar.setFrame(Math.floor(progress.frame));
          const remainingSeconds = totalSeconds * (1 - progress.frame / 30);
          timerDisplay.updateDigits(remainingSeconds);
        },
        onComplete: () => {
          finishStudySession();
        },
      });
    };

    const stopStudySession = () => {
      if (statusTween) {
        statusTween.stop();
        statusTween = null;
      }
      studyRunning = false;
      start_study_button.setFrame(0);
      status_bar.setFrame(0);
      timerDisplay.setVisible(false);

      hideAllStudyItems();
      player.play({ key: animKey, repeat: -1 });
    };

    const finishStudySession = () => {
      studyRunning = false;
      start_study_button.setFrame(0);
      statusTween = null;
      timerDisplay.setVisible(false);

      hideAllStudyItems();
      player.play({ key: danceKey, repeat: -1 });

      completedSession.show();
    };

    start_study_button.setInteractive({ useHandCursor: true });
    start_study_button.on('pointerdown', () => {
      if (pickTime.isOpen()) return;

      if (studyRunning) {
        stopStudySession();
      } else {
        startStudySession();
      }
    });

    this.events.once('shutdown', () => {
      completedSession.destroy();
      taskBar.destroy();
      pickTime.hide();
      if (statusTween) statusTween.stop();
      multiplayer?.destroy();
      usernameLabel.destroy();
    });
  }
}