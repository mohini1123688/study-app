import Phaser from 'phaser';
import { Client, getStateCallbacks } from '@colyseus/sdk';
import { createUsernameLabel } from './usernameLabel';

const getAnimKey = (character: string, animState: string) => {
  const isGirl = character === 'girl_player';
  if (animState === 'typing') return isGirl ? 'typing' : 'typing_boy';
  if (animState === 'dance') return isGirl ? 'dance' : 'dancing_boy';
  return isGirl ? 'pick_me' : 'pick_me_boy'; // idle
};

// study item texture key + offset relative to the player sprite it belongs to
const STUDY_ITEM_TEXTURES: Record<string, string> = {
  paper: 'paper_and_pencil',
  laptop: 'laptop',
  book: 'book',
};
const studyItemOffsetX = 0; // TUNE — relative to the owning player's sprite
const studyItemOffsetY = 11; // TUNE

export function setupMultiplayer(
  scene: Phaser.Scene,
  chosenCharacter: string,
  username: string,
  userId: string,
  localPlayerSprite: Phaser.GameObjects.Sprite,
  onLocalRepositioned?: () => void
) {
  const client = new Client(import.meta.env.VITE_SERVER_URL || 'ws://localhost:2567');
  let room: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;


  const remotePlayers = new Map<string, Phaser.GameObjects.Sprite>();
  const remoteLabels = new Map<string, { destroy: () => void }>();
  const remoteStudyItems = new Map<string, Phaser.GameObjects.Image>();

  const updateRemoteStudyItem = (sessionId: string, sprite: Phaser.GameObjects.Sprite, studyItem: string) => {
    let itemSprite = remoteStudyItems.get(sessionId);

    if (studyItem === 'none' || !STUDY_ITEM_TEXTURES[studyItem]) {
      if (itemSprite) itemSprite.setVisible(false);
      return;
    }

    const textureKey = STUDY_ITEM_TEXTURES[studyItem];

    if (!itemSprite) {
      itemSprite = scene.add.image(sprite.x + studyItemOffsetX, sprite.y + studyItemOffsetY, textureKey);
      itemSprite.setDepth(2);
      remoteStudyItems.set(sessionId, itemSprite);
    }

    itemSprite.setTexture(textureKey);
    itemSprite.setPosition(sprite.x + studyItemOffsetX, sprite.y + studyItemOffsetY);
    itemSprite.setVisible(true);
  };

  const addRemotePlayer = (sessionId: string, playerState: any, $: ReturnType<typeof getStateCallbacks>) => {
    if (room && sessionId === room.sessionId) {
      // this is our own entry in the shared state — move our own sprite to
      // the desk the server assigned, rather than rendering a second sprite
      localPlayerSprite.setPosition(playerState.x, playerState.y);
      onLocalRepositioned?.();
      return;
    }

    const remoteKey = playerState.character === 'girl_player' ? 'girl_player' : 'boy_player';

    const sprite = scene.add.sprite(playerState.x, playerState.y, remoteKey);
    sprite.setDepth(0); // same layer as the local player — was -1, which hid it behind the background
    sprite.play({ key: getAnimKey(playerState.character, playerState.animState), repeat: -1 });
    remotePlayers.set(sessionId, sprite);

    const label = createUsernameLabel(scene, sprite, playerState.username || '???');
    remoteLabels.set(sessionId, label);

    updateRemoteStudyItem(sessionId, sprite, playerState.studyItem);
    console.log('updateRemoteStudyItem called:', sessionId, playerState.studyItem);

    // react to this specific remote player's state changes
    $(playerState).listen('animState', (newState: string) => {
      sprite.play({ key: getAnimKey(playerState.character, newState), repeat: -1 });
    });

    $(playerState).listen('studyItem', (newItem: string) => {
      updateRemoteStudyItem(sessionId, sprite, newItem);
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
    const itemSprite = remoteStudyItems.get(sessionId);
    if (itemSprite) {
      itemSprite.destroy();
      remoteStudyItems.delete(sessionId);
    }
  };

  const joinRoomId = scene.registry.get('joinRoomId');
const forceNew = scene.registry.get('forceNewRoom');

let joinPromise;
if (joinRoomId) {
  joinPromise = client.joinById(joinRoomId, { character: chosenCharacter, username, userId });
} else if (forceNew) {
  joinPromise = client.create('olin_room', { character: chosenCharacter, username, userId });
} else {
  joinPromise = client.joinOrCreate('olin_room', { character: chosenCharacter, username, userId });
}

scene.registry.set('joinRoomId', null);
scene.registry.set('forceNewRoom', false);

joinPromise.then((joinedRoom) => {
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

  const sendStudyItem = (studyItem: 'none' | 'paper' | 'laptop' | 'book') => {
    room?.send('setStudyItem', studyItem);
  };

  const destroy = () => {
    remotePlayers.forEach(sprite => sprite.destroy());
    remotePlayers.clear();
    remoteLabels.forEach(label => label.destroy());
    remoteLabels.clear();
    remoteStudyItems.forEach(sprite => sprite.destroy());
    remoteStudyItems.clear();
    room?.leave();
  };

  return { destroy, sendAnimState, sendStudyItem };
}