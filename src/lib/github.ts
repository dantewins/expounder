import { Octokit } from "octokit";

export type Repo = {
    id: number;
    fullName: string;
    private: boolean;
    description: string | null;
    htmlUrl: string;
    updatedAt: string | null;
};

// generates an Octokit instance with the provided token
function getOctokit(token: string) {
    if (!token) throw new Error("GitHub token missing");
    return new Octokit({ auth: token });
}

// returns a list of all repositories for a given authenticated user
export async function listUserRepos(token: string): Promise<Repo[]> {
    const octokit = getOctokit(token);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({ per_page: 100 });

    return data.map(r => ({
        id: r.id,
        fullName: r.full_name,
        private: r.private,
        description: r.description,
        htmlUrl: r.html_url,
        updatedAt: r.updated_at
    }));
}

// returns a repository's readme file content
export async function getRepoReadme(token: string, fullName: string) {
    const octokit = getOctokit(token);
    const [owner, repo] = fullName.split("/");
    const { data } = await octokit.rest.repos.getReadme({ owner, repo });
    return Buffer.from((data as any).content, "base64").toString("utf8");
}

// returns the raw content of a file in a given repository
export async function getRepoFileContent(token: string, owner: string, repo: string, path: string) {
    const octokit = getOctokit(token);
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, headers: { Accept: "application/vnd.github.raw" } });
    return data as any;
}

export interface FileNode {
    path: string;
    type: "blob" | "tree";
    url?: string;
    children?: FileNode[];
}

// returns a file tree for a given repository
export async function getRepoFileTree(token: string, repoId: string): Promise<FileNode[]> {
    const octokit = getOctokit(token);
    const repo = await octokit.request("GET /repositories/{repo_id}", { repo_id: Number(repoId) }).then(r => r.data);
    const { login: owner } = repo.owner;
    const { name, default_branch } = repo;
    const branch = await octokit.rest.repos.getBranch({ owner, repo: name, branch: default_branch });
    const treeSha = branch.data.commit.commit.tree.sha;
    const { data } = await octokit.rest.git.getTree({ owner, repo: name, tree_sha: treeSha, recursive: "1" });
    const tree = (data.tree as { path: string; type: "blob" | "tree" }[]).filter(n => n.type === "blob" || n.type === "tree");
    const root: FileNode[] = [];
    const lookup = new Map<string, FileNode>();
    for (const entry of tree) {
        const parts = entry.path.split("/");
        let parent: FileNode | undefined;
        parts.forEach((_, idx) => {
            const curPath = parts.slice(0, idx + 1).join("/");
            const isLeaf = idx === parts.length - 1;
            if (!lookup.has(curPath)) {
                const node: FileNode = { path: curPath, type: isLeaf ? entry.type : "tree" };
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