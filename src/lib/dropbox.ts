// @/lib/dropbox.ts

import { NextResponse } from 'next/server';

async function refreshDropboxToken(): Promise<string | null> {
    if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.DROPBOX_APP_KEY || !process.env.DROPBOX_APP_SECRET) {
        console.error("Missing Dropbox refresh credentials");
        return null;
    }

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
    });

    try {
        const res = await fetch('https://api.dropbox.com/oauth2/token', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("Failed to refresh token:", err);
            return null;
        }

        const data = await res.json();
        return data.access_token;
    } catch (e) {
        console.error("Error refreshing token:", e);
        return null;
    }
}

export async function downloadFromDropbox(dropboxPath: string): Promise<NextResponse> {
    const token = await refreshDropboxToken();
    if (!token) {
        return NextResponse.json({ error: "Failed to obtain access token" }, { status: 500 });
    }

    try {
        const response = await fetch("https://content.dropboxapi.com/2/files/download", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
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
}

export async function deleteFromDropbox(dropboxPath: string): Promise<NextResponse> {
    const token = await refreshDropboxToken();
    if (!token) {
        return NextResponse.json({ error: "Failed to obtain access token" }, { status: 500 });
    }

    try {
        const response = await fetch("https://api.dropboxapi.com/2/files/delete_v2", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: dropboxPath,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Dropbox delete failed:", errorData);

            return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting from Dropbox:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function uploadToDropbox(dropboxPath: string, blob: Blob): Promise<boolean> {
    const token = await refreshDropboxToken();
    if (!token) {
        return false;
    }

    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: dropboxPath,
                    mode: 'overwrite',
                    autorename: true,
                    mute: false,
                }),
                'Content-Type': 'application/octet-stream',
            },
            body: blob,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Dropbox upload failed:', errorData);
            return false;
        }

        console.log('Successfully uploaded to Dropbox');
        return true;
    } catch (error) {
        console.error('Error during Dropbox upload:', error);
        return false;
    }
}

export async function listUserReadmesFromDropbox(userId: string): Promise<NextResponse> {
    const token = await refreshDropboxToken();
    if (!token) {
        return NextResponse.json({ error: "Failed to obtain access token" }, { status: 500 });
    }

    try {
        const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: "/expounder",
                recursive: false,
                limit: 2000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Dropbox list_folder failed:", errorData);

            return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
        }

        const { entries } = await response.json();

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
}