"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-center gap-12 p-6 sm:p-12 max-w-6xl w-full mx-auto rounded-3xl bg-background">
      <div className="flex-1 max-w-lg space-y-5 text-center lg:text-left sm:space-y-6">
        <Badge variant="outline" className="py-2 px-4 rounded-4xl mx-auto lg:mx-0 w-max hover:cursor-default gap-1">
          <span className="text-sm font-medium">Beta access</span>
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          Your <span className="text-primary">Release‑Note</span>
          <br className="hidden sm:block" /> Partner, On&nbsp;
          <br className="hidden sm:block" /> Demand.
        </h1>
        <p className="text-muted-foreground text-lg">
          Drag & drop your changelog and Expounder turns it into polished notes
          for Notion, Markdown, and X — instantly.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard/expounds">Get started</Link>
        </Button>
      </div>
      <div className="relative flex-1 w-full aspect-square max-w-md hidden lg:block ">
        <Image
          src="/hero.png"
          alt="rocket"
          fill
          sizes="(max-width: 1024px) 60vw, 400px"
        />
      </div>
    </section>
  );
}
