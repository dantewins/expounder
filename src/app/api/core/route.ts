export const runtime = "edge";

export async function POST(req: Request) {
    const { commits } = await req.json();
    if (!Array.isArray(commits)) return Response.json([]);

    const summary = commits.map((msg: string, i: number) => {
        const first = msg.split("\n")[0];
        const [title, ...rest] = first.split(': ');
        return {
            title: title || `Commit ${i + 1}`,
            items: [rest.join(': ') || first],
        };
    });

    return Response.json(summary);
}