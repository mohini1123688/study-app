import Phaser from 'phaser';

export function setupCompletedSession(scene: Phaser.Scene) {
  const completed_session = scene.add.image(104, 75, 'completed_session');
  completed_session.setDepth(50);
  completed_session.setVisible(false);

  const complete_session_delete_button = scene.add.image(82, 44, 'complete_session_delete_button');
  complete_session_delete_button.setInteractive({ useHandCursor: true });
  complete_session_delete_button.setVisible(false);
  complete_session_delete_button.setDepth(101);

  const completedSessionEl = document.getElementById('completed-session-overlay') as HTMLDivElement;

  const worldToScreen = (worldX: number, worldY: number) => {
    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;
    return { x: rect.left + worldX * sx, y: rect.top + worldY * sy };
  };

  const positionOverlay = () => {
    const originX = completed_session.x - completed_session.displayWidth / 2;
    const originY = completed_session.y - completed_session.displayHeight / 2;

    const { x, y } = worldToScreen(originX, originY);
    completedSessionEl.style.left = `${x}px`;
    completedSessionEl.style.top = `${y}px`;

    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;

    completedSessionEl.style.width = `${completed_session.displayWidth * sx}px`;
    completedSessionEl.style.height = `${completed_session.displayHeight * sy}px`;
    completedSessionEl.style.paddingTop = '18px';
    completedSessionEl.style.display = 'flex';
    completedSessionEl.style.flexDirection = 'column';
    completedSessionEl.style.justifyContent = 'center';
  };

  const renderList = () => {
    const tasks = scene.registry.get('taskList') ?? [];
    const completedTasks = tasks.filter((t: { completed: boolean }) => t.completed);

    completedSessionEl.innerHTML = completedTasks.length === 0
      ? `<div style="color: black; font-size: 12px; font-family: 'VT323', monospace; text-align: center;">No completed tasks yet!</div>`
      : completedTasks.map((task: { text: string }) => `
        <div style="color: black; font-size: 12px; font-family: 'VT323', monospace; text-align: center; margin-bottom: 4px;">
          ${task.text}
        </div>
      `).join('');
  };

  const show = () => {
    completed_session.setVisible(true);
    complete_session_delete_button.setVisible(true);
    positionOverlay();
    renderList();
  };

  const hide = () => {
    completed_session.setVisible(false);
    complete_session_delete_button.setVisible(false);
    completedSessionEl.style.display = 'none';
  };

  complete_session_delete_button.on('pointerdown', hide);

  const destroy = () => {
    completedSessionEl.style.display = 'none';
    completedSessionEl.innerHTML = '';
  };

  return { show, hide, destroy };
}