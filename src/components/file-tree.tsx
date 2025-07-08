"use client"

import clsx from "clsx";
import { Folder as FolderIcon, FileText as FileIcon } from "lucide-react";

export interface FileNode {
    path: string;
    type: "blob" | "tree";
    children?: FileNode[];
}

export function FileTree({ nodes, expanded, selectedPath, onToggle, onSelectFile, depth = 0 }: { nodes: FileNode[]; expanded: Set<string>; selectedPath: string | null; onToggle: (path: string) => void; onSelectFile: (node: FileNode) => void; depth?: number; }) {
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