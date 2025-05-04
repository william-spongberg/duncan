import { supabase } from "@/lib/auth/client";
import type { Group, GroupMember } from "./types";
import { getUserId } from "./user";
import {
  getCachedGroupMembers,
  setCachedGroupMembers,
  delCachedGroupMembers,
  getCachedUserGroups,
  setCachedUserGroups,
  delCachedUserGroups,
} from "@/lib/cache/groups";
import { delCachedGroupSnaps } from "../cache/snaps";

// get group
export async function getGroup(
  groupId: string,
  userId?: string
): Promise<Group | null> {
  if (!userId) {
    userId = await getUserId();
  }

  // try to get from cache
  const cached = await getCachedUserGroups(userId);
  if (cached) {
    const group = cached.find((group) => group.id === groupId);
    if (group) {
      return group;
    }
  }

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) {
    throw new Error("Error fetching group: " + error.message);
  }

  return data;
}

/**
 * Create a new group
 */
export async function createGroup(
  name: string,
  createdBy: string,
  userId?: string
): Promise<Group> {
  if (!userId) {
    userId = await getUserId();
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    throw new Error("Error creating group: " + error.message);
  }

  // Add creator as first member
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: createdBy,
  });

  // invalidate user groups
  await delCachedUserGroups(userId);

  return data;
}

export async function leaveGroup(
  groupId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  // delete membership
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Error deleting group: " + error.message);
  }

  // user groups is now stale
  await delCachedUserGroups(userId);

  // delete old cache
  await delCachedGroupSnaps(groupId);
  await delCachedGroupMembers(groupId);
}

export async function deleteGroup(
  groupId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  if (error) {
    throw new Error("Error deleting group: " + error.message);
  }

  // user groups is now stale
  await delCachedUserGroups(userId);

  // delete old cache
  await delCachedGroupSnaps(groupId);
  await delCachedGroupMembers(groupId);
}

/**
 * Add member to a group
 */
export async function addGroupMember(
  groupId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
  });

  if (error) {
    throw new Error("Error adding group member: " + error.message);
  }

  // invalidate cache
  await delCachedGroupMembers(groupId);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  // try to get from cache
  const cached = await getCachedGroupMembers(groupId);
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId);

  if (error) {
    throw new Error("Error fetching group members: " + error.message);
  }

  await setCachedGroupMembers(groupId, data);

  return data;
}

/**
 * Get groups for a user
 */
export async function getUserGroups(userId?: string): Promise<Group[]> {
  if (!userId) {
    userId = await getUserId();
  }

  // try to get from cache
  const cached = await getCachedUserGroups(userId);
  if (cached) {
    return cached;
  }

  // fetch group members for user
  const { data, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error("Error fetching user groups: " + error.message);
  }

  const groupMembers: GroupMember[] = data;
  const groups: Group[] = [];

  // fetch groups for each group user is a member of
  for (const member of groupMembers) {
    const group = await getGroup(member.group_id);
    if (group) {
      groups.push(group);
    }
  }

  await setCachedUserGroups(userId, groups);

  return groups;
}

// get number of groups for a user
export async function getUserGroupsCount(userId?: string): Promise<number> {
  if (!userId) {
    userId = await getUserId();
  }

  // try to get from cache
  const cached = await getCachedUserGroups(userId);
  if (cached) {
    return cached.length;
  }

  const groups = await getUserGroups(userId);
  return groups ? groups.length : 0;
}
