export const runtime = "edge";
export async function POST(req: Request) {
    const { raw } = await req.json();         // for now we treat text as commits
    const commits = raw.split("\\n").filter(Boolean);
    return Response.json(commits);
}
