import Phaser from 'phaser';
import { supabase } from '../supabaseClient';

type ProfileData = {
  username: string;
  school: string | null;
  major: string | null;
  year: string | null;
};

const SCHOOL_LABELS: Record<string, string> = {
  artsci: 'ArtSci',
  mckelvey: 'McKelvey',
  olin: 'Olin',
  samfox: 'Samfox',
};

export function setupProfilePopup(scene: Phaser.Scene) {
  const bg = scene.add.image(28, 38, 'profile_pop_up');
  bg.setDepth(50);
  bg.setVisible(false);

  const characterSprite = scene.add.sprite(13, 37, 'girl_player'); // TUNE position
  characterSprite.setDepth(51);
  characterSprite.setVisible(false);

  const overlayEl = document.getElementById('profile-overlay') as HTMLDivElement;

  const worldToScreen = (worldX: number, worldY: number) => {
    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;
    return { x: rect.left + worldX * sx, y: rect.top + worldY * sy };
  };

  const positionOverlay = () => {
    const originX = bg.x - bg.displayWidth / 2;
    const originY = bg.y - bg.displayHeight / 2;
    const { x, y } = worldToScreen(originX, originY);
    overlayEl.style.left = `${x}px`;
    overlayEl.style.top = `${y}px`;

    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / scene.scale.width;
    const sy = rect.height / scene.scale.height;
    overlayEl.style.width = `${bg.displayWidth * sx}px`;
    overlayEl.style.height = `${bg.displayHeight * sy}px`;
    overlayEl.style.display = 'block';
  };

  const getFriendStatus = async (myId: string, otherId: string) => {
    const { data } = await supabase
      .from('friend_requests')
      .select('id, requester_id, addressee_id, status')
      .or(`and(requester_id.eq.${myId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${myId})`)
      .maybeSingle();
    return data;
  };

  const renderFriendControls = async (myId: string, otherUserId: string) => {
    const controlsEl = document.getElementById('profile-friend-controls') as HTMLDivElement;
    const row = await getFriendStatus(myId, otherUserId);

    if (!row) {
      controlsEl.innerHTML = `<button id="profile-send-request" style="width: 100%; padding: 6px; font-family: inherit; cursor: pointer;">Send friend request</button>`;
      document.getElementById('profile-send-request')!.addEventListener('click', async () => {
        await supabase.from('friend_requests').insert({ requester_id: myId, addressee_id: otherUserId, status: 'pending' });
        renderFriendControls(myId, otherUserId);
      });
      return;
    }

    if (row.status === 'accepted') {
      controlsEl.innerHTML = `<div style="text-align: center; font-size: 12px; white-space: nowrap;">You are friends</div>`;
      return;
    }

    if (row.status === 'pending' && row.requester_id === myId) {
      controlsEl.innerHTML = `<div style="text-align: center; color: #666;">Request sent</div>`;
      return;
    }

    if (row.status === 'pending' && row.addressee_id === myId) {
      controlsEl.innerHTML = `<button id="profile-accept-request" style="width: 100%; padding: 6px; font-family: inherit; cursor: pointer;">Accept friend request</button>`;
      document.getElementById('profile-accept-request')!.addEventListener('click', async () => {
        await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', row.id);
        renderFriendControls(myId, otherUserId);
      });
      return;
    }

    controlsEl.innerHTML = ''; // declined or other state — show nothing
  };

  const render = (profile: ProfileData) => {
    overlayEl.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; font-family: 'VT323', monospace;">
        <div style="position: absolute; left: 30px; top: 10px; font-size: 14px;">${profile.username}</div>
        <div style="position: absolute; left: 60px; top: 35px; font-size: 12px;">${profile.school ? SCHOOL_LABELS[profile.school] ?? profile.school : ''}</div>
        <div style="position: absolute; left: 60px; top: 55px; font-size: 12px;">${profile.major ?? ''}</div>
        <div style="position: absolute; left: 60px; top: 75px; font-size: 12px;">${profile.year ?? ''}</div>
        <div id="profile-friend-controls" style="position: absolute; left: 20px; bottom: 15px; width: calc(100% - 40px);"></div>
        <button id="profile-close" style="position: absolute; right: -4px; top: 0px; cursor: pointer; font-family: inherit;">✕</button>
      </div>
    `;
    document.getElementById('profile-close')!.addEventListener('click', hide);
  };

  // Unified entry point — works for viewing your own profile or someone else's.
  // `character` is optional: pass it when viewing a remote player (whose sprite
  // key you already know from the room), omit it to fall back to your own saved character.
  const showProfile = async (targetUserId: string, character?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const myId = userData.user?.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, school, major, year')
      .eq('id', targetUserId)
      .single();

    if (!profile) return;

    const resolvedCharacter = character ?? scene.registry.get('selectedCharacter') ?? 'girl_player';
    const idleAnim = resolvedCharacter === 'girl_player' ? 'pick_me' : 'pick_me_boy';

    bg.setVisible(true);
    characterSprite.setTexture(resolvedCharacter);
    characterSprite.play({ key: idleAnim, repeat: -1 });
    characterSprite.setVisible(true);

    render(profile);
    positionOverlay();

    const isSelf = myId === targetUserId;
    const controlsEl = document.getElementById('profile-friend-controls') as HTMLDivElement;
    if (isSelf || !myId) {
      controlsEl.innerHTML = '';
    } else {
      renderFriendControls(myId, targetUserId);
    }
  };

  const hide = () => {
    bg.setVisible(false);
    characterSprite.setVisible(false);
    overlayEl.style.display = 'none';
    overlayEl.innerHTML = '';
  };

  const destroy = () => {
    hide();
  };

  return { showProfile, hide, destroy };
}