import { get, set, del } from "idb-keyval";
import type { Group } from "@/lib/database/types";

export async function getCachedGroup(
  groupId: string
): Promise<Group | null> {
  // Try to get from cache
  const cached = await get(`group_${groupId}`);
  if (cached) {
    console.log("Cache hit for group!");
    return cached;
  }
  return null;
}

export async function setCachedGroup(groupId: string, group: Group): Promise<void> {
  await set(`group_${groupId}`, group);
}

export async function delCachedGroup(groupId: string): Promise<void> {
  await del(`group_${groupId}`);
}
