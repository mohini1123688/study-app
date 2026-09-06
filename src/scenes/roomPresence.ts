import { supabase } from '../supabaseClient';

// Returns the current user's friend IDs (accepted friendships, either direction).
export async function getFriendIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('friend_requests')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const ids = new Set<string>();
  (data ?? []).forEach((row: any) => {
    ids.add(row.requester_id === userId ? row.addressee_id : row.requester_id);
  });
  return ids;
}

// Counts how many of the user's friends are currently in any instance of a given room type.
export async function countFriendsInRoomType(roomName: string, userId: string): Promise<number> {
  const friendIds = await getFriendIds(userId);

  const { data } = await supabase
    .from('room_presence')
    .select('user_id')
    .eq('room_name', roomName);

  return (data ?? []).filter((row: any) => friendIds.has(row.user_id)).length;
}

export type RoomInstanceInfo = {
  roomId: string;
  clients: number;
  maxClients: number;
  friendUsernames: string[];
};

// Returns per-instance detail for a room type: occupancy and which friends
// (by username) are present in each specific instance. Powers the building sidebar.
export async function getRoomInstances(roomName: string, userId: string): Promise<RoomInstanceInfo[]> {
  const friendIds = await getFriendIds(userId);

  const { data } = await supabase
    .from('room_presence')
    .select('room_id, user_id, username, clients, max_clients')
    .eq('room_name', roomName);

  const byRoom = new Map<string, RoomInstanceInfo>();

  (data ?? []).forEach((row: any) => {
    if (!byRoom.has(row.room_id)) {
      byRoom.set(row.room_id, {
        roomId: row.room_id,
        clients: row.clients,
        maxClients: row.max_clients,
        friendUsernames: [],
      });
    }
    if (friendIds.has(row.user_id)) {
      byRoom.get(row.room_id)!.friendUsernames.push(row.username);
    }
  });

  return Array.from(byRoom.values());
}