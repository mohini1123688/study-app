import Phaser from 'phaser';
import { supabase } from '../supabaseClient';

type FriendRequestRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
};

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
};

export function setupFriendsPopup(scene: Phaser.Scene) {
  const overlayEl = document.getElementById('friends-overlay') as HTMLDivElement;
  let currentUserId: string | null = null;

  const getCurrentUserId = async (): Promise<string | null> => {
    if (currentUserId) return currentUserId;
    const { data } = await supabase.auth.getUser();
    currentUserId = data.user?.id ?? null;
    return currentUserId;
  };

  // Pending requests sent TO me, that I can accept/decline
  const fetchIncomingRequests = async (userId: string) => {
    const { data } = await supabase
      .from('friend_requests')
      .select('id, requester_id, addressee_id, status')
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    return (data ?? []) as FriendRequestRow[];
  };

  // Accepted friendships, in either direction
  const fetchFriends = async (userId: string) => {
    const { data } = await supabase
      .from('friend_requests')
      .select('id, requester_id, addressee_id, status')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    const rows = (data ?? []) as FriendRequestRow[];
    const friendIds = rows.map(r => (r.requester_id === userId ? r.addressee_id : r.requester_id));

    if (friendIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', friendIds);

    return (profiles ?? []) as ProfileRow[];
  };

  const searchUsers = async (query: string, userId: string): Promise<ProfileRow[]> => {
    if (!query.trim()) return [];
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .ilike('username', `${query}%`)
      .neq('id', userId)
      .limit(10);
    return (data ?? []) as ProfileRow[];
  };

  const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
    return await supabase.from('friend_requests').insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    });
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    return await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);
  };

  const render = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const [incoming, friends] = await Promise.all([
      fetchIncomingRequests(userId),
      fetchFriends(userId),
    ]);

    // need requester usernames for incoming requests
    let incomingWithNames: { id: string; requester_id: string; username: string }[] = [];
    if (incoming.length > 0) {
      const { data: requesterProfiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', incoming.map(r => r.requester_id));
      incomingWithNames = incoming.map(r => ({
        id: r.id,
        requester_id: r.requester_id,
        username: requesterProfiles?.find(p => p.id === r.requester_id)?.username ?? '???',
      }));
    }

    overlayEl.innerHTML = `
      <div style="
        background: white;
        border: 2px solid black;
        padding: 16px;
        width: 240px;
        font-family: 'VT323', monospace;
        max-height: 320px;
        overflow-y: auto;
      ">
        <h2 style="margin: 0 0 12px; font-size: 18px; text-align: center;">Friends</h2>

        <input id="friend-search" type="text" placeholder="search username" style="
          width: 100%; margin-bottom: 6px; padding: 4px; font-family: inherit; font-size: 14px;
          box-sizing: border-box;
        " />
        <div id="friend-search-results" style="margin-bottom: 12px;"></div>

        ${incomingWithNames.length > 0 ? `
          <div style="font-size: 14px; margin-bottom: 4px;">Requests</div>
          <div id="friend-requests-list" style="margin-bottom: 12px;">
            ${incomingWithNames.map(r => `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 13px;">
                <span>${r.username}</span>
                <span>
                  <button class="accept-req" data-id="${r.id}" style="cursor: pointer; font-family: inherit;">✓</button>
                  <button class="decline-req" data-id="${r.id}" style="cursor: pointer; font-family: inherit;">✕</button>
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="font-size: 14px; margin-bottom: 4px;">My Friends</div>
        <div id="friend-list">
          ${friends.length === 0
            ? `<div style="font-size: 13px; color: #666;">No friends yet.</div>`
            : friends.map(f => `<div style="font-size: 13px; margin-bottom: 2px;">${f.username}</div>`).join('')
          }
        </div>

        <button id="friends-close" style="width: 100%; margin-top: 12px; padding: 6px; font-family: inherit; font-size: 14px; cursor: pointer;">Close</button>
      </div>
    `;

    const searchInput = document.getElementById('friend-search') as HTMLInputElement;
    const resultsEl = document.getElementById('friend-search-results') as HTMLDivElement;
    const closeBtn = document.getElementById('friends-close') as HTMLButtonElement;

    let searchTimeout: ReturnType<typeof setTimeout>;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        const results = await searchUsers(searchInput.value, userId);
        resultsEl.innerHTML = results.map(u => `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 2px;">
            <span>${u.username}</span>
            <button class="add-friend" data-id="${u.id}" style="cursor: pointer; font-family: inherit;">Add</button>
          </div>
        `).join('');
      }, 300); // debounce so it doesn't query on every keystroke
    });

    resultsEl.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('add-friend')) {
        const addresseeId = target.dataset.id!;
        await sendFriendRequest(userId, addresseeId);
        target.textContent = 'Sent';
        (target as HTMLButtonElement).disabled = true;
      }
    });

    overlayEl.querySelectorAll('.accept-req').forEach(btn => {
      btn.addEventListener('click', async () => {
        await respondToRequest((btn as HTMLElement).dataset.id!, true);
        render(); // refresh the whole popup to reflect the new friend
      });
    });

    overlayEl.querySelectorAll('.decline-req').forEach(btn => {
      btn.addEventListener('click', async () => {
        await respondToRequest((btn as HTMLElement).dataset.id!, false);
        render();
      });
    });

    closeBtn.addEventListener('click', hide);
  };

  const show = () => {
  render();

  const canvas = scene.game.canvas;
  const rect = canvas.getBoundingClientRect();

  overlayEl.style.left = `${rect.right - 290}px`; // TUNE — 250 = how far in from canvas's right edge
  overlayEl.style.top = `${rect.top + 120}px`; // TUNE — offset down from canvas's top edge
  overlayEl.style.right = 'auto'; // clear so left doesn't fight with a leftover right value
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