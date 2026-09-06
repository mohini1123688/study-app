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

const dateKey = (d: Date) => d.toISOString().split('T')[0];

// Counts consecutive days (ending today, or yesterday if today has no
// completions yet — so the streak doesn't reset mid-day) with count > 0.
const computeStreak = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from('daily_completions')
    .select('date, count')
    .eq('user_id', userId)
    .gt('count', 0);

  const activeDates = new Set((data ?? []).map((row: any) => row.date));

  let streak = 0;
  const cursor = new Date();
  if (!activeDates.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // give today a grace period
  }

  while (activeDates.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export function setupProfilePopup(scene: Phaser.Scene) {
  const bg = scene.add.image(28, 38, 'profile_pop_up');
  bg.setDepth(50);
  bg.setVisible(false);

  const characterSprite = scene.add.sprite(12, 38, 'girl_player'); // TUNE position
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
    .order('status', { ascending: true }) // 'accepted' sorts before 'pending' alphabetically
    .limit(1);
  return data?.[0] ?? null;
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

    // status text — matches the font size/style of the school/major/year fields
    if (row.status === 'accepted') {
      controlsEl.innerHTML = `<div style="font-size: 12px; white-space: nowrap;">You are friends</div>`;
      return;
    }

    if (row.status === 'pending' && row.requester_id === myId) {
      controlsEl.innerHTML = `<div style="font-size: 12px; white-space: nowrap;">Request sent</div>`;
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

const render = (profile: ProfileData, streak: number) => {
    overlayEl.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; font-family: 'VT323', monospace;">
        <div style="position: absolute; left: 19px; top: 10px; font-size: 14px; font-weight: bold;">${profile.username}</div>
        <div style="
          position: absolute;
          left: 60px;
          top: 30px;
          width: calc(100% - 70px);
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 12px;
          line-height: 1;
        ">
          <div>${profile.school ? SCHOOL_LABELS[profile.school] ?? profile.school : ''}</div>
          <div>${profile.major ?? ''}</div>
          <div>${profile.year ?? ''}</div>
          <div style="font-weight: bold;">Streak: ${streak}</div>
        </div>
        <div id="profile-friend-controls" style="position: absolute; left: 20px; bottom: 12px; width: calc(100% - 40px);"></div>
        <button id="profile-close" style="position: absolute; right: 8px; top: 8px; cursor: pointer; font-family: inherit;">✕</button>
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

    const isSelf = myId === targetUserId;

    // Decide which of the three backgrounds to use:
    //   profile_pop_up  — own profile (no friend controls at all)
    //   profile_pop_up2 — a button renders (send request / accept request)
    //   profile_pop_up3 — status text only (you are friends / request sent)
    let friendRow: Awaited<ReturnType<typeof getFriendStatus>> | null = null;
    let variant: 'plain' | 'button' | 'status' = 'plain';

    if (!isSelf && myId) {
      friendRow = await getFriendStatus(myId, targetUserId);

      if (!friendRow || (friendRow.status === 'pending' && friendRow.addressee_id === myId)) {
        variant = 'button'; // send request, or accept an incoming one
      } else if (friendRow.status === 'accepted' || (friendRow.status === 'pending' && friendRow.requester_id === myId)) {
        variant = 'status'; // you are friends / request sent
      }
    }

    const bgKey =
      variant === 'button' ? 'profile_pop_up2' :
      variant === 'status' ? 'profile_pop_up3' :
      'profile_pop_up';

    bg.setTexture(bgKey);
    bg.setVisible(true);

    // TUNE — character sits in a different spot depending on which popup layout is active
    if (variant === 'button') {
      characterSprite.setPosition(12, 30); // profile_pop_up2 position
    } else if (variant === 'status') {
      characterSprite.setPosition(12, 35); // profile_pop_up3 position — TUNE
    } else {
      characterSprite.setPosition(12, 40); // profile_pop_up position
    }

    characterSprite.setTexture(resolvedCharacter);
    characterSprite.play({ key: idleAnim, repeat: -1 });
    characterSprite.setVisible(true);

    const streak = await computeStreak(targetUserId);
    render(profile, streak);
    positionOverlay();

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