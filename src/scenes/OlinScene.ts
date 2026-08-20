import Phaser from 'phaser';
import { setupTaskBar } from './taskBar';

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
  }
  create() {
    const bg = this.add.image(104, 64, 'olin_only_room');
    bg.setOrigin(0.5);

    const home_button = this.add.image(5, 123, 'home_button');

    home_button.setInteractive({ useHandCursor: true });
    home_button.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    const status_bar = this.add.sprite(104, 8, 'status_bar')

    const task_bar = this.add.sprite(213, 80, 'task_bar')
    const pick_time_button = this.add.sprite(201, 106, 'pick_time')
    pick_time_button.setVisible(false);
    const start_study_button = this.add.sprite(178, 117, 'start_study_button')
    const clock_button = this.add.image(199, 117, 'clock_button')

    const chosenKey = this.registry.get('selectedCharacter') ?? 'girl_player';
    const player = this.add.sprite(64, 35, chosenKey);
    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    const typingKey = chosenKey === 'girl_player' ? 'typing' : 'typing_boy';
    const danceKey = chosenKey === 'girl_player' ? 'dance' : 'dancing_boy';
    player.play({ key: animKey, repeat: -1 });

    const table = this.add.image(104, 50, 'olin_table');
    const light = this.add.image(104, 42, 'light');

    const table2 = this.add.image(104, 80, 'olin_table');
    const light2 = this.add.image(104, 72, 'light');

    const table3 = this.add.image(104, 110, 'olin_table');
    const light3 = this.add.image(104, 102, 'light');

    // --- WORLD -> SCREEN HELPER ---
    // Converts a world-space (game coordinate) point to real screen CSS pixels,
    // accounting for whatever the canvas is actually rendered at (zoom + any
    // additional CSS scaling), rather than hardcoding a zoom constant.
    const worldToScreen = (worldX: number, worldY: number) => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width / this.scale.width;
      const sy = rect.height / this.scale.height;
      return {
        x: rect.left + worldX * sx,
        y: rect.top + worldY * sy,
      };
    };

    // TASK BAR — logic lives in taskBar.ts, this just wires it up
    const taskBar = setupTaskBar(this, task_bar);

    // STUDY SESSION CODE

    const pickTimeEl = document.getElementById('pick-time-overlay') as HTMLDivElement;
    let statusTween: Phaser.Tweens.Tween | null = null;
    let studyRunning = false;

    // Rewritten to use the shared helper instead of a hardcoded zoom constant.
    const positionPickTimeOverlay = () => {
      const worldX = 201 - pick_time_button.displayWidth / 2;
      const worldY = 106 - pick_time_button.displayHeight / 2;

      const { x, y } = worldToScreen(worldX, worldY);
      pickTimeEl.style.left = `${x}px`;
      pickTimeEl.style.top = `${y}px`;
    };

    const hidePickTime = () => {
      pickTimeEl.style.display = 'none';
      pickTimeEl.innerHTML = '';
      pick_time_button.setVisible(false);
    };

    const showPickTime = () => {
      positionPickTimeOverlay();
      pick_time_button.setVisible(true);

      pickTimeEl.innerHTML = `
        <span class="time-25" style="
          position: absolute;
          left: 7px;
          top: 5px;
          color: black;
          font-size: 10px;
          cursor: pointer;
          pointer-events: auto;
        ">25</span>

        <span class="time-60" style="
          position: absolute;
          left: 7px;
          top: 20px;
          color: black;
          font-size: 10px;
          cursor: pointer;
          pointer-events: auto;
        ">60</span>
      `;
      pickTimeEl.style.display = 'block';

      pickTimeEl.querySelector('.time-25')!.addEventListener('click', () => {
        this.registry.set('timeSelected', 'twenty_five');
        hidePickTime();
      });
      pickTimeEl.querySelector('.time-60')!.addEventListener('click', () => {
        this.registry.set('timeSelected', 'sixty_min');
        hidePickTime();
      });
    };

    clock_button.setInteractive({ useHandCursor: true });
    clock_button.on('pointerdown', () => {
      showPickTime();
    });

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
      const durationMs = 15000;

      studyRunning = true;
      start_study_button.setFrame(1);
      status_bar.setFrame(0);

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

      hideAllStudyItems();
      player.play({ key: animKey, repeat: -1 }); // back to idle
    };

    const finishStudySession = () => {
      studyRunning = false;
      start_study_button.setFrame(0);
      statusTween = null;

      hideAllStudyItems();
      player.play({ key: danceKey, repeat: -1 }); // back to idle

      // reward logic goes here later
    };

    start_study_button.setInteractive({ useHandCursor: true });
    start_study_button.on('pointerdown', () => {
      if (studyRunning) {
        stopStudySession();
      } else {
        startStudySession();
      }
    });

    this.events.once('shutdown', () => {
      taskBar.destroy();
      hidePickTime();
      if (statusTween) statusTween.stop();
    });
  }
}