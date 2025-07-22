import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cookieStore = await cookies();
    if (state !== cookieStore.get("gh_state")?.value)
        return NextResponse.redirect("/?error=bad_state");

    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code: code ?? "",
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/callback`,
        }),
    });
    const data = await res.json() as { access_token?: string; error?: string };

    if (!data.access_token)
        return NextResponse.redirect(`/?error=${data.error ?? "no_token"}`);

    (await cookies()).set("gh_token", data.access_token, {
        httpOnly: true, sameSite: "lax", path: "/",
        secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/expounds`);
}
