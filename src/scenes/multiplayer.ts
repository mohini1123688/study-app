import { createUsernameLabel } from './usernameLabel';
import { Client, getStateCallbacks } from '@colyseus/sdk';

export function setupMultiplayer(scene: Phaser.Scene, chosenCharacter: string, username: string) {
  const client = new Client(import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567');
  let room: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;

  const remotePlayers = new Map<string, Phaser.GameObjects.Sprite>();
  const remoteLabels = new Map<string, { destroy: () => void }>();

  const addRemotePlayer = (sessionId: string, playerState: any) => {
    if (room && sessionId === room.sessionId) return;

    const remoteKey = playerState.character === 'girl_player' ? 'girl_player' : 'boy_player';
    const remoteAnimKey = remoteKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';

    const remoteX = playerState.x + 20;
    const remoteY = playerState.y + 30;


    const sprite = scene.add.sprite(remoteX, remoteY, remoteKey);    sprite.play({ key: remoteAnimKey, repeat: -1 });
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
    const $ = getStateCallbacks(room);

    $(room.state).players.onAdd((playerState: any, sessionId: string) => {
      addRemotePlayer(sessionId, playerState);
    });

    $(room.state).players.onRemove((_playerState: any, sessionId: string) => {
      removeRemotePlayer(sessionId);
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