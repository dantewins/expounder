import { cookies } from "next/headers";
import { listUserRepos } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;
    if (!token) return NextResponse.json([], { status: 200 });

    const repos = await listUserRepos(token);
    return NextResponse.json(repos);
}
