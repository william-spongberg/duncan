import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IoImagesOutline,
  IoCameraOutline,
  IoPeopleOutline,
  IoPersonOutline,
} from "react-icons/io5";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duncan",
  description: "Made for Helen ❤️",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Duncan" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          "relative flex h-full flex-col bg-background font-sans",
          geistSans.variable,
          geistMono.variable,
          "antialiased"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex-grow overflow-y-auto w-full max-w-md mx-auto backdrop-blur">
            {children}
            <SpeedInsights />
          </main>
          {/* Bottom Navigation Bar */}
          <footer className="sticky bottom-0 z-50 h-16 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto flex h-full max-w-lg items-center justify-around">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/snaps">
                    <IoImagesOutline className="size-6" title="Images" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/">
                  <IoCameraOutline className="size-6" title="Camera" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/people">
                  <IoPeopleOutline className="size-6" title="People" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/protected">
                  <IoPersonOutline className="size-6" title="Profile" />
                </Link>
              </Button>
            </nav>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
