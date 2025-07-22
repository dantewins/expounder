import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listUserReadmesFromDropbox } from "@/lib/dropbox";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return await listUserReadmesFromDropbox(userId);
}