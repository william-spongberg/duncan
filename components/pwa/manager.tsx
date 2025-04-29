"use client";

import { useState, useEffect } from "react";
import { sendTestNotification } from "@/lib/pwa/actions";
import {
  getSubscriptionData,
  subscribeUser,
  unsubscribeUser,
} from "@/lib/database/subscriptions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { urlBase64ToUint8Array } from "./utils";

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function handleSubscribeUser() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    await subscribeUser(sub);
  }

  async function handleUnsubscribeUser() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function handleSendTestNotification() {
    if (subscription) {
      const { endpoint, keys } = getSubscriptionData(subscription);
      await sendTestNotification(endpoint, keys, message);
      setMessage("");
    } else {
      console.error("No subscription found!");
    }
  }

  if (!isSupported) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Push notifications are not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Manage your push notification subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <>
            <p className="mb-2 text-green-700 dark:text-green-400">
              You are subscribed to push notifications.
            </p>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={handleUnsubscribeUser}
                type="button"
              >
                Unsubscribe
              </Button>
            </div>
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring"
            />
            <Button onClick={handleSendTestNotification} type="button">
              Send Test
            </Button>
          </>
        ) : (
          <>
            <p className="mb-2 text-muted-foreground">
              You are not subscribed to push notifications.
            </p>
            <Button onClick={handleSubscribeUser} type="button">
              Subscribe
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}