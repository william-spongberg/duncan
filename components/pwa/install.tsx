"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).MSStream
    );
    setIsAndroid(
      /android/i.test(navigator.userAgent) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  // don't show if not mobile or already installed
  if (isStandalone || (!isIos && !isAndroid)) {
    return null;
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Install App</CardTitle>
      </CardHeader>
      <CardContent>
        {isIos && (
          <p className="mt-2 text-muted-foreground text-sm">
            To install this app on your device, tap the three dots at top right,
            then tap &apos;Install App&apos;
          </p>
        )}
        {isAndroid && (
          <p className="mt-2 text-muted-foreground text-sm">
            To install this app on your device, tap the share button, then tap
            &apos;Add to Home Screen&apos;
          </p>
        )}
      </CardContent>
    </Card>
  );
}
