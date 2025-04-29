"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InstallPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsMobile(
      /iPad|iPhone|iPod|Android/.test(navigator.userAgent) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  // don't show if not mobile or already installed
  if (isStandalone || !isMobile) {
    return null;
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Install App</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mt-2 text-muted-foreground text-sm">
          To install this app on your device, tap the three dots at top right,
          then tap &apos;Install App&apos;
        </p>
      </CardContent>
    </Card>
  );
}
