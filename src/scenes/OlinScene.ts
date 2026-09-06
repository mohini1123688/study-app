import Phaser from 'phaser';
import { setupTaskBar } from './taskBar';
import { setupMultiplayer } from './multiplayer';
import { setupTimerDisplay } from './timerDisplay';
import { setupPickTimeMenu } from './pickTimeMenu';
import { setupCompletedSession } from './completedSession';
import { setupCompletionAnimation } from './completionAnimation';
import { setupOwnUsernameLabel } from './usernameLabel';
import { setupStudyItems } from './studyItems';
import { supabase } from '../supabaseClient';
import { setupProfilePopup } from './profilePopup';

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
    bg.setDepth(-10);

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
    table.setDepth(1);
    const light = this.add.image(104, 42, 'light');
    light.setDepth(2);
    const table2 = this.add.image(104, 80, 'olin_table');
    table2.setDepth(1);
    const light2 = this.add.image(104, 72, 'light');
    light2.setDepth(2);
    const table3 = this.add.image(104, 110, 'olin_table');
    table3.setDepth(1);
    const light3 = this.add.image(104, 102, 'light');
    light3.setDepth(2);

    // --- PLAYER --- (moved above MULTIPLAYER since that block depends on these)
    const chosenKey = this.registry.get('selectedCharacter') ?? 'girl_player';
    const player = this.add.sprite(64, 35, chosenKey); // temp position, moved once desk is assigned
    const usernameLabel = setupOwnUsernameLabel(this, player);

    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    const typingKey = chosenKey === 'girl_player' ? 'typing' : 'typing_boy';
    const danceKey = chosenKey === 'girl_player' ? 'dance' : 'dancing_boy';
    player.play({ key: animKey, repeat: -1 });

    // --- MULTIPLAYER ---
    let multiplayer: ReturnType<typeof setupMultiplayer> | null = null;

    const getUsernameAndUserId = async (): Promise<{ username: string; userId: string }> => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { username: '???', userId: '' };

      const cachedUsername = this.registry.get('username');
      const cachedUserId = this.registry.get('cachedUserId');

      if (cachedUsername && cachedUserId === user.id) {
        return { username: cachedUsername, userId: user.id };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profile) {
        this.registry.set('username', profile.username);
        this.registry.set('cachedUserId', user.id);
        return { username: profile.username, userId: user.id };
      }
      return { username: '???', userId: user.id };
    };
    const profilePopup = setupProfilePopup(this);

    getUsernameAndUserId().then(({ username, userId }) => {
  multiplayer = setupMultiplayer(this, chosenKey, username, userId, player, () => {
    usernameLabel.reposition();
  }, (clickedUserId, clickedCharacter) => {
    profilePopup.showProfile(clickedUserId, clickedCharacter);
  });
  multiplayer.sendAnimState('idle');
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

    // --- TIMER DISPLAY ---
    const timerDisplay = setupTimerDisplay(this, 155, 6);

    // --- COMPLETION ANIMATION (extracted) ---
    const completionAnimation = setupCompletionAnimation(this);

    // --- DAILY COMPLETION TRACKING (for the heatmap) ---
    const recordDailyCompletion = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('daily_completions')
        .select('count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('daily_completions')
          .update({ count: existing.count + 1 })
          .eq('user_id', user.id)
          .eq('date', today);
      } else {
        await supabase
          .from('daily_completions')
          .insert({ user_id: user.id, date: today, count: 1 });
      }
    };

    const onTaskCompleted = () => {
      completionAnimation.play();
      recordDailyCompletion();
    };

    // --- TASK BAR ---
    const taskBar = setupTaskBar(
  this,
  task_bar,
  completionAnimation.play, // always plays, every completion
  () => pickTime.isOpen(),
  recordDailyCompletion // new 5th param — only called once per task
);

    // --- COMPLETED SESSION SCREEN (extracted) ---
    const completedSession = setupCompletedSession(this);

    // --- STUDY ITEMS (extracted) ---
    const studyItems = setupStudyItems(this, player, (item) => multiplayer?.sendStudyItem(item));

    // --- STUDY SESSION ---
    let statusTween: Phaser.Tweens.Tween | null = null;
    let studyRunning = false;

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

      studyItems.showRandom();
      player.play({ key: typingKey, repeat: -1 });
      multiplayer?.sendAnimState('typing');

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

      studyItems.hideAll();
      player.play({ key: animKey, repeat: -1 });
      multiplayer?.sendAnimState('idle');
    };

    const finishStudySession = () => {
      studyRunning = false;
      start_study_button.setFrame(0);
      statusTween = null;
      timerDisplay.setVisible(false);

      studyItems.hideAll();
      player.play({ key: danceKey, repeat: -1 });
      multiplayer?.sendAnimState('dance');

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
      profilePopup.destroy();
    });
  }
}