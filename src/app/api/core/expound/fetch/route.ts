import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.DROPBOX_ACCESS_TOKEN) {
        try {
            const listResponse = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: "/expounder",
                    recursive: false,
                    limit: 2000,
                }),
            });

            if (!listResponse.ok) {
                const errorData = await listResponse.json();
                console.error("Dropbox list_folder failed:", errorData);
                return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
            }

            const { entries } = await listResponse.json();

            const userReadmes = entries
                .filter((entry: any) =>
                    entry[".tag"] === "file" &&
                    entry.name.startsWith(`README\`${userId}\``) &&
                    entry.name.endsWith(".md")
                )
                .map((entry: any) => {
                    const parts = entry.name.replace("README\`", "").replace(".md", "").split("\`");
                    const extractedUserId = parts.shift();
                    const owner = parts.shift();
                    const repo = parts.shift();
                    const timestamp = parts.pop();
                    return {
                        owner,
                        repo,
                        timestamp,
                        path: entry.path_lower,
                        name: entry.name,
                    };
                });

            return NextResponse.json({ readmes: userReadmes }, { status: 200 });
        } catch (error) {
            console.error("Error listing Dropbox files:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    } else {
        console.warn("DROPBOX_ACCESS_TOKEN not found. Skipping.");
        return NextResponse.json({ error: "Dropbox configuration missing" }, { status: 500 });
    }
}