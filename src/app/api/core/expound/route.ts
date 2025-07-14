import { NextRequest, NextResponse } from "next/server";
import { fetchRepoTree, fetchBlobText } from "@/lib/github";
import OpenAI from "openai";
import pLimit from "p-limit";
import { readmeSchema } from "@/lib/schemas";

export const runtime = "edge";
export const maxDuration = 120;

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY!,
});

const MODEL = "o4-mini";
const CONCURRENCY = 6;
const CHUNK_BYTES = 80_000;
const BINARY_RE = /\.(png|jpe?g|gif|svg|ico|pdf|zip|tar|gz|mp[34]|mov|avi|woff2?)$/i;

function* chunk(text: string) {
    let offset = 0;
    while (offset < text.length) {
        yield text.slice(offset, offset + CHUNK_BYTES);
        offset += CHUNK_BYTES;
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get("gh_token")?.value;
    if (!token) {
        return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    const { ownerRepo, description } = (await req.json()) as {
        ownerRepo?: string;
        description?: string;
    };

    if (!ownerRepo) {
        return NextResponse.json({ error: "Missing ownerRepo" }, { status: 400 });
    }

    const [owner, repo] = ownerRepo.split("/");

    const tree = await fetchRepoTree(token, owner, repo);
    const blobs = tree.filter((n: any) => n.type === "blob" && !BINARY_RE.test(n.path));

    const limiter = pLimit(CONCURRENCY);
    const fileIds: string[] = [];

    await Promise.all(
        blobs.map((node: any) =>
            limiter(async () => {
                const raw = await fetchBlobText(token, owner, repo, node.sha!);
                let part = 0;
                for (const slice of chunk(raw)) {
                    const file = new File([slice], `${node.path.replace(/\//g, "_")}.${part++}.txt`, {
                        type: "text/plain",
                    });
                    const uploaded = await openai.files.create({ file, purpose: "assistants" });
                    fileIds.push(uploaded.id);
                }
            }),
        ),
    );

    const vectorStore = await openai.vectorStores.create({
        name: `repo_${owner}_${repo}_${Date.now()}`,
        file_ids: fileIds,
    });

    const systemPrompt = [
        `Repository: ${ownerRepo}`,
        `Description: ${description}`,
        `Generate a clear, comprehensive README with the sections below.`,
        `Sections: Title · Tagline · Badges · Overview · Architecture (Mermaid) ·`,
        `Features · Installation · Configuration · Usage (CLI & API) ·`,
        `Folder Structure · Tests · Roadmap · Contributing · License · Acknowledgements`,
    ].join("\n");

    const response = await openai.responses.create({
        model: MODEL,
        input: systemPrompt,
        text: {
            "format": readmeSchema
        },
        reasoning: {
            "effort": "high"
        },
        tools: [
            {
                "type": "file_search",
                "vector_store_ids": [
                    vectorStore.id
                ]
            }
        ],
        store: true
    });

    type MessageOutput = Extract<
        (typeof response)["output"][number],
        { type: "message" }
    >;

    const messageItem = response.output?.find(
        (o): o is MessageOutput => o.type === "message"
    );

    const messageContent = messageItem?.content
        .find(part => part.type === "output_text")
        ?.text;

    if (!messageContent) {
        console.error("No output_text content found in model response");
        return NextResponse.json(
            { error: "No output_text content found in model response" },
            { status: 500 },
        );
    }

    let blocks;
    try {
        const parsed = JSON.parse(messageContent);
        blocks = parsed.blocks;
        if (!blocks) {
            throw new Error("No 'blocks' field found in the parsed response");
        }
    } catch (err) {
        console.error("README parse error:", err);
        return NextResponse.json({ error: "Failed to parse model response as JSON" }, { status: 500 });
    }

    return NextResponse.json({ blocks }, { status: 200 });
}