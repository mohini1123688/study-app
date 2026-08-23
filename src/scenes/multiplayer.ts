import Phaser from 'phaser';
import { Client, getStateCallbacks } from '@colyseus/sdk';

export function setupMultiplayer(scene: Phaser.Scene, chosenCharacter: string) {
  console.log('Connecting to:', import.meta.env.VITE_SERVER_URL);
  const client = new Client(import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567');
  let room: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;

  // Track remote player sprites by sessionId so we can add/remove them individually
  const remotePlayers = new Map<string, Phaser.GameObjects.Sprite>();

  const addRemotePlayer = (sessionId: string, playerState: any) => {
    // Don't render a sprite for ourselves — the scene's own player sprite handles that
    if (room && sessionId === room.sessionId) return;

    const remoteKey = playerState.character === 'girl_player' ? 'girl_player' : 'boy_player';
    const remoteAnimKey = remoteKey === 'girl_player' ? 'pick_me' : 'pick_me_boy';

    const sprite = scene.add.sprite(playerState.x, playerState.y, remoteKey);
    sprite.play({ key: remoteAnimKey, repeat: -1 });

    remotePlayers.set(sessionId, sprite);
  };

  const removeRemotePlayer = (sessionId: string) => {
    const sprite = remotePlayers.get(sessionId);
    if (sprite) {
      sprite.destroy();
      remotePlayers.delete(sessionId);
    }
  };

  client.joinOrCreate('olin_room', { character: chosenCharacter }).then((joinedRoom) => {
    room = joinedRoom;
    console.log('Connected to OlinRoom! sessionId:', room.sessionId);

    const $ = getStateCallbacks(room);

    $(room.state).players.onAdd((playerState: any, sessionId: string) => {
      console.log('Player joined:', sessionId, playerState);
      addRemotePlayer(sessionId, playerState);
    });

    $(room.state).players.onRemove((_playerState: any, sessionId: string) => {
      console.log('Player left:', sessionId);
      removeRemotePlayer(sessionId);
    });

    room.onLeave((code) => {
      console.log('Left OlinRoom, code:', code);
    });
  }).catch((err) => {
    console.error('Failed to join OlinRoom:', err);
  });

  // Call this from the scene's shutdown handler to clean up sprites + leave the room.
  const destroy = () => {
    remotePlayers.forEach(sprite => sprite.destroy());
    remotePlayers.clear();
    room?.leave();
  };

  return { destroy };
}
