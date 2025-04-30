import { get, set, del } from "idb-keyval";
import type { Group, GroupMember } from "@/lib/database/types";

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

export async function getCachedGroupMembers(groupId: string): Promise<GroupMember[] | null> {
  const cached = await get(`group_members_${groupId}`);
  if (cached) {
    console.log("Cache hit for group members!");
    return cached;
  }
  return null;
}

export async function setCachedGroupMembers(groupId: string, members: GroupMember[]): Promise<void> {
  await set(`group_members_${groupId}`, members);
}

export async function delCachedGroupMembers(groupId: string): Promise<void> {
  await del(`group_members_${groupId}`);
}

export async function getCachedUserGroups(userId: string): Promise<Group[] | null> {
  const cached = await get(`user_groups_${userId}`);
  if (cached) {
    console.log("Cache hit for user groups!");
    return cached;
  }
  return null;
}

export async function setCachedUserGroups(userId: string, groups: Group[]): Promise<void> {
  await set(`user_groups_${userId}`, groups);
}