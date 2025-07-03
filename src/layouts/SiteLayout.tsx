"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerk = useClerk();
  const handleSignOut = useCallback(() => {
    clerk.signOut({ redirectUrl: "/" });
  }, [clerk]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Expounder
          </Link>
          <nav className="flex gap-2">
            <SignedOut>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#">FAQ</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" onClick={handleSignOut} className="hover:cursor-pointer">
                Sign out
              </Button>
            </SignedIn>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="py-6 text-sm border-t bg-background">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Expounder. All rights reserved.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">Open Source</Badge>
            <Badge variant="secondary">MIT License</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}