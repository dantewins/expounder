import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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

    if (process.env.DROPBOX_ACCESS_TOKEN) {
        try {
            const response = await fetch("https://content.dropboxapi.com/2/files/download", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                    "Dropbox-API-Arg": JSON.stringify({
                        path: dropboxPath,
                    }),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Dropbox download failed:", errorData);
                if (response.status === 409) {
                    return NextResponse.json({ error: "Expound not found" }, { status: 404 });
                }
                return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
            }

            const content = await response.text();
            return new NextResponse(content, {
                status: 200,
                headers: { "Content-Type": "text/markdown" },
            });
        } catch (error) {
            console.error("Error fetching from Dropbox:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    } else {
        console.warn("DROPBOX_ACCESS_TOKEN not found. Skipping.");
        return NextResponse.json({ error: "Dropbox configuration missing" }, { status: 500 });
    }
}