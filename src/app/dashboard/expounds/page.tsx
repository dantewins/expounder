"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Folder as FolderIcon,
  FileText as FileIcon,
} from "lucide-react";
import { Repo } from "@/lib/github";

interface FileNode {
  path: string;
  type: "blob" | "tree";
  children?: FileNode[];
}

interface SummaryBlock {
  title: string;
  items: string[];
}

function FileTree({
  nodes,
  expanded,
  selectedPath,
  onToggle,
  onSelectFile,
  depth = 0,
}: {
  nodes: FileNode[];
  expanded: Set<string>;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelectFile: (node: FileNode) => void;
  depth?: number;
}) {
  const ordered = [...nodes].sort((a, b) => {
    if (a.type === b.type) return a.path.localeCompare(b.path);
    return a.type === "tree" ? -1 : 1;
  });

  return (
    <ul className={clsx("text-sm font-mono", depth && "pl-2")}>
      {ordered.map((node) => {
        const name = node.path.split("/").pop();
        if (node.type === "tree") {
          const isOpen = expanded.has(node.path);
          return (
            <li key={node.path} className={depth ? "pl-2" : ''}>
              <button
                className="flex cursor-pointer items-center gap-1 select-none"
                onClick={() => onToggle(node.path)}
              >
                <FolderIcon className="h-4 w-4" /> {name}
              </button>
              {isOpen && node.children && (
                <FileTree
                  nodes={node.children}
                  expanded={expanded}
                  selectedPath={selectedPath}
                  onToggle={onToggle}
                  onSelectFile={onSelectFile}
                  depth={depth + 1}
                />
              )}
            </li>
          );
        }
        return (
          <li key={node.path} className={depth ? "pl-2" : ''}>
            <button
              className={clsx(
                "flex cursor-pointer items-center gap-1",
                selectedPath === node.path && "text-primary underline"
              )}
              onClick={() => onSelectFile(node)}
            >
              <FileIcon className="h-4 w-4" /> {name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function ExpoundsPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<string>();
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const [tree, setTree] = useState<FileNode[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileText, setFileText] = useState<string>("");

  const [summary, setSummary] = useState<SummaryBlock[] | null>(null);
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
    const res = await fetch(`/api/summarize?repoId=${selectedRepo.id}`);
    if (res.ok) setSummary(await res.json());
    setLoading(false);
  }

  function handleSave() {
    if (!summary || !selectedRepo) return;
    const notes = JSON.parse(localStorage.getItem("expounder_notes") || "[]");
    localStorage.setItem(
      "expounder_notes",
      JSON.stringify([...notes, { summary, date: Date.now(), repo: selectedRepo }])
    );
    window.location.href = "/dashboard";
  }

  return (
    <>
      <div className="px-4 lg:px-6">
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
      </div>
      {tree && (
        <div className="px-4 lg:px-6">
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
        </div>
      )}
      {selectedFile && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedFile.path}</CardTitle>
              <CardDescription>
                Read-only preview · {fileText.length.toLocaleString()} bytes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-mono max-h-[60vh] overflow-auto bg-muted/40 p-2 rounded">
                {fileText}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="px-4 lg:px-6">
        <Button onClick={handleGenerate} disabled={!selectedRepo || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate notes
        </Button>
        {summary && (
          <Button variant="secondary" onClick={handleSave}>
            Save to dashboard
          </Button>
        )}
      </div>
      {summary && (
        <section className="space-y-6 px-4 lg:px-6">
          {summary.map((block) => (
            <Card key={block.title} className="border-muted/50">
              <CardHeader>
                <CardTitle>{block.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
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