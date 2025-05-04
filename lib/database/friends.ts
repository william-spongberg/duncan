import { supabase } from "@/lib/auth/client";
import type { Profile, FriendShipWithProfile } from "./types";
import { getProfile } from "./profiles";
import { getUserId } from "./user";
import { getCachedFriends, setCachedFriends } from "../cache/friends";

/**
 * Get all friends for a user
 */
export async function getFriends(
  status: "pending" | "accepted" | "blocked" | "all" = "accepted",
  userId?: string
): Promise<FriendShipWithProfile[]> {
  if (!userId) {
    userId = await getUserId();
  }

  // try to get from cache
  const cached = await getCachedFriends(userId, status);
  if (cached) {
    return cached;
  }

  // build query
  let query = supabase
    .from("friends")
    .select("*")
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

  // filter by status if not requesting all
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // execute query
  const { data: friends, error } = await query;

  if (error) {
    throw new Error("Error fetching friends: " + error.message);
  }

  // fetch profiles for each friend
  const profiles: Profile[] = await Promise.all(
    friends.map(async (friend) => {
      const friendId =
        friend.user_id_1 === userId ? friend.user_id_2 : friend.user_id_1;
      return getProfile(friendId);
    })
  );

  const friendsWithProfiles: FriendShipWithProfile[] = friends.map((friendship, i) => ({
    friendship,
    profile: profiles[i],
  }));

  // cache the result
  await setCachedFriends(userId, status, friendsWithProfiles);

  return friendsWithProfiles;
}

export async function getFriendCount(
  status: "pending" | "accepted" | "blocked" = "accepted",
  userId?: string
): Promise<number> {
  if (!userId) {
    userId = await getUserId();
  }

  // try cache
  const cached = await getCachedFriends(userId, status);
  if (cached) {
    return cached.length;
  }

  const friends = await getFriends(status, userId);
  return friends ? friends.length : 0;
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  senderId: string,
  recipientId: string
): Promise<void> {
  const user_id_1 = senderId;
  const user_id_2 = recipientId;

  const { error } = await supabase.from("friends").upsert({
    user_id_1,
    user_id_2,
    status: "pending",
    requested_at: new Date().toISOString(),
    accepted_at: null,
  });

  if (error) {
    throw new Error("Error sending friend request: " + error.message);
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  friendId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  const user_id_1 = friendId;
  const user_id_2 = userId;

  const { error } = await supabase
    .from("friends")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .match({ user_id_1, user_id_2 });

  if (error) {
    throw new Error("Error accepting friend request: " + error.message);
  }
}

// reject a friend request
export async function rejectFriendRequest(
  friendId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  const user_id_1 = friendId;
  const user_id_2 = userId;

  const { error } = await supabase
    .from("friends")
    .delete()
    .match({ user_id_1, user_id_2 });

  if (error) {
    throw new Error("Error rejecting friend request: " + error.message);
  }
}
