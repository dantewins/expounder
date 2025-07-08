import { NextRequest, NextResponse } from "next/server";
import { fetchRepoTree, fetchBlobText } from "@/lib/github";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { readmeSchema } from "@/lib/schemas";
import { cookies } from "next/headers";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY! });

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const token = (await cookies()).get("gh_token")?.value;
    if (!token) return NextResponse.json([], { status: 200 });

    const { ownerRepo, description } = await req.json();
    if (!ownerRepo || !description) {
        return NextResponse.json({ error: "Missing ownerRepo or description" }, { status: 400 });
    }

    const [owner, repoName] = ownerRepo.split("/");

    const tree = await fetchRepoTree(token, owner, repoName);

    const codeFiles = tree.filter(
        (n: any) =>
            n.type === "blob" &&
            n.size! < 100_000 &&
            !/\.(png|jpe?g|gif|svg|ico|pdf|zip|tar|gz|mp4|mp3|mov|woff2?)$/i.test(n.path)
    );

    const fileSummaries: string[] = [];

    for (const node of codeFiles) {
        const content = await fetchBlobText(token, owner, repoName, node.sha!);
        if (!content.trim()) continue;

        const chunkPrompt: ChatCompletionMessageParam[] = [
            { role: "system", content: "You are an expert software analyst." },
            {
                role: "user",
                content:
                    `File path: ${node.path}\n\n` +
                    "Summarise the intention and key API surface of this file in ≤ 120 words. " +
                    "Omit obvious framework boilerplate.",
            },
            { role: "user", content: "```" + content.slice(0, 10_000) + "```" },
        ];

        const { choices } = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: chunkPrompt,
            max_tokens: 250,
            temperature: 0.2,
        });

        fileSummaries.push(`◾ **${node.path}** – ${choices[0].message.content!.trim()}`);
    }

    const synthPrompt: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content:
                "You are a seasoned open-source maintainer who writes clear, professional README.md files.",
        },
        {
            role: "user",
            content:
                `Using the digests below, create a **full README.md** that follows common GitHub conventions. ` +
                `Include:\n` +
                `• H1 project title and short tagline\n` +
                `• Table of Contents\n` +
                `• Key features (bullets)\n` +
                `• Prerequisites / environment variables if any\n` +
                `• Step-by-step installation & local dev commands\n` +
                `• Basic usage examples (code blocks)\n` +
                `• How to run tests / lint / build\n` +
                `• Contributing section (fork → branch → PR)\n` +
                `• License\n\n` +
                `Return **only** via the function call below; the README must be pure Markdown, no HTML.\n\n` +
                `Digests:\n\n${fileSummaries.join("\n")}`,
        },
    ];

    const { choices } = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: synthPrompt,
        tools: [
            {
                type: "function",
                function: {
                    name: "write_readme",
                    description: "Return the README in a strict JSON shape.",
                    parameters: readmeSchema,
                },
            },
        ],
        tool_choice: { type: "function", function: { name: "write_readme" } },
        max_tokens: 2000,
        temperature: 0.3,
    });

    const toolCall = choices[0].message.tool_calls?.[0];
    if (!toolCall) {
        return NextResponse.json(
            { error: "LLM did not provide a tool call." },
            { status: 500 },
        );
    }

    const safeReadme = JSON.parse(toolCall.function.arguments);

    return NextResponse.json(safeReadme.blocks);
}