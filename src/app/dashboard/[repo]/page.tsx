"use client";

import { useEffect, useState } from "react";
import { Repo } from "@/lib/github";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReposPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/github/repos");
      if (res.ok) setRepos(await res.json());
      else setRepos([]);
    })();
  }, []);

  if (repos === null) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (repos.length === 0) return null;

  return (
    <>
      {repos.map((r) => (
        <article key={r.id} className="rounded border p-4">
          <Link href={r.htmlUrl} target="_blank" className="font-medium hover:underline">
            {r.fullName}
          </Link>
          {r.private && <span className="ml-2 text-xs">(private)</span>}
          <p className="text-sm text-muted-foreground">{r.description}</p>
        </article>
      ))}
    </>
  );
}
