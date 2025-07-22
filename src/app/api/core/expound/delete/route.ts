import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteFromDropbox } from "@/lib/dropbox";

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { owner, repo, timestamp } = body;
    if (!owner || !repo || !timestamp) {
        return NextResponse.json({ error: "Missing owner, repo, or timestamp" }, { status: 400 });
    }

    const dropboxPath = `/expounder/README\`${userId}\`${owner}\`${repo}\`${timestamp}.md`;

    return await deleteFromDropbox(dropboxPath);
}