"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { FaqDialog } from "@/components/faq-dialog";
import { MobileMenu } from "@/components/mobile-menu";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [faqOpen, setFaqOpen] = useState(false);
  const clerk = useClerk();
  const handleSignOut = useCallback(() => clerk.signOut({ redirectUrl: "/" }), [clerk]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Expounder
          </Link>
          <nav className="hidden sm:flex gap-2">
            <SignedOut>
              <FaqDialog open={faqOpen} setOpen={setFaqOpen} />
              <Button size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </SignedIn>
          </nav>
          <MobileMenu faqOpen={faqOpen} setFaqOpen={setFaqOpen} />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <footer className="py-6 text-sm border-t bg-background">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Expounder. All rights reserved.</p>
          Made with ❤️ by Danny Kim
        </div>
      </footer>
    </div>
  );
}
