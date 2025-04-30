import { supabase } from "../auth/client";
import type { Snap } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getUserId } from "./user";
import { getProfile } from "./profiles";
import { sendGroupNotification } from "../pwa/actions";

// get all snaps for a group
export async function getGroupSnaps(groupId: string, count: number | null = null): Promise<Snap[]> {
  // build query
  let query = supabase.from("snaps").select("*").eq("group_id", groupId);
  if (count) {
    query = query.limit(count);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching snaps: " + error.message);
  }

  return data;
}

/**
 * Upload a snap/image to a group
 */
export async function uploadSnap(
  groupId: string,
  imageSrc: string,
  userId: string | null = null
): Promise<void> {
  if (!userId) {
    userId = await getUserId();
  }

  // get user profile
  let { username } = await getProfile(userId);

  if (!username) {
    username = "Unknown";
  }

  // convert base64 to blob
  const res = await fetch(imageSrc);
  const blob = await res.blob();
  const file = new File([blob], `snap_${Date.now()}.jpg`, {
    type: "image/jpeg",
  });

  // create a unique file path
  const filePath = `${groupId}/${uuidv4()}_${Date.now()}.jpg`;

  // upload file to storage
  const { error: storageError } = await supabase.storage
    .from("snaps")
    .upload(filePath, file);

  if (storageError) {
    throw new Error("Error uploading image: " + storageError.message);
  }

  // create new snap record in database
  const { error: snapsError } = await supabase.from("snaps").insert({
    group_id: groupId,
    uploader_user_id: userId,
    storage_object_path: filePath,
  });

  if (snapsError) {
    throw new Error("Error creating snap record: " + snapsError.message);
  }

  // send notification
  const { error: notificationError } = await sendGroupNotification(
    userId,
    username,
    groupId,
    "New snap uploaded!"
  );

  if (notificationError) {
    throw new Error("Error sending group notification: " + notificationError);
  }
}

export async function getSnap(snapId: string): Promise<Snap> {
  const { data, error } = await supabase
    .from("snaps")
    .select("*")
    .eq("id", snapId)
    .single();

  if (error) {
    throw new Error("Error fetching snap: " + error.message);
  }

  return data;
}

/**
 * Get a public URL for a snap/image
 */
export async function getSnapUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("snaps")
    .createSignedUrl(storagePath, 24 * 60); // 24 hour expiry

  if (error || !data?.signedUrl) {
    throw new Error(
      "Error generating signed URL: " + (error?.message || "Unknown error")
    );
  }

  return data.signedUrl;
}
