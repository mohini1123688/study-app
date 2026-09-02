import Phaser from 'phaser';
import { supabase } from '../supabaseClient';

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

const offsetY = -9; // TUNE — distance above the sprite, in world units

// Creates a single label above a given sprite, showing the given text.
// Characters are stationary, so this positions once and doesn't need to track movement.
export function createUsernameLabel(scene: Phaser.Scene, targetSprite: Phaser.GameObjects.Sprite, username: string) {
  const container = document.getElementById('username-labels-container') as HTMLDivElement;

  const labelEl = document.createElement('div');
  labelEl.textContent = username;
  labelEl.style.position = 'absolute';
  labelEl.style.pointerEvents = 'none';
  labelEl.style.fontFamily = "'VT323', monospace";
  labelEl.style.fontSize = '12px';
  labelEl.style.color = 'white';
  labelEl.style.textShadow = '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black';
  labelEl.style.whiteSpace = 'nowrap';

  const { x, y } = worldToScreen(scene, targetSprite.x, targetSprite.y + offsetY);
  labelEl.style.left = `${x}px`;
  labelEl.style.top = `${y}px`;
  labelEl.style.transform = 'translate(calc(-50% + 4px), -100%)';

  container.appendChild(labelEl);

  const destroy = () => {
    labelEl.remove();
  };

  return { destroy };
}

// Convenience wrapper for the local player specifically — reads the logged-in
// user's username (from cache if available) and creates their label.
export function setupOwnUsernameLabel(scene: Phaser.Scene, targetSprite: Phaser.GameObjects.Sprite) {
  let label: { destroy: () => void } | null = null;

  const load = async () => {
    const cachedUsername = scene.registry.get('username');
    if (cachedUsername) {
      label = createUsernameLabel(scene, targetSprite, cachedUsername);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile) {
      scene.registry.set('username', profile.username);
      label = createUsernameLabel(scene, targetSprite, profile.username);
    }
  };

  load();

  const destroy = () => {
    label?.destroy();
  };

  return { destroy };
}