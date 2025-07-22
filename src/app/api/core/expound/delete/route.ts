import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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

    if (process.env.DROPBOX_ACCESS_TOKEN) {
        try {
            const deleteResponse = await fetch("https://api.dropboxapi.com/2/files/delete_v2", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: dropboxPath,
                }),
            });

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json();
                console.error("Dropbox delete failed:", errorData);
                return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
            }

            return NextResponse.json({ success: true }, { status: 200 });
        } catch (error) {
            console.error("Error deleting from Dropbox:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    } else {
        console.warn("DROPBOX_ACCESS_TOKEN not found. Skipping.");
        return NextResponse.json({ error: "Dropbox configuration missing" }, { status: 500 });
    }
}