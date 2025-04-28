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
    <html lang="en">
      <body
        className={cn(
          "relative flex h-full flex-col bg-background font-sans",
          geistSans.variable,
          geistMono.variable,
          "antialiased"
        )}
      >
        <main className="flex-grow overflow-y-auto w-full max-w-md mx-auto bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {children}
        </main>
        {/* Bottom Navigation Bar */}
        <footer className="sticky bottom-0 z-50 h-16 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-full max-w-md items-center justify-around">
            <Link href="/snaps">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <IoImagesOutline className="h-6 w-6" />
                <span className="sr-only">Images</span>
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <IoCameraOutline className="h-7 w-7" />
                <span className="sr-only">Camera</span>
              </Button>
            </Link>
            <Link href="/friends">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <IoPeopleOutline className="h-6 w-6" />
                <span className="sr-only">Friends</span>
              </Button>
            </Link>
            <Link href="/protected">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <IoPersonOutline className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
