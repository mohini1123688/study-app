import Phaser from 'phaser';
import { countFriendsInRoomType } from './roomPresence';

const worldToScreen = (scene: Phaser.Scene, worldX: number, worldY: number) => {
  const canvas = scene.game.canvas;
  const rect = canvas.getBoundingClientRect();
  const sx = rect.width / scene.scale.width;
  const sy = rect.height / scene.scale.height;
  return {
    x: rect.left + worldX * sx,
    y: rect.top + worldY * sy,
  };
};

// Creates a small badge above a given world position showing a friend count.
// Hidden entirely when the count is 0, so empty buildings don't show a "0".
export function createFriendCountBadge(scene: Phaser.Scene, worldX: number, worldY: number) {
  const badgeEl = document.createElement('div');
  badgeEl.style.position = 'absolute';
  badgeEl.style.pointerEvents = 'none';
  badgeEl.style.fontFamily = "'VT323', monospace";
  badgeEl.style.fontSize = '14px';
  badgeEl.style.color = 'white';
  badgeEl.style.background = '#e63946';
  badgeEl.style.borderRadius = '50%';
  badgeEl.style.width = '18px';
  badgeEl.style.height = '18px';
  badgeEl.style.display = 'none';
  badgeEl.style.alignItems = 'center';
  badgeEl.style.justifyContent = 'center';
  badgeEl.style.zIndex = '30';

  document.body.appendChild(badgeEl);

  const reposition = () => {
    const { x, y } = worldToScreen(scene, worldX, worldY);
    badgeEl.style.left = `${x}px`;
    badgeEl.style.top = `${y}px`;
    badgeEl.style.transform = 'translate(-50%, -50%)';
  };

  const setCount = (count: number) => {
    if (count <= 0) {
      badgeEl.style.display = 'none';
      return;
    }
    badgeEl.textContent = String(count);
    badgeEl.style.display = 'flex';
    reposition();
  };

  const destroy = () => {
    badgeEl.remove();
  };

  return { setCount, destroy };
}

// Convenience: creates a badge and immediately fetches + displays the friend
// count for a given room type. Returns the badge so you can destroy it later.
export async function setupFriendCountBadge(
  scene: Phaser.Scene,
  worldX: number,
  worldY: number,
  roomName: string,
  userId: string
) {
  const badge = createFriendCountBadge(scene, worldX, worldY);
  const count = await countFriendsInRoomType(roomName, userId);
  badge.setCount(count);
  return badge;
}