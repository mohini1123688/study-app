import Phaser from 'phaser';
import { setupTaskBar } from './taskBar';
import { setupMultiplayer } from './multiplayer';

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
    const multiplayer = setupMultiplayer(this, chosenKey);


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

    const time_pop_up = this.add.image(104, 75, 'time_pop_up')

    const twenty_five_button = this.add.sprite(104, 67, 'twenty_five_button')
    const sixty_min_button = this.add.sprite(104, 83, 'sixty_min_button')
    const custom_min_button = this.add.sprite(104, 99, 'custom_min_button')

    const completed_session = this.add.image(104, 75, 'completed_session');
    completed_session.setVisible(false);
    const complete_session_delete_button = this.add.image(82, 44, 'complete_session_delete_button');
    complete_session_delete_button.setInteractive({ useHandCursor: true });
    complete_session_delete_button.setVisible(false)
    complete_session_delete_button.setDepth(101);

    time_pop_up.setVisible(false)
    twenty_five_button.setVisible(false)
    sixty_min_button.setVisible(false)
    custom_min_button.setVisible(false)

    let pickTimeOpen = true;

    const hidePickTime = () => {
      time_pop_up.setVisible(false)
      twenty_five_button.setVisible(false)
      sixty_min_button.setVisible(false)
      custom_min_button.setVisible(false)
      pickTimeOpen = false;
    };

    const showPickTime = () => {
      time_pop_up.setVisible(true)
      twenty_five_button.setVisible(true)
      sixty_min_button.setVisible(true)
      custom_min_button.setVisible(true)
      pickTimeOpen = true;
    };

    const time_picked = this.add.sprite(155, 6, 'time_picked')
    time_picked.setVisible(false);

    twenty_five_button.setInteractive({ useHandCursor: true });
    sixty_min_button.setInteractive({ useHandCursor: true });
    custom_min_button.setInteractive({ useHandCursor: true });

    twenty_five_button.on('pointerover', () => {
      twenty_five_button.setFrame(1);
    });

    twenty_five_button.on('pointerout', () => {
      twenty_five_button.setFrame(0);
    });

    twenty_five_button.on('pointerdown', () => {
      time_picked.setVisible(true);
      this.registry.set('timeSelected', 'twenty_five');
      time_picked.setFrame(0);
      hidePickTime()
    });

    sixty_min_button.on('pointerover', () => {
      sixty_min_button.setFrame(1);
    });

    sixty_min_button.on('pointerout', () => {
      sixty_min_button.setFrame(0);
    });

    sixty_min_button.on('pointerdown', () => {
      time_picked.setVisible(true);
      this.registry.set('timeSelected', 'sixty_min');
      time_picked.setFrame(1);
      hidePickTime()
    });

    custom_min_button.on('pointerover', () => {
      custom_min_button.setFrame(1);
    });

    custom_min_button.on('pointerout', () => {
      custom_min_button.setFrame(0);
    });
    //No pointer down for custom...havent deisgned that yet!

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
    showPickTime()

    clock_button.setInteractive({ useHandCursor: true });
    clock_button.on('pointerdown', () => {
      if (!studyRunning) {
        if (pickTimeOpen) {
          hidePickTime();
        } else {
          showPickTime();
        }
      }
    });

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

    const completedSessionEl = document.getElementById('completed-session-overlay') as HTMLDivElement;

    const positionCompletedOverlay = () => {
      const originX = completed_session.x - completed_session.displayWidth / 2;
      const originY = completed_session.y - completed_session.displayHeight / 2;

      const { x, y } = worldToScreen(originX, originY);
      completedSessionEl.style.left = `${x}px`;
      completedSessionEl.style.top = `${y}px`;

      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width / this.scale.width;
      const sy = rect.height / this.scale.height;

      // match this to completed_session's actual displayed size
      completedSessionEl.style.width = `${completed_session.displayWidth * sx}px`;
      completedSessionEl.style.height = `${completed_session.displayHeight * sy}px`;
      completedSessionEl.style.paddingTop = '18px';

      completedSessionEl.style.display = 'flex';
      completedSessionEl.style.flexDirection = 'column';
      completedSessionEl.style.justifyContent = 'center';
    };

    const renderCompletedList = () => {
      const tasks = this.registry.get('taskList') ?? [];
      const completedTasks = tasks.filter((t: { completed: boolean }) => t.completed);

      completedSessionEl.innerHTML = completedTasks.length === 0
        ? `<div style="
      color: black;
      font-size: 12px;
      font-family: sans-serif;
      text-align: center;
    ">No completed tasks yet!</div>`
        : completedTasks.map(task => `
      <div style="
        color: black;
        font-size: 12px;
        font-family: sans-serif;
        text-align: center;
        margin-bottom: 4px;
      ">
        ${task.text}
      </div>
    `).join('');
    };


    const finishStudySession = () => {
      studyRunning = false;
      start_study_button.setFrame(0);
      statusTween = null;

      hideAllStudyItems();
      player.play({ key: danceKey, repeat: -1 }); // back to idle

      completed_session.setVisible(true)
      complete_session_delete_button.setVisible(true)
      positionCompletedOverlay();
      renderCompletedList();

      // reward logic goes here later
    };

    complete_session_delete_button.on('pointerdown', () => {
      completed_session.setVisible(false);
      complete_session_delete_button.setVisible(false);
      completedSessionEl.style.display = 'none';
    });

    start_study_button.setInteractive({ useHandCursor: true });
    start_study_button.on('pointerdown', () => {
      if (studyRunning) {
        stopStudySession();
      } else {
        startStudySession();
      }
    });

    this.events.once('shutdown', () => {
      completedSessionEl.style.display = 'none';
      completedSessionEl.innerHTML = '';
      taskBar.destroy();
      hidePickTime();
      if (statusTween) statusTween.stop();
      multiplayer.destroy();
    });
  }
}