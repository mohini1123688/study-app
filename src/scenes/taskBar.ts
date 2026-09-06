import Phaser from 'phaser';

type Task = { id: number; text: string; completed: boolean; countedForHeatmap: boolean };

export function setupTaskBar(
  scene: Phaser.Scene,
  task_bar: Phaser.GameObjects.Sprite,
  onTaskCompleted?: () => void,
  isBlocked?: () => boolean,
  onFirstTimeCompleted?: () => void
) {
  const MAX_TASKS = 7;

  const getTasks = (): Task[] => scene.registry.get('taskList') ?? [];

  const overlayEl = document.getElementById('task-list-overlay') as HTMLDivElement;
  const inputEl = document.getElementById('task-input') as HTMLInputElement;
  inputEl.placeholder = 'INPUT TASK!';

  // One-time hover CSS for task rows — inline styles can't do :hover, so inject a rule
  if (!document.getElementById('task-hover-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'task-hover-style';
    styleEl.textContent = `
      .task-row .task-delete-wrap {
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .task-row:hover .task-delete-wrap {
        opacity: 1;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Converts a world-space (game coordinate) point to real screen CSS pixels,
  // accounting for whatever the canvas is actually rendered at (zoom + any
  // additional CSS scaling), rather than hardcoding a zoom constant.
  const worldToScreen = (worldX: number, worldY: number) => {
    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;
    return {
      x: rect.left + worldX * sx,
      y: rect.top + worldY * sy,
    };
  };

  const setTasks = (tasks: Task[]) => {
    scene.registry.set('taskList', tasks);
    renderTaskList();
  };

  const renderTaskList = () => {
    const tasks = getTasks();
    task_bar.setFrame(tasks.length);

    overlayEl.style.display = 'flex';
    overlayEl.style.flexDirection = 'column';
    overlayEl.style.justifyContent = 'flex-end'; // anchors content to the bottom

    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;

    const rowWidthWorld = 36;   // TUNE — match your task rectangle's width
    const rowHeightWorld = 8;   // TUNE — match your task rectangle's height

    const DEBUG_HITBOX = false; // flip to true to visualize row hitboxes

    overlayEl.innerHTML = tasks.map(task => `
      <div class="task-row" style="
        position: relative;
        width: ${rowWidthWorld * sx}px;
        height: ${rowHeightWorld * sy}px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: black;
        font-size: 12px;
        font-family: sans-serif;
        margin-bottom: 12px;
        pointer-events: auto;
        ${DEBUG_HITBOX ? 'outline: 1px solid red; background: rgba(255,0,0,0.15);' : ''}
      ">
        <span
          class="task-check"
          data-id="${task.id}"
          style="
            position: absolute;
            left: 91px;
            top: 7px;
            width: 10px;
            height: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: black;
            cursor: pointer;
            user-select: none;
            pointer-events: auto;
          "
        >${task.completed ? '✓' : ''}</span>
        <span
          class="task-text"
          style="
            padding-left: 4px;
            text-decoration: ${task.completed ? 'line-through' : 'none'};
            opacity: ${task.completed ? '0.6' : '1'};
            transition: opacity 0.2s ease;
          "
        >${task.text}</span>
        <span class="task-delete-wrap" data-id="${task.id}" style="
          position: absolute;
          left: -5px;
          top: -5px;
          width: 10px;
          height: 10px;
          cursor: pointer;
          pointer-events: auto;
        ">
          <img
            src="assets/delete_button.png"
            class="task-delete"
            style="
              position: absolute;
              left: 0;
              top: 0;
              width: 10px;
              height: 10px;
              pointer-events: none;
            "
          />
          <span class="task-delete-x" style="
            position: absolute;
            left: -1px;
            top: -2px;
            width: 10px;
            height: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            color: black;
            opacity: 1;
            pointer-events: none;
          ">×</span>
        </span>
      </div>
    `).join('');
  };

  const handleTaskListClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('task-check')) {
      const id = Number(target.dataset.id);
      const tasks = getTasks();
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      target.style.transform = 'scale(1.4)';
      setTimeout(() => {
        target.style.transform = 'scale(1)';
      }, 100);

      const wasCompleted = task.completed;
  const nowCompleting = !wasCompleted; // true only when going incomplete -> complete

  const updated = tasks.map(t =>
    t.id === id
      ? {
          ...t,
          completed: !t.completed,
          // once counted, stays counted — toggling back and forth never re-adds
          countedForHeatmap: t.countedForHeatmap || (nowCompleting && !t.countedForHeatmap),
        }
      : t
  );
  setTasks(updated);

  if (nowCompleting) {
    onTaskCompleted?.(); // bear — every time
    if (!task.countedForHeatmap) {
      onFirstTimeCompleted?.(); // heatmap increment — only once per task, ever
    }
  }
  return;
}

    // delete button — target could be the wrapper, the img, or the x span,
    // so walk up to find the wrapper with the data-id on it
    const deleteWrap = target.closest('.task-delete-wrap') as HTMLElement | null;
    if (deleteWrap) {
      const id = Number(deleteWrap.dataset.id);
      const tasks = getTasks();
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      return;
    }
  };
  overlayEl.addEventListener('click', handleTaskListClick);

  // Anchored to task_bar's actual position — not guessed constants.
  const positionOverlay = () => {
    const originX = task_bar.x - task_bar.displayWidth / 2;
    const originY = task_bar.y - task_bar.displayHeight / 2;

    // TUNE THESE — world-space pixels, same units as showTaskInput's offsets
    const offsetX = 4;
    const offsetY = 82;

    const { x, y } = worldToScreen(originX + offsetX, originY + offsetY);
    overlayEl.style.left = `${x}px`;
    overlayEl.style.top = `${y}px`;

    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sy = rect.height / scene.scale.height;
    const heightWorld = 12; // world units — tune to fit ~7 tasks
    overlayEl.style.height = `${heightWorld * sy}px`;

    overlayEl.style.display = 'flex';
    overlayEl.style.zIndex = '1000';
  };

  const showTaskInput = () => {
    const originX = task_bar.x - task_bar.displayWidth / 2;
    const originY = task_bar.y - task_bar.displayHeight / 2;

    const offsetX = 4;
    const offsetY = 95;

    const { x, y } = worldToScreen(originX + offsetX, originY + offsetY);
    inputEl.style.left = `${x}px`;
    inputEl.style.top = `${y}px`;

    inputEl.style.width = '95px';
    inputEl.style.height = '20px';
    inputEl.style.fontSize = '12px';
    inputEl.style.padding = '2px 4px';

    inputEl.style.display = 'block';
    inputEl.style.zIndex = '1000';
    inputEl.focus();
  };

  const hideTaskInput = () => {
    inputEl.style.display = 'none';
    inputEl.blur();
  };

  let justOpened = false;

  task_bar.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(4, 94, 37, 11), // confirmed against art
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true
  });

  task_bar.on('pointerdown', () => {
    if (isBlocked?.()) return;
    if (getTasks().length >= MAX_TASKS) {
      return;
    }
    showTaskInput();
    justOpened = true;
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
        setTasks([...tasks, { id: Date.now(), text, completed: false, countedForHeatmap: false }]);
      }

      inputEl.value = '';
      hideTaskInput();
    } else if (e.key === 'Escape') {
      inputEl.value = '';
      hideTaskInput();
    }
  };
  inputEl.addEventListener('keydown', handleTaskInputKeydown);

  positionOverlay();
  renderTaskList();

  const setOverlayVisible = (visible: boolean) => {
    overlayEl.style.display = visible ? 'flex' : 'none';
    if (!visible) {
      hideTaskInput(); // also close the input box if it was open
    }
  };

  // Call this from the scene's shutdown handler to clean up DOM listeners.
  const destroy = () => {
    document.removeEventListener('mousedown', handleOutsideClick);
    inputEl.removeEventListener('keydown', handleTaskInputKeydown);
    overlayEl.removeEventListener('click', handleTaskListClick);
    overlayEl.style.display = 'none';
    overlayEl.innerHTML = '';
  };

  return { destroy, setVisible: setOverlayVisible };
}