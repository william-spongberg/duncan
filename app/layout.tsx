import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IoChatbubblesOutline, IoCameraOutline, IoPeopleOutline } from "react-icons/io5";

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
        <main className="flex-grow overflow-y-auto w-full max-w-md mx-auto bg-black">
          {children}
        </main>
        {/* Bottom Navigation Bar */}
        <footer className="sticky bottom-0 z-50 h-16 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-full max-w-md items-center justify-around">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <IoChatbubblesOutline className="h-6 w-6" />
              <span className="sr-only">Chats</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
              <IoCameraOutline className="h-7 w-7" />
              <span className="sr-only">Camera</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <IoPeopleOutline className="h-6 w-6" />
              <span className="sr-only">Friends</span>
            </Button>
          </nav>
        </footer>
      </body>
    </html>
  );
}
