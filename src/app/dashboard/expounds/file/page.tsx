"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { ReadmeBlock } from "@/lib/schemas";
import { Markdown } from "@/components/markdown";
import { Loader2 } from "lucide-react";

export default function ExpoundFilePage() {
    const searchParams = useSearchParams();

    const owner = useMemo(() => searchParams.get("owner") ?? "", [searchParams]);
    const repo = useMemo(() => searchParams.get("repo") ?? "", [searchParams]);
    const timestamp = useMemo(
        () => searchParams.get("timestamp") ?? "",
        [searchParams],
    );

    const [fileText, setFileText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!owner || !repo || !timestamp) {
            setError("Missing parameters: owner, repo, or timestamp");
            return;
        }

        const apiUrl =
            `/api/core/expound/fetch/file` +
            `?owner=${encodeURIComponent(owner)}` +
            `&repo=${encodeURIComponent(repo)}` +
            `&timestamp=${encodeURIComponent(timestamp)}`;

        const fetchData = async () => {
            try {
                const res = await fetch(apiUrl, {
                    headers: { Accept: "text/markdown" },
                    next: { revalidate: 0 },
                });

                if (!res.ok) {
                    const { error: apiError } = (await res.json()) as { error?: string };
                    setError(apiError || "Failed to fetch expound");
                    return;
                }

                setFileText(await res.text());
            } catch {
                setError("An unexpected error occurred");
            }
        };

        fetchData();
    }, [owner, repo, timestamp]);

    function handleDownload(fileText: string) {
        const blob = new Blob([fileText], {
            type: "text/markdown;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.download = "README.md";
        a.rel = "noopener";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (fileText === null) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">This may take a minute...</p>
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {owner}/{repo}
                    </CardTitle>
                    <CardDescription>
                        Read‑only preview – {fileText.length.toLocaleString()} bytes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap text-sm font-mono max-h-[60vh] overflow-auto bg-muted/40 p-2 rounded">
                        {fileText}
                    </pre>
                </CardContent>
            </Card>
            <div className="grid w-full gap-2 md:inline-flex">
                <Button onClick={() => handleDownload(fileText)} className="w-full lg:w-[150px] hover:cursor-pointer">
                    Download
                </Button>
            </div>
        </>
    );
}