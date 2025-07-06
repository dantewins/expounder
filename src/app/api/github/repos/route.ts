import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listUserRepos } from "@/lib/github";

export async function GET() {
    const token = (await cookies()).get("gh_token")?.value;
    if (!token) return NextResponse.json([], { status: 200 });

    const repos = await listUserRepos(token);
    
    return NextResponse.json(repos);
}