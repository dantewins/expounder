import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRepoFileTree } from "@/lib/github";

export async function GET(req: NextRequest) {
    const token = (await cookies()).get("gh_token")?.value;
    if (!token) return NextResponse.json({ error: "unauth" }, { status: 401 });
    
    const repoId = new URL(req.url).searchParams.get("repoId");
    if (!repoId) return NextResponse.json({ error: "repoId required" }, { status: 400 });

    try {
        const tree = await getRepoFileTree(token, repoId);
        return NextResponse.json(tree);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}