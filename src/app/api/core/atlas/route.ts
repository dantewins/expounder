import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import OpenAI from "openai";
import pLimit from "p-limit";

export const runtime = "edge";
export const maxDuration = 60;

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY!,
});

const MAX_FILES = 100;
const MAX_SIZE = 60_000;
const CONCURRENCY = 4;
const MODEL = "gpt-4o-mini";

const IMPORT_RE =
    /import\s+(?:[\w*\s{},]+\s+from\s+)?["']([^"']+)["']|require\(["']([^"']+)["']\)/g;

function normalizePath(from: string, rel: string): string {
    const parts = [...from.split("/").slice(0, -1), ...rel.split("/")];
    const stack: string[] = [];
    for (const p of parts) {
        if (p === "." || p === "") continue;
        if (p === "..") stack.pop();
        else stack.push(p);
    }
    const out = stack.join("/");
    return out.endsWith(".ts") || out.endsWith(".js") ? out : `${out}.ts`;
}

export async function POST(req: NextRequest) {
    /* 1. auth + inputs */
    const token = req.cookies.get("gh_token")?.value;
    if (!token) {
        return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    const { repo } = (await req.json()) as { repo: string };
    if (!repo || !repo.includes("/"))
        return NextResponse.json({ error: "repo param malformed" }, { status: 400 });

    const [owner, name] = repo.split("/");

    const octokit = new Octokit({ auth: token });
    const treeResp = await octokit.request(
        "GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
        { owner, repo: name, branch: "HEAD" }
    );

    const codeFiles = treeResp.data.tree
        .filter(
            (n: any) =>
                n.type === "blob" &&
                n.size! <= MAX_SIZE &&
                /\.(tsx?|jsx?)$/.test(n.path)
        )
        .slice(0, MAX_FILES);

    const limit = pLimit(CONCURRENCY);

    const nodes: {
        id: string;
        file: string;
        summary: string;
        apis: string[];
    }[] = [];
    const edges: { from: string; to: string; type: string }[] = [];

    await Promise.all(
        codeFiles.map((file: any) =>
            limit(async () => {
                const blob = await octokit.request(
                    "GET /repos/{owner}/{repo}/contents/{path}",
                    {
                        owner,
                        repo: name,
                        path: file.path,
                        mediaType: { format: "raw" },
                    }
                );
                const content = blob.data as unknown as string;

                let m: RegExpExecArray | null;
                while ((m = IMPORT_RE.exec(content))) {
                    const target = m[1] || m[2];
                    if (target?.startsWith(".")) {
                        const resolved = normalizePath(file.path, target);
                        edges.push({ from: file.path, to: resolved, type: "import" });
                    }
                }

                const { choices } = await openai.chat.completions.create({
                    model: MODEL,
                    temperature: 0,
                    max_tokens: 220,
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are an expert software analyst. Summarise the intention of the file in ≤80 words, then list its public APIs (one per line, bullet‑prefixed).",
                        },
                        {
                            role: "user",
                            content: `### File path\n${file.path}\n\n### Code (trimmed)\n\`\`\`\n${content.slice(
                                0,
                                12_000
                            )}\n\`\`\``,
                        },
                    ],
                });

                const raw = choices[0].message.content?.trim() ?? "";
                const [summary, ...apiLines] = raw.split("\n");
                const apis = apiLines
                    .map((l) => l.replace(/^[-*]\s*/, "").trim())
                    .filter(Boolean);

                nodes.push({
                    id: file.path,
                    file: file.path,
                    summary,
                    apis,
                });
            })
        )
    );

    return NextResponse.json({ nodes, edges });
}
