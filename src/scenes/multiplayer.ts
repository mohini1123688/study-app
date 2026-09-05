import Phaser from 'phaser';
import { Client, getStateCallbacks } from '@colyseus/sdk';
import { createUsernameLabel } from './usernameLabel';

// character-specific animation key lookup, same mapping OlinScene already uses locally
const getAnimKey = (character: string, animState: string) => {
  const isGirl = character === 'girl_player';
  if (animState === 'typing') return isGirl ? 'typing' : 'typing_boy';
  if (animState === 'dance') return isGirl ? 'dance' : 'dancing_boy';
  return isGirl ? 'pick_me' : 'pick_me_boy'; // idle
};

export function setupMultiplayer(
  scene: Phaser.Scene,
  chosenCharacter: string,
  username: string,
  localPlayerSprite: Phaser.GameObjects.Sprite,
  onLocalRepositioned?: () => void
) {
  const client = new Client(import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567');
  let room: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;

  const remotePlayers = new Map<string, Phaser.GameObjects.Sprite>();
  const remoteLabels = new Map<string, { destroy: () => void }>();

  const addRemotePlayer = (sessionId: string, playerState: any, $: ReturnType<typeof getStateCallbacks>) => {
    if (room && sessionId === room.sessionId) {
      localPlayerSprite.setPosition(playerState.x, playerState.y);
      onLocalRepositioned?.();
      return;
    }

    const remoteKey = playerState.character === 'girl_player' ? 'girl_player' : 'boy_player';
    const sprite = scene.add.sprite(playerState.x, playerState.y, remoteKey);
    sprite.setDepth(0);
    sprite.play({ key: getAnimKey(playerState.character, playerState.animState), repeat: -1 });
    remotePlayers.set(sessionId, sprite);

    const label = createUsernameLabel(scene, sprite, playerState.username || '???');
    remoteLabels.set(sessionId, label);

    // react whenever this remote player's animState changes on the server
    $(playerState).listen('animState', (newState: string) => {
      sprite.play({ key: getAnimKey(playerState.character, newState), repeat: newState === 'dance' ? -1 : (newState === 'idle' ? -1 : -1) });
    });
  };

  const removeRemotePlayer = (sessionId: string) => {
    const sprite = remotePlayers.get(sessionId);
    if (sprite) {
      sprite.destroy();
      remotePlayers.delete(sessionId);
    }
    const label = remoteLabels.get(sessionId);
    if (label) {
      label.destroy();
      remoteLabels.delete(sessionId);
    }
  };

  client.joinOrCreate('olin_room', { character: chosenCharacter, username }).then((joinedRoom) => {
    room = joinedRoom;
    console.log('Connected to OlinRoom! sessionId:', room.sessionId);

    const $ = getStateCallbacks(room);

    $(room.state).players.onAdd((playerState: any, sessionId: string) => {
      addRemotePlayer(sessionId, playerState, $);
    });

    $(room.state).players.onRemove((_playerState: any, sessionId: string) => {
      removeRemotePlayer(sessionId);
    });

    room.onLeave((code) => {
      console.log('Left OlinRoom, code:', code);
    });
  }).catch((err) => {
    console.error('Failed to join OlinRoom:', err);
  });

  const sendAnimState = (animState: 'idle' | 'typing' | 'dance') => {
    room?.send('setAnimState', animState);
  };

  const destroy = () => {
    remotePlayers.forEach(sprite => sprite.destroy());
    remotePlayers.clear();
    remoteLabels.forEach(label => label.destroy());
    remoteLabels.clear();
    room?.leave();
  };

  return { destroy, sendAnimState };
}