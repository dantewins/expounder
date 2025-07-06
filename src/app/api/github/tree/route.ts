import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface GitTreeItem {
    path: string;
    type: "blob" | "tree";
}

interface FileNode {
    path: string;
    type: "blob" | "tree";
    url?: string;
    children?: FileNode[];
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");
    if (!repoId) {
        return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
    }

    const token = (await cookies()).get("gh_token")?.value;
    const headers: HeadersInit = token
        ? { Authorization: `token ${token}`, "X-GitHub-Api-Version": "2022-11-28" }
        : {};

    const repoRes = await fetch(`https://api.github.com/repositories/${repoId}`, {
        headers,
    });
    if (!repoRes.ok) {
        return NextResponse.json(
            { error: "Could not load repo" },
            { status: repoRes.status }
        );
    }
    const repo = await repoRes.json();
    const { owner, name, default_branch } = {
        owner: repo.owner.login as string,
        name: repo.name as string,
        default_branch: repo.default_branch as string,
    };

    const branchRes = await fetch(
        `https://api.github.com/repos/${owner}/${name}/branches/${default_branch}`,
        { headers }
    );
    const branch = await branchRes.json();
    const treeSha: string = branch.commit.commit.tree.sha;


    const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${name}/git/trees/${treeSha}?recursive=1`,
        { headers }
    );
    const { tree } = (await treeRes.json()) as { tree: GitTreeItem[] };

    function buildNested(nodes: GitTreeItem[]): FileNode[] {
        const root: FileNode[] = [];
        const lookup = new Map<string, FileNode>();

        for (const entry of nodes) {
            const parts = entry.path.split("/");
            let parent: FileNode | undefined;

            parts.forEach((part, idx) => {
                const curPath = parts.slice(0, idx + 1).join("/");
                if (!lookup.has(curPath)) {
                    const isLeaf = idx === parts.length - 1;
                    const node: FileNode = {
                        path: curPath,
                        type: isLeaf ? entry.type : "tree",
                    };
                    if (isLeaf && entry.type === "blob") {
                        node.url = `https://raw.githubusercontent.com/${owner}/${name}/${default_branch}/${curPath}`;
                    }
                    lookup.set(curPath, node);
                    if (parent) {
                        (parent.children ??= []).push(node);
                    } else {
                        root.push(node);
                    }
                }
                parent = lookup.get(curPath);
            });
        }
        return root;
    }

    const nested = buildNested(
        tree.filter((n) => n.type === "tree" || n.type === "blob")
    );

    return NextResponse.json(nested);
}