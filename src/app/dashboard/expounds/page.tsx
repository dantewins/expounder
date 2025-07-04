"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ExpoundsPage() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    // 1️⃣ fetch commits via our Edge fn
    const commits: string[] = await fetch("/api/github", {
      method: "POST",
      body: JSON.stringify({ compareUrl: url }),
    }).then(r => r.json());

    // 2️⃣ GPT summary
    const sum = await fetch("/api/summarize", {
      method: "POST",
      body: JSON.stringify({ commits }),
    }).then(r => r.json());

    setSummary(sum);
    setLoading(false);
  }

  function handleSave() {
    const notes = JSON.parse(localStorage.getItem("expounder_notes") || "[]");
    localStorage.setItem(
      "expounder_notes",
      JSON.stringify([...notes, { summary, date: Date.now(), url }])
    );
    window.location.href = "/dashboard";
  }

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      {!summary ? (
        <>
          <Input
            placeholder="https://github.com/org/repo/compare/v1.0.0...v1.1.0"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <Button onClick={handleGenerate} disabled={!url || loading}>
            {loading ? "Generating…" : "Generate notes"}
          </Button>
        </>
      ) : (
        <>
          {/* simple preview */}
          <div className="rounded border p-4 space-y-4">
            {summary.map(block => (
              <div key={block.title}>
                <h3 className="font-semibold">{block.title}</h3>
                <ul className="ml-5 list-disc text-sm">
                  {block.items.map((i: string) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Button onClick={handleSave}>Save to dashboard</Button>
        </>
      )}
    </div>
  );
}
