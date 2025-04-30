import { supabase } from "@/lib/auth/client";
import type { Group, GroupMember } from "./types";
import { getUserId } from "./user";
import { getCachedGroup, setCachedGroup, delCachedGroup } from "@/lib/cache/groups";

// get group
export async function getGroup(groupId: string): Promise<Group | null> {
  // Try to get from cache
  const cached = await getCachedGroup(groupId);
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) {
    throw new Error("Error fetching group: " + error.message);
  }


  await setCachedGroup(groupId, data);

  return data;
}

/**
 * Create a new group
 */
export async function createGroup(
  name: string,
  createdBy: string
): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Error creating group: " + error.message);
  }

  // Add creator as first member
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: createdBy,
  });

  // Cache the group
  await setCachedGroup(data.id, data);

  return data;
}

/**
 * Add member to a group
 */
export async function addGroupMember(
  groupId: string,
  userId: string | null = null
): Promise<GroupMember | null> {
  if (!userId) {
    userId = await getUserId();
  }

  const { data, error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Error adding group member: " + error.message);
  }

  // invalidate cache
  await delCachedGroup(groupId);

  return data;
}

export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId);

  if (error) {
    throw new Error("Error fetching group members: " + error.message);
  }

  return data;
}

/**
 * Get groups for a user
 */
export async function getUserGroups(
  userId: string | null = null
): Promise<Group[]> {
  if (!userId) {
    userId = await getUserId();
  }
  
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      group_id,
      groups:groups(id, name, created_at, created_by)
    `
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error("Error fetching user groups: " + error.message);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Extract groups from the nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => item.groups) as Group[];
}

// get number of groups for a user
export async function getUserGroupsCount(
  userId: string | null = null
): Promise<number> {
  if (!userId) {
    userId = await getUserId();
  }
  
  const groups = await getUserGroups(userId);
  return groups ? groups.length : 0;
}
