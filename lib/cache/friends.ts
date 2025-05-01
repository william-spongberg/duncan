import { get, set, del } from "idb-keyval";
import type { FriendWithProfile } from "@/lib/database/types";

export async function getCachedFriends(userId: string, status: string): Promise<FriendWithProfile[] | null> {
  const cached = await get(`friends_${userId}_${status}`);
  if (cached) {
    console.log("Cache hit for friends!");
    return cached;
  }
  return null;
}

export async function setCachedFriends(userId: string, status: string, friendsWithProfiles: FriendWithProfile[]): Promise<void> {
  await set(`friends_${userId}_${status}`, friendsWithProfiles);
}

export async function delCachedFriends(userId: string, status: string): Promise<void> {
  await del(`friends_${userId}_${status}`);
}