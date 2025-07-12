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
        return NextResponse.json(
            { error: "Missing ownerRepo or description" },
            { status: 400 },
        );
    }

    const [owner, repoName] = ownerRepo.split("/");

    const tree = await fetchRepoTree(token, owner, repoName);
    const codeFiles = tree.filter(
        (n: any) =>
            n.type === "blob" &&
            n.size! < 100_000 &&
            !/\.(png|jpe?g|gif|svg|ico|pdf|zip|tar|gz|mp4|mp3|mov|woff2?)$/i.test(
                n.path,
            ),
    );

    const fileSummaries: string[] = [];

    for (const node of codeFiles) {
        const content = await fetchBlobText(token, owner, repoName, node.sha!);
        if (!content.trim()) continue;

        const chunkPrompt: ChatCompletionMessageParam[] = [
            { role: "system", content: "You are an expert software analyst." },
            {
                role: "user",
                content: `File path: ${node.path}\n\nSummarise the intention and key API surface of this file in ≤ 120 words. Omit obvious framework boilerplate.`,
            },
            { role: "user", content: "```" + content.slice(0, 10_000) + "```" },
        ];

        const { choices } = await openai.chat.completions.create({
            model: "o4-mini",
            messages: chunkPrompt,
            max_completion_tokens: 1000,
        });

        fileSummaries.push(
            `◾ **${node.path}** – ${choices[0].message.content!.trim()}`,
        );
    }

    const synthPrompt: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content:
                "You are a seasoned open-source maintainer who writes clear, professional README.md files.",
        },
        {
            role: "user",
            content: `Using the digests below, create a *full* README.md. Follow GitHub conventions and **respond *only* by calling the \`write_readme\` function**.\n\nDigests:\n\n${fileSummaries.join(
                "\n",
            )}`,
        },
    ];

    const { choices } = await openai.chat.completions.create({
        model: "o4-mini",
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
        max_completion_tokens: 2000,
    });

    const toolCall = choices[0].message.tool_calls?.[0];

    if (!toolCall) {
        console.warn("LLM skipped tool call – returning raw content.");
        const rawReadme = choices[0].message.content ?? "";
        return NextResponse.json([{ type: "markdown", text: rawReadme }]);
    }

    try {
        const safeReadme = JSON.parse(toolCall.function.arguments);
        return NextResponse.json(safeReadme.blocks);
    } catch (e) {
        console.error("Failed to parse tool_call arguments:", e);
        return NextResponse.json(
            { error: "Malformed tool_call from OpenAI." },
            { status: 500 },
        );
    }
}
