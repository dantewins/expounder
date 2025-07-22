import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { downloadFromDropbox } from "@/lib/dropbox";

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const timestamp = searchParams.get("timestamp");

    if (!owner || !repo || !timestamp) {
        return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
    }

    const dropboxPath = `/expounder/README\`${userId}\`${owner}\`${repo}\`${timestamp}.md`;

    return await downloadFromDropbox(dropboxPath);
}