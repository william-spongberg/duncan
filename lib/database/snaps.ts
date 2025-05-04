import { supabase } from "../auth/client";
import type { Snap } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getUserId } from "./user";
import { getProfile } from "./profiles";
import { sendGroupNotification } from "../pwa/actions";
import {
  getCachedGroupSnaps,
  setCachedGroupSnaps,
  delCachedGroupSnaps,
  getCachedSnapUrl,
  setCachedSnapUrl,
} from "../cache/snaps";

// get latest snap for a group
export async function getLatestGroupSnaps(
  groupId: string
): Promise<Snap[]> {
  const { data, error } = await supabase
    .from("snaps")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    throw new Error("Error fetching latest snap: " + error.message);
  }

  return data;
}

// get all snaps for a group
export async function getGroupSnaps(
  groupId: string,
  count?: number
): Promise<Snap[]> {
  // try to get from cache
  const cached = await getCachedGroupSnaps(groupId, count);
  if (cached) {
    return cached;
  }

  // build query
  let query = supabase.from("snaps").select("*").eq("group_id", groupId);
  if (count) {
    query = query.limit(count);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    throw new Error("Error fetching snaps: " + error.message);
  }
  await setCachedGroupSnaps(groupId, data);

  return data;
}

/**
 * Upload a snap/image to a group
 */
export async function uploadSnap(
  groupId: string,
  imageSrc: string,
  userId?: string
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
    "sent you a Snap"
  );
  if (notificationError) {
    throw new Error("Error sending group notification: " + notificationError);
  }
  // invalidate snaps cache for this group
  await delCachedGroupSnaps(groupId);
}

// no cache for single snaps - snap image data likely already stored anyway
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

export async function deleteSnap(snapId: string): Promise<void> {
  const { error } = await supabase
    .from("snaps")
    .delete()
    .eq("id", snapId);

  if (error) {
    throw new Error("Error fetching snap: " + error.message);
  }
}

// get url for image data of snap - downloads from server and saves locally
export async function getSnapImage(storagePath: string): Promise<string> {
  // try cache first
  const cached = await getCachedSnapUrl(storagePath);
  if (cached) {
    return cached;
  }

  // download the file from storage
  const { data, error } = await supabase.storage
    .from("snaps")
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      "Error downloading image: " + (error?.message || "Unknown error")
    );
  }

  // create data url from blob
  const reader = new FileReader();
  const blob = new Blob([data], { type: "image/jpeg" });
  reader.readAsDataURL(blob);

  return new Promise((resolve) => {
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setCachedSnapUrl(storagePath, base64data);
      resolve(base64data);
    };
  });
}
