import Phaser from 'phaser';

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
    this.load.aseprite('start_study_button', 'assets/start_study_button.png', 'assets/start_study_button.json');
    this.load.image('clock_button', 'assets/clock_button.png')
    this.load.image('pick_time', 'assets/pick_time.png')
    this.load.aseprite('task_bar', 'assets/task_bar.png', 'assets/task_bar.json');
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

    const task_bar = this.add.sprite(187, 78, 'task_bar')
    const pick_time_button = this.add.sprite(201, 106, 'pick_time')
    pick_time_button.setVisible(false); // hidden until clock button is clicked
    const start_study_button = this.add.sprite(182, 117, 'start_study_button')
    const clock_button = this.add.image(201, 117, 'clock_button')

    const chosenKey = this.registry.get('selectedCharacter') ?? 'girl_player';
    const player = this.add.sprite(64, 35, chosenKey);
    const animKey = chosenKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';
    const typingKey = chosenKey === 'girl_player' ? 'typing' : 'typing_boy';
    player.play({ key: animKey, repeat: -1 });

    const table = this.add.image(104, 50, 'olin_table');
    const light = this.add.image(104, 42, 'light');

    const table2 = this.add.image(104, 80, 'olin_table');
    const light2 = this.add.image(104, 72, 'light');

    const table3 = this.add.image(104, 110, 'olin_table');
    const light3 = this.add.image(104, 102, 'light');

    //TASK BAR CODE
    type Task = { id: number; text: string; completed: boolean };
    const MAX_TASKS = 6;

    const getTasks = (): Task[] => this.registry.get('taskList') ?? [];

    const overlayEl = document.getElementById('task-list-overlay') as HTMLDivElement;

    const renderTaskList = () => {
      const tasks = getTasks();
      task_bar.setFrame(tasks.length);

      overlayEl.style.display = 'flex';
      overlayEl.style.flexDirection = 'column';
      overlayEl.style.justifyContent = 'flex-end'; // stacks content from the bottom up
      overlayEl.style.height = '60px'; // <-- needs a real height for flex-end to have room to push content upward within

      overlayEl.innerHTML = tasks.map(task => `
  <div style="
  position: relative;
  width: 8px;  
  color: white;
  font-size: 10px;
  font-family: sans-serif;
  margin-bottom: 16px;
">
    <span style="
      text-decoration: ${task.completed ? 'line-through' : 'none'};
      opacity: ${task.completed ? 0.6 : 1};
    ">${task.text}</span>

    <div class="delete-zone" data-id="${task.id}" style="
      position: absolute;
      left: -7px;
      top: -5px;
      width: 6px;
      height: 6px;
      pointer-events: auto;
      cursor: pointer;
    "></div>

    <div class="check-btn" data-id="${task.id}" style="
      position: absolute;
      right: -81px;
      top: 0.5px;
      width: 12px;
      height: 9px;
      pointer-events: auto;
      cursor: pointer;
    "></div>
  </div>
`).join('');
      overlayEl.querySelectorAll('.delete-zone').forEach(el => {
        el.addEventListener('click', () => {
          const id = Number((el as HTMLElement).dataset.id);
          setTasks(getTasks().filter(t => t.id !== id));
        });
      });

      overlayEl.querySelectorAll('.check-btn').forEach(el => {
        el.addEventListener('click', () => {
          const id = Number((el as HTMLElement).dataset.id);
          setTasks(getTasks().map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        });
      });
    };
    const positionOverlay = () => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();

      overlayEl.style.left = `${rect.left + 520}px`;
      overlayEl.style.top = `${rect.top + 255}px`;
      overlayEl.style.display = 'block';
    };
    const setTasks = (tasks: Task[]) => {
      this.registry.set('taskList', tasks);
      renderTaskList();
    };

    positionOverlay();
    renderTaskList();

    const inputEl = document.getElementById('task-input') as HTMLInputElement;

    const showTaskInput = () => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const zoom = 3;

      const worldX = 175;
      const worldY = 105;

      inputEl.style.left = `${rect.left + worldX * zoom}px`;
      inputEl.style.top = `${rect.top + worldY * zoom}px`;
      inputEl.style.display = 'block';
      inputEl.focus();
    };

    const hideTaskInput = () => {
      inputEl.style.display = 'none';
      inputEl.blur();
    };

    let justOpened = false;

    task_bar.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(7, 57, 25, 7),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    const handleOutsideClick = (e: MouseEvent) => {
      if (justOpened) {
        justOpened = false;
        return;
      }
      if (e.target !== inputEl && inputEl.style.display !== 'none') {
        hideTaskInput();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    const handleTaskInputKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const text = inputEl.value.trim();
        const tasks = getTasks();

        if (text.length > 0 && tasks.length < MAX_TASKS) {
          setTasks([...tasks, { id: Date.now(), text, completed: false }]);
        }

        inputEl.value = '';
        hideTaskInput();
      } else if (e.key === 'Escape') {
        inputEl.value = '';
        hideTaskInput();
      }
    };
    inputEl.addEventListener('keydown', handleTaskInputKeydown);

    task_bar.on('pointerdown', () => {
      if (getTasks().length >= MAX_TASKS) {
        return;
      }
      showTaskInput();
      justOpened = true;
    });

    // STUDY SESSION CODE

    const pickTimeEl = document.getElementById('pick-time-overlay') as HTMLDivElement;
    let statusTween: Phaser.Tweens.Tween | null = null;
    let studyRunning = false;

    const positionPickTimeOverlay = () => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const zoom = 3;

      const worldX = 201 - pick_time_button.displayWidth / 2;
      const worldY = 106 - pick_time_button.displayHeight / 2;

      pickTimeEl.style.left = `${rect.left + worldX * zoom}px`;
      pickTimeEl.style.top = `${rect.top + worldY * zoom}px`;
    };

    const hidePickTime = () => {
      pickTimeEl.style.display = 'none';
      pickTimeEl.innerHTML = '';
      pick_time_button.setVisible(false);
    };

    const showPickTime = () => {
      hideTaskInput();
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
      player.play({ key: animKey, repeat: -1 }); // back to idle

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
      document.removeEventListener('mousedown', handleOutsideClick);
      inputEl.removeEventListener('keydown', handleTaskInputKeydown);
      overlayEl.style.display = 'none';
      overlayEl.innerHTML = '';
      hidePickTime();
      if (statusTween) statusTween.stop();
    });
  }
}