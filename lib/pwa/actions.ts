"use server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push");
import { createClient } from "@/lib/auth/server";

webpush.setVapidDetails(
  "mailto:william@spongberg.dev",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// send notification to all group members when a snap is posted
export async function sendGroupNotification(
  userId: string,
  username: string,
  groupId: string,
  message: string
) {
  const supabase = await createClient();

  // Get all user_ids in the group
  const { data: groupMembers, error: groupError } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);
  if (groupError) return { success: false, error: groupError.message };
  if (!groupMembers) return { success: false, error: "No group members found" };

  // Get all subscriptions for these users, excluding the user who posted the snap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userIds = groupMembers.map((member: any) => member.user_id);
  userIds.filter((id: string) => id !== userId);
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("endpoint, keys")
    .in("user_id", userIds);
  if (subError) return { success: false, error: subError.message };

  // Send notification to each subscription
  let sent = 0;
  for (const sub of subscriptions || []) {
    try {
      await sendNotification(
        `${username} posted a snap!`,
        message,
        sub.endpoint,
        sub.keys
      );
      sent++;
    } catch (e) {
      throw new Error("Error sending notification: " + e);
    }
  }
  return { success: true, sent };
}

export async function sendNotification(
  title: string,
  message: string,
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys: any
) {
  try {
    await webpush.sendNotification(
      { endpoint, keys },
      JSON.stringify({
        title: title,
        body: message,
        icon: "/icon1.png",
      })
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e };
  }
}

// send a test notification to a specific endpoint
export async function sendTestNotification(
  endpoint: string,
  keys: {
    p256dh: string;
    auth: string;
  },
  message: string
) {
  // send test notification
  const { success, error } = await sendNotification(
    "Test Notification",
    message,
    endpoint,
    keys
  );

  if (error) {
    throw new Error("Error sending test notification: " + error);
  }

  return success;
}
