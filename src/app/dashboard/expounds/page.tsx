"use client";

import { JSX } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Repo } from "@/lib/github";
import { FileTree, FileNode } from "@/components/file-tree";
import { ReadmeBlock } from "@/lib/schemas";

function blocksToMarkdown(blocks: ReadmeBlock[]): string {
  return blocks
    .map(b => {
      switch (b.type) {
        case "heading": return `${"#".repeat(b.level)} ${b.text}\n`;
        case "paragraph": return `${b.text}\n`;
        case "list":
          return b.items
            .map((li, i) => `${b.ordered ? `${i + 1}.` : "-"} ${li}`)
            .join("\n") + "\n";
        case "code": return `\n\`\`\`${b.language || ""}\n${b.code}\n\`\`\`\n`;
        case "image": return `![${b.alt || ""}](${b.url})\n`;
        case "table":
          const header = `| ${b.headers.join(" | ")} |\n`;
          const sep = `| ${b.headers.map(() => "---").join(" | ")} |\n`;
          const rows = b.rows.map(r => `| ${r.join(" | ")} |`).join("\n") + "\n";
          return header + sep + rows;
        default: return "";
      }
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n"); // collapse extra blank lines
}

export default function ExpoundsPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const [tree, setTree] = useState<FileNode[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileText, setFileText] = useState<string>("");

  const [summary, setSummary] = useState<ReadmeBlock[] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/github/repos");
      setRepos(res.ok ? await res.json() : []);
    })();
  }, []);

  useEffect(() => {
    if (!selectedRepoId) return;
    const repo = repos?.find((r) => r.id.toString() === selectedRepoId) ?? null;
    setSelectedRepo(repo);
    setSummary(null);
    setTree(null);
    setSelectedFile(null);
    setFileText("");
    setExpanded(new Set());
    if (!repo) return;

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/github/tree?repoId=${repo.id}`);
      if (res.ok) setTree(await res.json());
      setLoading(false);
    })();
  }, [selectedRepoId, repos]);

  function toggleFolder(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  async function selectFile(node: FileNode) {
    if (!selectedRepo) return;
    setSelectedFile(node);
    setFileText("Loading…");
    const [owner, repo] = selectedRepo.fullName.split("/");
    const res = await fetch(
      `/api/github/file?repo=${repo}&path=${encodeURIComponent(node.path)}&owner=${owner}`
    );
    setFileText(res.ok ? await res.text() : "Unable to fetch file.");
  }

  async function handleGenerate() {
    if (!selectedRepo) return;
    setLoading(true);
    setSummary(null);
    const res = await fetch("/api/core/expound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerRepo: selectedRepo.fullName,
        description: selectedRepo.description || "",
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const blocks = json.blocks as ReadmeBlock[];
      setSummary(blocks);
      const markdown = blocksToMarkdown(blocks);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "README.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Select repository</CardTitle>
          <CardDescription>
            Pick a repo, browse its tree, preview files, then generate notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick a repository" />
            </SelectTrigger>
            <SelectContent>
              {repos === null ? (
                <div className="flex w-full items-center justify-center px-2 py-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : repos.length === 0 ? (
                <p className="px-4 py-2 text-sm">No repositories found.</p>
              ) : (
                repos.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id.toString()}>
                    {repo.fullName} {repo.private && "(private)"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedRepo && (
            <p className="text-sm text-muted-foreground">
              {selectedRepo.description || "No description provided."}
            </p>
          )}
        </CardContent>
      </Card>
      <div className={`grid grid-cols-1 ${selectedFile ? 'md:grid-cols-2' : ''} gap-4 ${!tree ? "hidden" : ""}`}>
        {tree && (
          <Card>
            <CardHeader>
              <CardTitle>Repository file tree</CardTitle>
              <CardDescription>Click a file to preview raw content.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileTree
                nodes={tree}
                expanded={expanded}
                selectedPath={selectedFile?.path ?? null}
                onToggle={toggleFolder}
                onSelectFile={selectFile}
              />
            </CardContent>
          </Card>
        )}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedFile.path}</CardTitle>
              <CardDescription>
                Read-only preview - {fileText.length.toLocaleString()} bytes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-mono max-h-[60vh] overflow-auto bg-muted/40 p-2 rounded">
                {fileText}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid w-full gap-2 md:inline-flex">
        <Button onClick={handleGenerate} disabled={!selectedRepo || loading} className="w-full lg:w-[150px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate notes
        </Button>
        {summary && (
          <Button variant="secondary" onClick={() => setPreviewOpen(!previewOpen)} className="w-full lg:w-[150px]">
            Preview
          </Button>
        )}
      </div>
      {summary && previewOpen && (
        <section className="space-y-6 ">
          {summary.map((block, idx) => {
            switch (block.type) {
              case "heading": {
                const H = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                  <H key={idx} className="font-semibold scroll-mt-20">
                    {block.text}
                  </H>
                );
              }
              case "paragraph":
                return (
                  <p key={idx} className="leading-relaxed">
                    {block.text}
                  </p>
                );
              case "list": {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag key={idx} className="list-inside list-disc space-y-1">
                    {block.items.map((li: string, j: number) => (
                      <li key={j}>{li}</li>
                    ))}
                  </ListTag>
                );
              }
              case "code":
                return (
                  <pre
                    key={idx}
                    className="rounded bg-muted/40 p-3 overflow-auto text-sm font-mono"
                  >
                    <code className={`language-${block.language}`}>{block.code}</code>
                  </pre>
                );
              case "image":
                return (
                  <figure key={idx} className="flex flex-col items-center gap-1">
                    <img
                      src={block.url}
                      alt={block.alt}
                      className="max-w-full rounded"
                    />
                    {block.alt && (
                      <figcaption className="text-sm text-muted-foreground">
                        {block.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              case "table":
                return (
                  <div key={idx} className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr>
                          {block.headers.map((h: string, j: number) => (
                            <th
                              key={j}
                              className="border px-2 py-1 font-medium text-left"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row: string[], r: number) => (
                          <tr key={r}>
                            {row.map((cell: string, c: number) => (
                              <td key={c} className="border px-2 py-1">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              default:
                return null;
            }
          })}
        </section>
      )}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </>
  );
}