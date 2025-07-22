import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchRepoTree, fetchBlobText } from "@/lib/github";
import OpenAI from "openai";
import pLimit from "p-limit";
import { readmeSchema, ReadmeBlock } from "@/lib/schemas";
import { Markdown } from "@/components/markdown";
import { uploadToDropbox } from "@/lib/dropbox";

export const runtime = "nodejs";
export const maxDuration = 300;

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
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.cookies.get("gh_token")?.value;
    if (!token) {
        return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    const { ownerRepo } = (await req.json()) as {
        ownerRepo?: string;
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
        `Analyze the repository at ${ownerRepo}, including its file structure, code, and documentation files.`,
        "Generate a clear, comprehensive README based on the actual content and functionality of the repository.",
        "Do not rely on the existing repository description or README, as they may be outdated.",
        "Use a professional yet approachable tone, ensuring the language is clear and accessible to developers of various skill levels.",
        "Include the following sections in the README only if they are relevant to the codebase:",
        "- Badges: Include relevant badges (e.g., build status, version, license) right after the title and tagline. Ensure they are on one line with a single preceding space.",
        "- Title: The name of the repository.",
        "- Tagline: A brief, one-sentence description of what the repository does.",
        "- Overview: A detailed description of the repository’s purpose and key features.",
        "- Architecture: If the repository has a discernible architecture (e.g., frontend, backend, APIs, databases, external services), provide a Mermaid diagram illustrating the high-level architecture. Show main components and their interactions. Use standard Mermaid syntax, such as rectangles for components (`component[\"label\"]`) and arrows for interactions (`-->`, `-->`). Enclose labels with special characters in quotes. If the architecture is simple or unclear, provide a brief textual description instead.",
        "- Features: List the main features of the tool or library.",
        "- Installation: Instructions on how to install the tool or library.",
        "- Configuration: Any configuration options or settings (omit if not applicable).",
        "- Usage: Detailed usage instructions, covering CLI and/or API if applicable (omit if not relevant).",
        "- Tests: Information on how to run tests (omit if no tests are present).",
        "- Roadmap: Future plans or upcoming features.",
        "- Contributing: Guidelines for contributing to the repository.",
        "- License: The license under which the repository is released.",
        "- Acknowledgements: Credits or thanks to contributors or dependencies.",
        "If a section is not applicable (e.g., no CLI, no tests, no configuration options), omit it.",
        "Ensure all content is accurate and reflects the actual functionality based on the code and files in the repository. Do not make assumptions or include speculative information."
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

    let blocks: ReadmeBlock[];
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

    const markdown = Markdown(blocks);

    const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
    });

    const timestamp = Date.now();
    const dropboxPath = `/expounder/README\`${userId}\`${owner}\`${repo}\`${timestamp}.md`;

    const uploadSuccess = await uploadToDropbox(dropboxPath, blob);

    if (!uploadSuccess) {
        console.warn("Dropbox upload failed, but continuing with response");
    }

    return NextResponse.json({ blocks }, { status: 200 });
}