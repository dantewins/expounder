import { Octokit } from "octokit";

export type Repo = {
    id: number;
    fullName: string;
    private: boolean;
    description: string | null;
    htmlUrl: string;
    updatedAt ?: string;
};

export async function listUserRepos(accessToken: string) {
    if (!accessToken) throw new Error("GitHub token missing");

    const octokit = new Octokit({ auth: accessToken });

    const repos = await octokit.paginate(
        octokit.rest.repos.listForAuthenticatedUser,
        { visibility: "all" }
    );

    return repos.map(r => ({
        id: r.id,
        fullName: r.full_name,
        private: r.private,
        description: r.description,
        htmlUrl: r.html_url,
        updatedAt: r.updated_at,
    }));
}

export async function getRepoReadme(accessToken: string, fullName: string) {
    const octokit = new Octokit({ auth: accessToken });
    const [owner, repo] = fullName.split("/");

    const { data } = await octokit.rest.repos.getReadme({ owner, repo });

    return Buffer.from(data.content, "base64").toString("utf8");
}
