import Phaser from 'phaser';
import { Client, getStateCallbacks } from '@colyseus/sdk';
import { createUsernameLabel } from './usernameLabel';

export function setupMultiplayer(
  scene: Phaser.Scene,
  chosenCharacter: string,
  username: string,
  localPlayerSprite: Phaser.GameObjects.Sprite
) {
  const client = new Client(import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567');
  let room: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;

  const remotePlayers = new Map<string, Phaser.GameObjects.Sprite>();
  const remoteLabels = new Map<string, { destroy: () => void }>();

  const addRemotePlayer = (sessionId: string, playerState: any) => {
    if (room && sessionId === room.sessionId) {
      // this is our own entry in the shared state — move our own sprite to
      // the desk the server assigned, rather than rendering a second sprite
      localPlayerSprite.setPosition(playerState.x, playerState.y);
      return;
    }

    const remoteKey = playerState.character === 'girl_player' ? 'girl_player' : 'boy_player';
    const remoteAnimKey = remoteKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';

    const sprite = scene.add.sprite(playerState.x, playerState.y, remoteKey);
    sprite.setDepth(-1); // sits behind default-depth objects like tables
    sprite.play({ key: remoteAnimKey, repeat: -1 });
    remotePlayers.set(sessionId, sprite);

    const label = createUsernameLabel(scene, sprite, playerState.username || '???');
    remoteLabels.set(sessionId, label);
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
      addRemotePlayer(sessionId, playerState);
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

  const destroy = () => {
    remotePlayers.forEach(sprite => sprite.destroy());
    remotePlayers.clear();
    remoteLabels.forEach(label => label.destroy());
    remoteLabels.clear();
    room?.leave();
  };

  return { destroy };
}