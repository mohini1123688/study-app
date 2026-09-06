import Phaser from 'phaser';
import { getRoomInstances } from './roomPresence';

export function setupBuildingSidebar(scene: Phaser.Scene) {
  const overlayEl = document.getElementById('building-sidebar-overlay') as HTMLDivElement;

  const render = async (roomName: string, userId: string, sceneKey: string, buildingLabel: string) => {
    overlayEl.innerHTML = `
      <div style="
        background: white;
        border: 2px solid black;
        padding: 16px;
        width: 200px;
        font-family: 'VT323', monospace;
        max-height: 320px;
        overflow-y: auto;
      ">
        <h2 style="margin: 0 0 12px; font-size: 18px; text-align: center;">${buildingLabel}</h2>
        <div id="sidebar-room-list">Loading...</div>
        <button id="sidebar-create" style="width: 100%; margin-top: 8px; padding: 6px; font-family: inherit; font-size: 14px; cursor: pointer;">
          Create new room
        </button>
        <button id="sidebar-close" style="width: 100%; margin-top: 8px; padding: 6px; font-family: inherit; font-size: 14px; cursor: pointer;">
          Close
        </button>
      </div>
    `;

    const listEl = document.getElementById('sidebar-room-list') as HTMLDivElement;
    const createBtn = document.getElementById('sidebar-create') as HTMLButtonElement;
    const closeBtn = document.getElementById('sidebar-close') as HTMLButtonElement;

    const instances = await getRoomInstances(roomName, userId);

    listEl.innerHTML = instances.length === 0
      ? `<div style="font-size: 13px; color: #666;">No active rooms.</div>`
      : instances.map(room => `
        <div style="border: 1px solid black; padding: 6px; margin-bottom: 6px; font-size: 13px;">
          <div>${room.clients}/${room.maxClients} people</div>
          ${room.friendUsernames.length > 0
            ? `<div style="color: #457b9d;">Friends: ${room.friendUsernames.join(', ')}</div>`
            : ''
          }
          <button class="sidebar-join" data-room-id="${room.roomId}" style="width: 100%; margin-top: 4px; padding: 4px; font-family: inherit; cursor: pointer;">
            Join
          </button>
        </div>
      `).join('');

    listEl.querySelectorAll('.sidebar-join').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = (btn as HTMLElement).dataset.roomId!;
        scene.registry.set('joinRoomId', roomId);
        hide();
        scene.scene.start(sceneKey);
      });
    });

    createBtn.addEventListener('click', () => {
  scene.registry.set('joinRoomId', null);
  scene.registry.set('forceNewRoom', true); // explicit signal: always create fresh
  hide();
  scene.scene.start(sceneKey);
});

    closeBtn.addEventListener('click', hide);
  };

  const show = (roomName: string, userId: string, sceneKey: string, buildingLabel: string) => {
  render(roomName, userId, sceneKey, buildingLabel);

  const canvas = scene.game.canvas;
  const rect = canvas.getBoundingClientRect();

  overlayEl.style.left = `${rect.right - 290}px`; // TUNE — 250 = distance in from canvas's right edge
  overlayEl.style.top = `${rect.top + 120}px`; // TUNE — offset down from canvas's top edge
  overlayEl.style.right = 'auto';
  overlayEl.style.bottom = 'auto';
  overlayEl.style.display = 'block';
};

  const hide = () => {
    overlayEl.style.display = 'none';
    overlayEl.innerHTML = '';
  };

  const destroy = () => {
    hide();
  };

  return { show, hide, destroy };
}