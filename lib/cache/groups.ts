import { get, set, del } from "idb-keyval";
import type { Group, GroupMember } from "@/lib/database/types";

// group member cache
export async function getCachedGroupMembers(
  groupId: string
): Promise<GroupMember[] | null> {
  const cached = await get(`group_members_${groupId}`);
  if (cached) {
    console.log("Cache hit for group members!");
    return cached;
  }
  return null;
}

export async function setCachedGroupMembers(
  groupId: string,
  members: GroupMember[]
): Promise<void> {
  await set(`group_members_${groupId}`, members);
}

export async function delCachedGroupMembers(groupId: string): Promise<void> {
  await del(`group_members_${groupId}`);
}

// user groups cache
export async function getCachedUserGroups(
  userId: string
): Promise<Group[] | null> {
  const cached = await get(`groups_${userId}`);
  if (cached) {
    console.log("Cache hit for user groups!");
    return cached;
  }
  return null;
}

export async function setCachedUserGroups(
  userId: string,
  groups: Group[]
): Promise<void> {
  await set(`groups_${userId}`, groups);
}

export async function delCachedUserGroups(userId: string): Promise<void> {
  await del(`groups_${userId}`);
}
