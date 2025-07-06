"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const clerk = useClerk();
  const handleSignOut = useCallback(() => clerk.signOut({ redirectUrl: "/" }), [clerk]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Expounder
          </Link>
          <nav className="flex gap-2">
            <SignedOut>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Frequently asked questions</DialogTitle>
                    <DialogDescription>
                      Answers to common questions about Expounder.
                    </DialogDescription>
                  </DialogHeader>
                  <Accordion type="single" collapsible className="w-full space-y-1">
                    <AccordionItem value="q1">
                      <AccordionTrigger>Is Expounder free?</AccordionTrigger>
                      <AccordionContent>
                        Yes! The core features are free for personal projects. We may
                        add optional paid tiers in the future.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q2">
                      <AccordionTrigger>Do you store my code?</AccordionTrigger>
                      <AccordionContent>
                        We only keep minimal commit metadata to generate release notes.
                        No source code is ever stored on our servers.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q3">
                      <AccordionTrigger>Which AI model do you use?</AccordionTrigger>
                      <AccordionContent>
                        We use OpenAI GPT‑4o for clustering and summarising commits.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </DialogContent>
              </Dialog>
              <Button size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </SignedIn>
          </nav>
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
