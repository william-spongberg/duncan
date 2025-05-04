import { supabase } from "../auth/client";
import { getUserId } from "./user";
import { v4 as uuidv4 } from "uuid";

// ?used by server components, so pushsubscription data is stringified

// store a user's push subscription in Supabase
export async function subscribeUser(
  sub: PushSubscription,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    userId = await getUserId();
  }

  // get subscription data
  const id = await getSubscriptionId(userId);
  const { endpoint, keys } = getSubscriptionData(sub);

  const { error } = await supabase.from("subscriptions").upsert({
    id,
    user_id: userId,
    endpoint,
    keys,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// remove a user's push subscription from Supabase
export async function unsubscribeUser(
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    userId = await getUserId();
  }

  // get subscription id from device
  const id = await getSubscriptionId(userId);

  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// different subscription per device - each device saves its own id for each user
export async function getSubscriptionId(
  userId?: string
): Promise<string> {
  if (!userId) {
    userId = await getUserId();
  }

  if (typeof window === "undefined") {
    throw new Error("getSubscriptionId can only be called in the browser!");
  }

  let deviceId = localStorage.getItem(userId);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(userId, deviceId);
  }

  return deviceId;
}

// get endpoint + keys from push subscription object
export function getSubscriptionData(sub: PushSubscription): {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  const { endpoint } = sub;
  const keys = {
    p256dh: Buffer.from(sub.getKey("p256dh") as ArrayBuffer).toString("base64"),
    auth: Buffer.from(sub.getKey("auth") as ArrayBuffer).toString("base64"),
  };
  return { endpoint, keys };
}
