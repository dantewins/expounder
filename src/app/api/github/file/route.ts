import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;
    if (!token) return NextResponse.json({ error: "unauth" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner")!;
    const repo = searchParams.get("repo")!;
    const path = searchParams.get("path")!;

    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        headers: { Accept: "application/vnd.github.raw" },
    });

    return new NextResponse(data as any, { status: 200 });
}