import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const state = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set("gh_state", state, { httpOnly: true, path: "/" });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/callback`,
        scope: "repo",
        state,
        allow_signup: "true",
    });

    return NextResponse.redirect(
        `https://github.com/login/oauth/authorize?${params}`
    );
}
