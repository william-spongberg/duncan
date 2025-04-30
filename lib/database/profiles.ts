import { supabase } from "../auth/client";
import type { Profile } from "./types";
import { getUserId } from "./user";
import { getCachedProfile, setCachedProfile, delCachedProfile } from "@/lib/cache/profiles";

/**
 * Get a user's profile by ID
 */
export async function getProfile(
  userId: string | null = null
): Promise<Profile> {
  if (!userId) {
    userId = await getUserId();
  }

  // try to get from cache
  const cached = await getCachedProfile(userId);
  if (cached) {
    return cached;
  }
  
  // fetch profile from database
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("Error fetching profile: " + error.message);
  }

  // cache the profile
  await setCachedProfile(userId, data);

  return data;
}

export async function updateProfileUsername(
  username: string,
  userId: string | null = null
): Promise<Profile> {
  if (!userId) {
    userId = await getUserId();
  }

  // update profile in database
  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error("Error updating profile: " + error.message);
  }

  // update cache
  await setCachedProfile(userId, { ...data, username });

  return data;
}

/**
 * Create or update a profile
 */
export async function upsertProfile(
  profile: Partial<Profile> & { id: string }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) {
    throw new Error("Error upserting profile: " + error.message);
  }

  // invalidate cache
  await delCachedProfile(profile.id);

  return data;
}

// partial match search for users by username
export async function searchProfiles(username: string): Promise<Profile[]> {
  // Search for users by username (partial match)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, updated_at")
    .ilike("username", `%${username}%`)
    .limit(10);

  if (error) {
    throw new Error("Error searching users: " + error.message);
  }
  
  return data;
}