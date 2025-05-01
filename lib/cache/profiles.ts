import { get, set, del } from "idb-keyval";
import type { Profile } from "@/lib/database/types";

export async function getCachedProfile(userId: string): Promise<Profile | null> {
  // Try to get from cache
  const cached = await get(`profile_${userId}`);
  if (cached) {
    console.log("Cache hit for profile!");
    return cached;
  }
  return null;
}

export async function setCachedProfile(userId: string, profile: Profile): Promise<void> {
  await set(`profile_${userId}`, profile);
}

export async function delCachedProfile(userId: string): Promise<void> {
  await del(`profile_${userId}`);
}