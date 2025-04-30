import { get, set, del } from "idb-keyval";
import type { Snap } from "@/lib/database/types";

export async function getCachedGroupSnaps(
  groupId: string,
  count: number | null = null
): Promise<Snap[] | null> {
  // Try to get from cache
  const cached = await get(`group_snaps_${groupId}`);
  if (cached) {
    console.log("Cache hit for snaps!");

    // if enough cached snaps, return them - else bad cache
    if (count && !(count > cached.snaps.length)) {
      return cached.snaps.slice(0, count);
    }
  }

  return null;
}

export async function setCachedGroupSnaps(
  groupId: string,
  snaps: Snap[]
): Promise<void> {
  await set(`group_snaps_${groupId}`, { snaps });
}

export async function delCachedGroupSnaps(groupId: string): Promise<void> {
  await del(`group_snaps_${groupId}`);
}

export async function getCachedSnap(snapId: string): Promise<Snap | null> {
  const cached = await get(`snap_${snapId}`);
  if (cached) {
    console.log("Cache hit for snap!");
    return cached;
  }
  return null;
}

export async function setCachedSnap(snapId: string, snap: Snap): Promise<void> {
  await set(`snap_${snapId}`, snap);
}

export async function getCachedSnapUrl(storagePath: string): Promise<string | null> {
  const cached = await get(`snap_url_${storagePath}`);
  if (cached) {
    console.log("Cache hit for snap URL!");
    return cached;
  }
  return null;
}

export async function setCachedSnapUrl(
  storagePath: string,
  url: string
): Promise<void> {
  await set(`snap_url_${storagePath}`, url);
}
