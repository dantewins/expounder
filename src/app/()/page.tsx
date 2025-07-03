"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <section className="container mx-auto max-w-4xl w-full text-center flex flex-col items-center justify-center gap-6 py-16 md:py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Release notes, <span className="text-primary">automated.</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl">
          Drag & drop your changelog and watch Expounder craft polished release notes in seconds — no config, no fuss.
        </p>
        <div>
          <Button size="lg" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              Get started <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
