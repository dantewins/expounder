import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRepoFileContent } from "@/lib/github";

export async function GET(req: Request) {
    const token = (await cookies()).get("gh_token")?.value;
    if (!token) return NextResponse.json({ error: "unauth" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner")!;
    const repo = searchParams.get("repo")!;
    const path = searchParams.get("path")!;
    const data = await getRepoFileContent(token, owner, repo, path);

    return new NextResponse(data as any, { status: 200 });
}